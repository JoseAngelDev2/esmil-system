import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { useCart, BUSINESS } from "@/store/cart";
import { AddressPicker } from "@/components/AddressPicker";
import { createOrder } from "@/services/catalog";

export const Route = createFileRoute("/reservar")({
  head: () => ({
    meta: [
      { title: "Reservar pedido — EsmilDelicias" },
      {
        name: "description",
        content: "Confirma tu pedido por WhatsApp. Elige fecha y hora de entrega o recogida.",
      },
    ],
  }),
  component: Reservar,
});

const formSchema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(80),
  phone: z.string().trim().min(7, "Teléfono inválido").max(20),
  address: z.string().trim().min(5, "Dirección requerida").max(200),
  date: z.string().min(1, "Selecciona una fecha"),
  time: z.string().min(1, "Selecciona una hora"),
  mode: z.enum(["entrega", "recogida"]),
  notes: z.string().max(300).optional(),
});

function Reservar() {
  const { items, setQuantity, remove, clear, totalPrice } = useCart();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    date: "",
    time: "",
    mode: "entrega" as "entrega" | "recogida",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }
    const result = formSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    const msg = [
      `\u00a1Hola ${BUSINESS.name}! \u{1F36D} Quiero reservar este pedido:`,
      ``,
      ...items.map(
        (i) =>
          `\u2022 ${i.quantity}x ${i.name} \u2014 RD$${(i.price * i.quantity).toFixed(2)}`
      ),
      ``,
      `*Total: RD$${totalPrice().toFixed(2)}*`,
      ``,
      `\u{1F464} Nombre: ${form.name}`,
      `\u{1F4DE} Tel\u00e9fono: ${form.phone}`,
      `\u{1F4CD} Direcci\u00f3n: ${form.address}`,
      `\u{1F69A} Modalidad: ${form.mode}`,
      `\u{1F4C5} Fecha: ${form.date}`,
      `\u23F0 Hora: ${form.time}`,
      ...(form.notes ? [`\u{1F4DD} Notas: ${form.notes}`] : []),
    ].join("\n");

    try {
      await createOrder({
        cliente: form.name,
        telefono: form.phone,
        productos: items.map((item) => ({
          producto: item.id,
          cantidad: item.quantity,
        })),
        fecha: form.date,
        hora: form.time,
        notas: [
          `Direccion: ${form.address}`,
          `Modalidad: ${form.mode}`,
          form.notes ? `Notas: ${form.notes}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      });
      toast.success("Pedido registrado en el dashboard");
    } catch {
      toast.warning(
        "No se pudo registrar en el dashboard, pero puedes enviarlo por WhatsApp"
      );
    }

    const url = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Layout>
      <section className="bg-gradient-warm py-12">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <h1 className="font-display text-4xl md:text-5xl font-bold">Reservar pedido</h1>
          <p className="mt-2 text-primary-foreground/90">Revisa tu carrito y completa tus datos</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">
        {/* Carrito */}
        <div className="lg:col-span-2 bg-card rounded-3xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold">Tu carrito</h2>
            {items.length > 0 && (
              <button onClick={clear} className="text-sm text-destructive hover:underline">
                Vaciar
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-5xl mb-3">🛒</p>
              <p>Aún no tienes productos. Visita el catálogo.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="py-4 flex items-center gap-3">
                  <div className="size-14 rounded-xl bg-gradient-warm flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      item.emoji
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">RD${item.price}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-secondary rounded-full p-1">
                    <button
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      className="size-7 rounded-full bg-background flex items-center justify-center hover:bg-accent hover:text-accent-foreground"
                      aria-label="Restar"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      className="size-7 rounded-full bg-background flex items-center justify-center hover:bg-accent hover:text-accent-foreground"
                      aria-label="Sumar"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                  <p className="font-bold text-primary w-20 text-right">
                    RD${(item.price * item.quantity).toFixed(0)}
                  </p>
                  <button
                    onClick={() => remove(item.id)}
                    className="text-muted-foreground hover:text-destructive p-1"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 && (
            <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
              <span className="font-display text-lg">Total</span>
              <span className="font-display text-2xl font-bold text-primary">
                RD${totalPrice().toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-3xl shadow-soft p-6 space-y-4 h-fit lg:sticky lg:top-20"
        >
          <h2 className="font-display text-2xl font-bold">Tus datos</h2>

          <div>
            <label className="text-sm font-semibold">Nombre completo</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="María Pérez"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Teléfono</label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="809-000-0000"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Dirección</label>
            <div className="mt-1">
              <AddressPicker
                value={form.address}
                onChange={(address: string) => setForm({ ...form, address })}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Escribe, busca en el mapa o usa una guardada.
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold">Modalidad</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(["entrega", "recogida"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm({ ...form, mode: m })}
                  className={`rounded-xl py-2.5 font-semibold text-sm capitalize transition-colors ${
                    form.mode === m
                      ? "bg-gradient-fire text-primary-foreground shadow-soft"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Fecha</label>
              <input
                type="date"
                required
                value={form.date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Hora</label>
              <input
                type="time"
                required
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">Notas (opcional)</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Referencia, instrucciones..."
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3.5 rounded-full font-bold shadow-warm hover-lift"
          >
            <MessageCircle className="size-5" />
            Confirmar por WhatsApp
          </button>
          <p className="text-xs text-muted-foreground text-center">
            Te abriremos WhatsApp con tu pedido listo para enviar.
          </p>
        </form>
      </section>
    </Layout>
  );
}
