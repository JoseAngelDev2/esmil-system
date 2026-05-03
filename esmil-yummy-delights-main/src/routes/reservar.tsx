import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
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
        content: "Confirma tu pedido por WhatsApp. Elige fecha de entrega o recogida.",
      },
    ],
  }),
  component: Reservar,
});

const formSchema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(80),
  phone: z.string().trim().min(7, "Teléfono inválido").max(20),
  address: z.string().trim().min(5, "Dirección requerida").max(200),
  mode: z.enum(["entrega", "recogida"]),
  notes: z.string().max(300).optional(),
});

function getNow() {
  const now = new Date();
  return {
    date: now.toISOString().split("T")[0],
    hora: now.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" }),
  };
}

function Reservar() {
  const { items, setQuantity, remove, clear, totalPrice } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    mode: "entrega" as "entrega" | "recogida",
    notes: "",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  const submitOrder = async () => {
    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }

    const result = formSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    const { date, hora } = getNow();

    const msg = [
      `¡Hola ${BUSINESS.name}! 🍭 Quiero reservar este pedido:`,
      ``,
      ...items.map(
        (i) => `• ${i.quantity}x ${i.name} — RD$${(i.price * i.quantity).toFixed(2)}`
      ),
      ``,
      `*Total: RD$${totalPrice().toFixed(2)}*`,
      ``,
      `👤 Nombre: ${form.name}`,
      `📞 Teléfono: ${form.phone}`,
      `📍 Dirección: ${form.address}`,
      `🚚 Modalidad: ${form.mode}`,
      `📅 Fecha: ${date}`,
      `⏰ Hora: ${hora}`,
      ...(form.notes ? [`📝 Notas: ${form.notes}`] : []),
    ].join("\n");

    const cleanMsg = msg.normalize("NFC");
    const url = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURI(cleanMsg)}`;

    // 🔥 FIX SAFARI: abrir ventana antes del await
    const whatsappWindow = window.open("", "_blank", "noopener,noreferrer");

    try {
      await createOrder({
        cliente: form.name,
        telefono: form.phone,
        productos: items.map((item) => ({
          producto: item.id,
          cantidad: item.quantity,
        })),
        fecha: date,
        hora: hora,
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
      toast.warning("No se pudo registrar en el dashboard, pero puedes enviarlo por WhatsApp");
    }

    clear();

    if (whatsappWindow) {
      whatsappWindow.location.href = url;
    } else {
      window.location.href = url;
    }
  };

  return (
    <Layout>
      <section className="bg-gradient-warm py-12">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <h1 className="font-display text-4xl md:text-5xl font-bold">
            Reservar pedido
          </h1>
          <p className="mt-2 text-primary-foreground/90">
            Revisa tu carrito y completa tus datos
          </p>
        </div>
      </section>

      {/* Espacio extra abajo para que la barra fija no tape contenido */}
      <section className="container mx-auto px-4 py-10 pb-32 grid lg:grid-cols-3 gap-8">

        {/* Carrito */}
        <div className="lg:col-span-2 bg-card rounded-3xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold">Tu carrito</h2>
            {items.length > 0 && (
              <button
                onClick={clear}
                className="text-sm text-destructive hover:underline"
              >
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
                      className="size-8 rounded-full bg-background flex items-center justify-center hover:bg-accent hover:text-accent-foreground"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-7 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      className="size-8 rounded-full bg-background flex items-center justify-center hover:bg-accent hover:text-accent-foreground"
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
          onSubmit={(e) => {
            e.preventDefault();
            setConfirmOpen(true);
          }}
          className="bg-card rounded-3xl shadow-soft p-6 space-y-4 h-fit lg:sticky lg:top-20"
        >
          <h2 className="font-display text-2xl font-bold">Tus datos</h2>

          <input
            type="text"
            required
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 rounded-xl border text-base"
          />

          <input
            type="tel"
            required
            placeholder="Teléfono"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full p-3 rounded-xl border text-base"
          />

          <AddressPicker
            value={form.address}
            onChange={(address) => setForm({ ...form, address })}
          />

          {/* Modo entrega/recogida */}
          <div className="grid grid-cols-2 gap-2">
            {(["entrega", "recogida"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setForm({ ...form, mode: m })}
                className={`py-3 rounded-xl text-base font-semibold border-2 transition-all ${
                  form.mode === m
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary text-secondary-foreground"
                }`}
              >
                {m === "entrega" ? "🚚 Entrega" : "🏪 Recogida"}
              </button>
            ))}
          </div>

          <textarea
            placeholder="Notas (opcional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full p-3 rounded-xl border text-base resize-none"
          />

          {/* Botón dentro del form — visible en desktop */}
          <button
            type="submit"
            className="hidden lg:flex w-full items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-full font-bold text-base"
          >
            Confirmar por WhatsApp 💬
          </button>
        </form>
      </section>

      {/* ── BARRA FIJA INFERIOR (tipo navbar) — siempre visible en móvil ── */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center gap-4 lg:hidden">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground leading-none mb-0.5">Total</p>
          <p className="font-display text-xl font-bold text-primary">
            RD${totalPrice().toFixed(2)}
          </p>
        </div>
        <button
          onClick={() => {
            const result = formSchema.safeParse(form);
            if (items.length === 0) {
              toast.error("Tu carrito está vacío");
              return;
            }
            if (!result.success) {
              toast.error(result.error.issues[0].message);
              return;
            }
            setConfirmOpen(true);
          }}
          className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold text-base active:scale-95 transition-transform"
        >
          Confirmar 💬
        </button>
      </div>

      {/* Modal de confirmación */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-6">
            <h3 className="text-lg font-bold text-center mb-2">
              Confirmar pedido
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              ¿Estás seguro de realizar esta reserva?
            </p>
            <p className="text-center font-bold text-xl mb-4">
              RD${totalPrice().toFixed(2)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-3 rounded-full bg-secondary font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setConfirmOpen(false);
                  await submitOrder();
                }}
                className="flex-1 py-3 rounded-full bg-[#25D366] text-white font-bold"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
