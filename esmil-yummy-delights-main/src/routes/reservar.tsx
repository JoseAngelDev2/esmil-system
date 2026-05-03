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

    const msg = [
      `¡Hola ${BUSINESS.name}! 🍭`,
      `Quiero reservar este pedido:\n`,
      ...items.map(
        (i) =>
          `• ${i.quantity}x ${i.name} — RD$${(
            i.price * i.quantity
          ).toFixed(2)}`
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

    // ✅ FIX SAFARI
    const whatsappWindow = window.open("", "_blank");

    try {
      await createOrder({
        cliente: form.name,
        telefono: form.phone,
        productos: items.map((item) => ({
          producto: item.id,
          cantidad: item.quantity,
        })),
        fecha: form.date,
        notas: `${form.address} | ${form.mode} | ${form.notes || ""}`,
      });

      toast.success("Pedido guardado");
    } catch {
      toast.warning("Solo se enviará por WhatsApp");
    }

    if (whatsappWindow) {
      whatsappWindow.location.href = url;
    } else {
      window.location.href = url;
    }
  };

  return (
    <Layout>
      <section className="container mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">
        
        {/* CARRITO */}
        <div className="lg:col-span-2 bg-card rounded-3xl p-6">
          <h2 className="text-2xl font-bold mb-4">Carrito</h2>

          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              <div className="text-2xl">
                {item.emoji}
              </div>

              <div className="flex-1">
                <p>{item.name}</p>
                <p>RD${item.price}</p>
              </div>

              <button onClick={() => setQuantity(item.id, item.quantity - 1)}>
                <Minus />
              </button>

              <span>{item.quantity}</span>

              <button onClick={() => setQuantity(item.id, item.quantity + 1)}>
                <Plus />
              </button>

              <button onClick={() => remove(item.id)}>
                <Trash2 />
              </button>
            </div>
          ))}

          <div className="mt-4 font-bold">
            Total: RD${totalPrice().toFixed(2)}
          </div>
        </div>

        {/* FORMULARIO */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setConfirmOpen(true);
          }}
          className="bg-card rounded-3xl p-6 space-y-4"
        >
          <h2 className="text-xl font-bold">Datos</h2>

          <input
            placeholder="Nombre"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full border p-2"
          />

          <input
            placeholder="Teléfono"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            className="w-full border p-2"
          />

          <AddressPicker
            value={form.address}
            onChange={(address: string) =>
              setForm({ ...form, address })
            }
          />

          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm({ ...form, date: e.target.value })
            }
            className="w-full border p-2"
          />

          <textarea
            placeholder="Notas"
            value={form.notes}
            onChange={(e) =>
              setForm({ ...form, notes: e.target.value })
            }
            className="w-full border p-2"
          />

          <button className="w-full bg-green-500 text-white py-3 rounded">
            Enviar por WhatsApp
          </button>
        </form>
      </section>

      {/* MODAL */}
      {confirmOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50">
          <div className="bg-white p-6 rounded">
            <p>Total: RD${totalPrice().toFixed(2)}</p>

            <button onClick={() => setConfirmOpen(false)}>
              Cancelar
            </button>

            <button
              onClick={async () => {
                setConfirmOpen(false);
                await submitOrder();
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
