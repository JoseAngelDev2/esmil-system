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
        content:
          "Confirma tu pedido por WhatsApp. Elige fecha de entrega o recogida.",
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
      `Hola ${BUSINESS.name}!`,
      `Quiero reservar este pedido:`,
      ``,
      ...items.map(
        (i) =>
          `- ${i.quantity}x ${i.name} RD$${(
            i.price * i.quantity
          ).toFixed(2)}`
      ),
      ``,
      `Total: RD$${totalPrice().toFixed(2)}`,
      ``,
      `Nombre: ${form.name}`,
      `Telefono: ${form.phone}`,
      `Direccion: ${form.address}`,
      `Modalidad: ${form.mode}`,
      `Fecha: ${form.date}`,
      ...(form.notes ? [`Notas: ${form.notes}`] : []),
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
        fecha: form.date,
        notas: `Direccion: ${form.address}\nModalidad: ${form.mode}\n${form.notes || ""}`,
      });

      toast.success("Pedido registrado");
    } catch {
      toast.warning("No se guardó, pero puedes enviarlo");
    }

    if (whatsappWindow) {
      whatsappWindow.location.href = url;
    } else {
      window.location.href = url;
    }
  };

  return (
    <Layout>
      <section className="bg-gradient-warm py-12 text-center text-white">
        <h1 className="text-4xl font-bold">Reservar pedido</h1>
        <p>Revisa tu carrito y completa tus datos</p>
      </section>

      <section className="container mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">
        {/* Carrito */}
        <div className="lg:col-span-2 bg-card rounded-3xl p-6">
          <h2 className="text-2xl font-bold mb-4">Tu carrito</h2>

          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              <div className="text-2xl">{item.emoji}</div>

              <div className="flex-1">
                <p>{item.name}</p>
                <p>RD${item.price}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setQuantity(item.id, item.quantity - 1)}>
                  <Minus />
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => setQuantity(item.id, item.quantity + 1)}>
                  <Plus />
                </button>
              </div>

              <button onClick={() => remove(item.id)}>
                <Trash2 />
              </button>
            </div>
          ))}

          <p className="font-bold mt-4">
            Total: RD${totalPrice().toFixed(2)}
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setConfirmOpen(true);
          }}
          className="bg-card rounded-3xl p-6 space-y-4"
        >
          <h2 className="text-2xl font-bold">Tus datos</h2>

          <input
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border p-2 rounded"
          />

          <input
            placeholder="Teléfono"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border p-2 rounded"
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
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full border p-2 rounded"
          />

          <textarea
            placeholder="Notas"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border p-2 rounded"
          />

          <button className="w-full bg-green-500 text-white py-3 rounded-full">
            Confirmar por WhatsApp
          </button>
        </form>
      </section>

      {/* MODAL */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center">
          <div className="bg-white p-6 rounded-t-3xl w-full max-w-md">
            <p className="text-center mb-4">
              ¿Confirmar pedido?
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 bg-gray-200 p-3 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={submitOrder}
                className="flex-1 bg-green-500 text-white p-3 rounded"
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
