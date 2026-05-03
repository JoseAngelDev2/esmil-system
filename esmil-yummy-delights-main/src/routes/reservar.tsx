import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingCart, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
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
        content: "Confirma tu pedido por WhatsApp.",
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
  mode: z.enum(["entrega", "recogida"]),
  notes: z.string().max(300).optional(),
});

/* ─── Step indicator ─── */
function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < step
              ? "w-8 h-4 bg-green-500"
              : i === step
              ? "w-4 h-4 bg-green-500"
              : "w-4 h-4 bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

/* ─── Big labeled input ─── */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xl font-semibold text-gray-700">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border-2 border-gray-300 rounded-2xl px-5 py-4 text-xl focus:border-green-500 focus:outline-none transition-colors";

/* ─── Main component ─── */
function Reservar() {
  const { items, setQuantity, remove, clear, totalPrice } = useCart();

  const [step, setStep] = useState(0); // 0 = carrito, 1 = datos, 2 = confirmar
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" }),
    mode: "entrega" as "entrega" | "recogida",
    notes: "",
  });

  /* ── helpers ── */
  const goNext = () => {
    if (step === 0 && items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }
    if (step === 1) {
      const result = formSchema.safeParse(form);
      if (!result.success) {
        toast.error(result.error.issues[0].message);
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 2));
  };

  const submitOrder = async () => {
    const msg = [
      `¡Hola ${BUSINESS.name}! 🍭 Quiero reservar este pedido:`,
      ``,
      ...items.map(
        (i) =>
          `• ${i.quantity}x ${i.name} — RD$${(i.price * i.quantity).toFixed(2)}`
      ),
      ``,
      `*Total: RD$${totalPrice().toFixed(2)}*`,
      ``,
      `👤 Nombre: ${form.name}`,
      `📞 Teléfono: ${form.phone}`,
      `📍 Dirección: ${form.address}`,
      `🚚 Modalidad: ${form.mode}`,
      `📅 Fecha: ${form.date}`,
      `⏰ Hora: ${form.time}`,
      ...(form.notes ? [`📝 Notas: ${form.notes}`] : []),
    ].join("\n");

    const url = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(msg)}`;

    // Safari fix: open window synchronously BEFORE any await
    const waWindow = window.open("", "_blank");

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

    clear();

    if (waWindow) {
      waWindow.location.href = url;
    } else {
      window.location.href = url;
    }
  };

  /* ── Step labels ── */
  const stepLabels = ["🛒 Carrito", "📋 Mis datos", "✅ Confirmar"];

  return (
    <Layout>
      {/* Header de paso */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          {stepLabels[step]}
        </h1>
        <StepDots step={step} total={3} />
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg">

        {/* ───────── PASO 0: CARRITO ───────── */}
        {step === 0 && (
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="mx-auto mb-4 text-gray-300" size={64} />
                <p className="text-2xl text-gray-400 font-medium">
                  Tu carrito está vacío
                </p>
                <p className="text-lg text-gray-400 mt-2">
                  Agrega productos para continuar
                </p>
              </div>
            ) : (
              <>
                {/* Tarjetas de producto */}
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border-2 border-gray-100 rounded-3xl p-5 flex items-center gap-4 shadow-sm"
                  >
                    {/* Emoji */}
                    <div className="text-5xl flex-shrink-0 w-16 text-center">
                      {item.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xl font-bold text-gray-800 leading-tight truncate">
                        {item.name}
                      </p>
                      <p className="text-lg text-green-600 font-semibold mt-1">
                        RD${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Controles cantidad */}
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        className="w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center active:scale-95 transition-transform"
                        aria-label="Agregar uno"
                      >
                        <Plus size={24} />
                      </button>

                      <span className="text-2xl font-bold text-gray-800 w-8 text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          item.quantity > 1
                            ? setQuantity(item.id, item.quantity - 1)
                            : remove(item.id)
                        }
                        className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center active:scale-95 transition-transform"
                        aria-label="Quitar uno"
                      >
                        {item.quantity === 1 ? (
                          <Trash2 size={20} className="text-red-400" />
                        ) : (
                          <Minus size={24} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-5 flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-700">Total</span>
                  <span className="text-3xl font-bold text-green-600">
                    RD${totalPrice().toFixed(2)}
                  </span>
                </div>
              </>
            )}

            {/* Botón continuar */}
            <button
              onClick={goNext}
              disabled={items.length === 0}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-2xl font-bold py-5 rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all mt-4"
            >
              Continuar
              <ChevronRight size={28} />
            </button>
          </div>
        )}

        {/* ───────── PASO 1: DATOS ───────── */}
        {step === 1 && (
          <div className="space-y-6">
            <Field label="Tu nombre">
              <input
                type="text"
                placeholder="Ej: María González"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
                autoComplete="name"
              />
            </Field>

            <Field label="Tu teléfono">
              <input
                type="tel"
                placeholder="Ej: 809-555-1234"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputCls}
                autoComplete="tel"
              />
            </Field>

            <Field label="Dirección de entrega">
              <AddressPicker
                value={form.address}
                onChange={(address: string) => setForm({ ...form, address })}
              />
            </Field>

            {/* Modo entrega/recogida */}
            <Field label="¿Cómo recibirás tu pedido?">
              <div className="grid grid-cols-2 gap-3">
                {(["entrega", "recogida"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setForm({ ...form, mode: m })}
                    className={`py-5 rounded-2xl text-xl font-bold border-2 transition-all active:scale-95 ${
                      form.mode === m
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    {m === "entrega" ? "🚚 Entrega" : "🏪 Recogida"}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Notas (opcional)">
              <textarea
                placeholder="Alergias, instrucciones especiales..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </Field>

            {/* Navegación */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(0)}
                className="flex-1 bg-gray-100 text-gray-700 text-xl font-bold py-5 rounded-3xl flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <ChevronLeft size={24} />
                Volver
              </button>
              <button
                onClick={goNext}
                className="flex-[2] bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-5 rounded-3xl flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                Revisar pedido
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        )}

        {/* ───────── PASO 2: CONFIRMAR ───────── */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Icono confirmación */}
            <div className="text-center py-4">
              <CheckCircle className="mx-auto text-green-500 mb-3" size={64} />
              <p className="text-2xl font-bold text-gray-800">
                ¿Todo está correcto?
              </p>
              <p className="text-lg text-gray-500 mt-1">
                Revisa tu pedido antes de enviarlo
              </p>
            </div>

            {/* Resumen productos */}
            <div className="bg-white border-2 border-gray-100 rounded-3xl p-5 space-y-3">
              <p className="text-lg font-bold text-gray-500 uppercase tracking-wide">
                Productos
              </p>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="text-xl text-gray-800">
                    {item.emoji} {item.quantity}× {item.name}
                  </span>
                  <span className="text-xl font-semibold text-gray-700">
                    RD${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t-2 border-gray-100 pt-3 flex justify-between items-center">
                <span className="text-xl font-bold text-gray-700">Total</span>
                <span className="text-2xl font-bold text-green-600">
                  RD${totalPrice().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Resumen datos */}
            <div className="bg-white border-2 border-gray-100 rounded-3xl p-5 space-y-3">
              <p className="text-lg font-bold text-gray-500 uppercase tracking-wide">
                Tus datos
              </p>
              {[
                { icon: "👤", val: form.name },
                { icon: "📞", val: form.phone },
                { icon: "📍", val: form.address },
                { icon: "🚚", val: form.mode === "entrega" ? "Entrega a domicilio" : "Recogida en local" },
                ...(form.notes ? [{ icon: "📝", val: form.notes }] : []),
              ].map(({ icon, val }) => (
                <div key={icon} className="flex gap-3 items-start">
                  <span className="text-2xl leading-tight">{icon}</span>
                  <span className="text-xl text-gray-700">{val}</span>
                </div>
              ))}
            </div>

            {/* Botón editar */}
            <button
              onClick={() => setStep(1)}
              className="w-full bg-gray-100 text-gray-700 text-xl font-bold py-4 rounded-3xl active:scale-95 transition-all"
            >
              ✏️ Editar datos
            </button>

            {/* Botón enviar WhatsApp */}
            <button
              onClick={submitOrder}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-2xl font-bold py-6 rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-green-200"
            >
              <span>Enviar por WhatsApp</span>
              <span className="text-3xl">💬</span>
            </button>

            <p className="text-center text-base text-gray-400">
              Se abrirá WhatsApp con tu pedido listo para enviar
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
