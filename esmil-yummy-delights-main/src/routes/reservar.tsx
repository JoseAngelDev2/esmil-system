import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
} from "lucide-react";
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
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20),
  address: z.string().trim().min(5).max(200),
  date: z.string().min(1),
  time: z.string().min(1), // 👈 requerido pero oculto
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

/* ─── Field ─── */
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

/* ─── MAIN ─── */
function Reservar() {
  const { items, setQuantity, remove, clear, totalPrice } = useCart();

  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    date: "",
    time: "12:00", // 👈 HORA FAKE
    mode: "entrega" as "entrega" | "recogida",
    notes: "",
  });

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
      `¡Hola ${BUSINESS.name}! 🍭`,
      `Quiero reservar este pedido:\n`,
      ...items.map(
        (i) =>
          `• ${i.quantity}x ${i.name} — RD$${(i.price * i.quantity).toFixed(2)}`
      ),
      `\n*Total: RD$${totalPrice().toFixed(2)}*`,
      `\n👤 ${form.name}`,
      `📞 ${form.phone}`,
      `📍 ${form.address}`,
      `🚚 ${form.mode}`,
      `📅 ${form.date}`,
      ...(form.notes ? [`📝 ${form.notes}`] : []),
    ].join("\n");

    const url = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(
      msg
    )}`;

    const whatsappWindow = window.open("", "_blank");

    try {
      await createOrder({
        cliente: form.name,
        telefono: form.phone,
        productos: items.map((item) => ({
          producto: item.id,
          cantidad: item.quantity,
        })),
        fecha: `${form.date} ${form.time}`, // 👈 FIX BACKEND
        notas: [
          `Dirección: ${form.address}`,
          `Modalidad: ${form.mode}`,
          form.notes ? `Notas: ${form.notes}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      });

      toast.success("Pedido guardado");
    } catch {
      toast.warning("Solo se enviará por WhatsApp");
    }

    clear();

    if (whatsappWindow) {
      whatsappWindow.location.href = url;
    } else {
      window.location.href = url;
    }
  };

  const stepLabels = ["🛒 Carrito", "📋 Mis datos", "✅ Confirmar"];

  return (
    <Layout>
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          {stepLabels[step]}
        </h1>
        <StepDots step={step} total={3} />
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg">

        {/* PASO 0 */}
        {step === 0 && (
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="mx-auto mb-4 text-gray-300" size={64} />
                <p className="text-2xl text-gray-400">Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-3xl p-5 flex gap-4">
                    <div className="text-5xl">{item.emoji}</div>
                    <div className="flex-1">
                      <p className="text-xl font-bold">{item.name}</p>
                      <p className="text-green-600">
                        RD${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="bg-green-50 p-5 rounded-3xl flex justify-between">
                  <span>Total</span>
                  <span>RD${totalPrice().toFixed(2)}</span>
                </div>
              </>
            )}

            <button onClick={goNext} className="w-full bg-green-500 text-white py-5 rounded-3xl">
              Continuar
            </button>
          </div>
        )}

        {/* PASO 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <Field label="Tu nombre">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Teléfono">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Dirección">
              <AddressPicker
                value={form.address}
                onChange={(address: string) =>
                  setForm({ ...form, address })
                }
              />
            </Field>

            <Field label="Fecha">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputCls}
              />
            </Field>

            <button onClick={goNext} className="w-full bg-green-500 text-white py-5 rounded-3xl">
              Continuar
            </button>
          </div>
        )}

        {/* PASO 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <CheckCircle className="mx-auto text-green-500" size={60} />

            <button
              onClick={submitOrder}
              className="w-full bg-green-500 text-white py-6 rounded-3xl"
            >
              Enviar por WhatsApp
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
