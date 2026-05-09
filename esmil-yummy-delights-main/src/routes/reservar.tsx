import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { useCart, BUSINESS } from "@/store/cart";
import { AddressPicker } from "@/components/AddressPicker";
import { createOrder } from "@/services/catalog";

// Emojis como constantes Unicode — máxima compatibilidad cross-browser/OS
const E = {
  person: "\u{1F464}",
  phone: "\u{1F4DE}",
  pin: "\u{1F4CD}",
  truck: "\u{1F69A}",
  store: "\u{1F3EA}",
  notes: "\u{1F4DD}",
  chat: "\u{1F4AC}",
  pencil: "\u{270F}\uFE0F",
  cart: "\u{1F6D2}",
  candy: "\u{1F36D}",
  clock: "\u{23F0}",
  calendar: "\u{1F4C5}",
};

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
    hora: now.toLocaleTimeString("es-DO", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="text-lg font-semibold text-foreground"
      >
        {label}
      </label>

      {children}
    </div>
  );
}

const inputCls =
  "w-full border-2 border-border rounded-2xl px-4 py-4 text-lg bg-background focus:border-primary focus:outline-none transition-colors";

function Reservar() {
  const { items, setQuantity, remove, clear, totalPrice } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    mode: "entrega" as "entrega" | "recogida",
    notes: "",
  });

  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleOpenForm = () => {
    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }
    setFormOpen(true);
  };

  const handleFormSubmit = () => {
    const result = formSchema.safeParse(form);

    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setFormOpen(false);
    setConfirmOpen(true);
  };

  const handleDecrement = (
    id: string,
    currentQty: number,
    minQty = 1
  ) => {
    const next = currentQty - 1;

    if (next < minQty || next <= 0) {
      remove(id);
    } else {
      setQuantity(id, next);
    }
  };

  const handleIncrement = (id: string, currentQty: number) => {
    setQuantity(id, currentQty + 1);
  };

  const submitOrder = async () => {
    const { date, hora } = getNow();

    const msg = [
      `¡Hola ${BUSINESS.name}! ${E.candy} Quiero reservar este pedido:`,
      ``,
      ...items.map(
        (i) =>
          `• ${i.quantity}x ${i.name} — RD$${(
            i.price * i.quantity
          ).toFixed(2)}`
      ),
      ``,
      `*Total: RD$${totalPrice().toFixed(2)}*`,
      ``,
      `${E.person} Nombre: ${form.name}`,
      `${E.phone} Teléfono: ${form.phone}`,
      `${E.pin} Dirección: ${form.address}`,
      `${E.truck} Modalidad: ${form.mode}`,
      `${E.calendar} Fecha: ${date}`,
      `${E.clock} Hora: ${hora}`,
      ...(form.notes ? [`${E.notes} Notas: ${form.notes}`] : []),
    ].join("\n");

    const cleanMsg = msg.normalize("NFC");

    const url = `https://wa.me/${
      BUSINESS.whatsapp
    }?text=${encodeURIComponent(cleanMsg)}`;

    let whatsappWindow: Window | null = null;

    try {
      whatsappWindow = window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    } catch {
      // popup bloqueado
    }

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
      toast.warning(
        "No se pudo registrar, pero puedes enviarlo por WhatsApp"
      );
    }

    clear();

    if (whatsappWindow && !whatsappWindow.closed) {
      whatsappWindow.location.href = url;
    } else {
      window.location.href = url;
    }
  };

  return (
    <Layout>
      {/* Banner */}
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

      {/* Carrito */}
      <section className="container mx-auto px-4 py-10 pb-32 max-w-2xl">
        <div className="bg-card rounded-3xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold">
              Tu carrito
            </h2>

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
              <p className="text-5xl mb-3">{E.cart}</p>
              <p>Aún no tienes productos. Visita el catálogo.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="py-4 flex items-center gap-3"
                >
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
                    <p className="font-semibold truncate">
                      {item.name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      RD${item.price}
                    </p>

                    {item.minQty && item.minQty > 1 && (
                      <p className="text-xs text-amber-600 font-medium mt-0.5">
                        Mín. {item.minQty} unidades
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 bg-secondary rounded-full p-1">
                    <button
                      onClick={() =>
                        handleDecrement(
                          item.id,
                          item.quantity,
                          item.minQty
                        )
                      }
                      disabled={
                        item.minQty
                          ? item.quantity <= item.minQty
                          : false
                      }
                      className="size-8 rounded-full bg-background flex items-center justify-center hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Reducir cantidad"
                    >
                      <Minus className="size-3" />
                    </button>

                    <span className="w-7 text-center font-semibold">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        handleIncrement(item.id, item.quantity)
                      }
                      className="size-8 rounded-full bg-background flex items-center justify-center hover:bg-accent hover:text-accent-foreground"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>

                  <p className="font-bold text-primary w-20 text-right">
                    RD$
                    {(item.price * item.quantity).toFixed(0)}
                  </p>

                  <button
                    onClick={() => remove(item.id)}
                    className="text-muted-foreground hover:text-destructive p-1"
                    aria-label="Eliminar producto"
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
      </section>

      {/* ── BARRA FIJA INFERIOR ── */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground leading-none mb-0.5">
            Total
          </p>

          <p className="font-display text-xl font-bold text-primary">
            RD${totalPrice().toFixed(2)}
          </p>
        </div>

        <button
          onClick={handleOpenForm}
          className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold text-base active:scale-95 transition-transform"
        >
          Confirmar {E.chat}
        </button>
      </div>

      {/* ── SHEET / MODAL DEL FORMULARIO ── */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold">
                Tus datos
              </h2>

              <button
                onClick={() => setFormOpen(false)}
                className="size-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-5">
              <Field
                label={`${E.person} Tu nombre`}
                htmlFor="name"
              >
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Ej: María González"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  className={inputCls}
                  autoComplete="name"
                />
              </Field>

              <Field
                label={`${E.phone} Tu teléfono`}
                htmlFor="phone"
              >
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Ej: 809-555-1234"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                  className={inputCls}
                  autoComplete="tel"
                />
              </Field>

              <Field
  label={`${E.pin} Dirección de entrega`}
  htmlFor="address"
>
  <div className="space-y-3">
    <input
      id="address"
      name="address"
      type="text"
      placeholder="Ej: Av. España, Santo Domingo Este"
      value={form.address}
      onChange={(e) =>
        setForm({
          ...form,
          address: e.target.value,
        })
      }
      className={inputCls}
      autoComplete="street-address"
      list="address-suggestions"
    />

    {/* Autocomplete simple */}
    <datalist id="address-suggestions">
      <option value="Santo Domingo Este" />
      <option value="Santo Domingo Norte" />
      <option value="Santo Domingo Oeste" />
      <option value="Los Mina" />
      <option value="Ensanche Ozama" />
      <option value="Alma Rosa" />
      <option value="Villa Faro" />
      <option value="Invivienda" />
      <option value="San Isidro" />
      <option value="Autopista Las Américas" />
    </datalist>

    {/* Botón ubicación actual */}
    <button
      type="button"
      onClick={() => {
        if (!navigator.geolocation) {
          toast.error("Tu navegador no soporta ubicación");
          return;
        }

        toast.loading("Obteniendo ubicación...", {
          id: "location",
        });

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
              );

              const data = await res.json();

              const address =
                data.display_name ||
                `${latitude}, ${longitude}`;

              setForm({
                ...form,
                address,
              });

              toast.success("Ubicación obtenida", {
                id: "location",
              });
            } catch {
              toast.error("No se pudo obtener la dirección", {
                id: "location",
              });
            }
          },
          () => {
            toast.error("Debes permitir el acceso a ubicación", {
              id: "location",
            });
          }
        );
      }}
      className="w-full border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary rounded-2xl py-4 px-4 font-semibold transition-colors"
    >
      📍 Usar mi ubicación actual
    </button>

    {/* Referencia */}
    <p className="text-sm text-muted-foreground">
      Agrega una referencia para ayudarte a encontrar más rápido.
    </p>
  </div>
</Field>

              <Field
                label={`${E.truck} ¿Cómo recibirás tu pedido?`}
                htmlFor="mode"
              >
                <div className="grid grid-cols-2 gap-3">
                  {(["entrega", "recogida"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          mode: m,
                        })
                      }
                      className={`py-4 rounded-2xl text-lg font-bold border-2 transition-all active:scale-95 ${
                        form.mode === m
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {m === "entrega"
                        ? `${E.truck} Entrega`
                        : `${E.store} Recogida`}
                    </button>
                  ))}
                </div>
              </Field>

              <Field
                label={`${E.notes} Notas (opcional)`}
                htmlFor="notes"
              >
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="Alergias, instrucciones especiales..."
                  value={form.notes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </Field>

              <button
                type="button"
                onClick={handleFormSubmit}
                className="w-full bg-[#25D366] text-white text-xl font-bold py-5 rounded-2xl active:scale-95 transition-transform mt-2"
              >
                Revisar pedido {E.chat}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DE CONFIRMACIÓN FINAL ── */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-6 max-h-[90dvh] overflow-y-auto">
            <h3 className="text-xl font-bold text-center mb-2">
              ¿Todo está correcto?
            </h3>

            <p className="text-base text-muted-foreground text-center mb-1">
              {form.name} · {form.phone}
            </p>

            <p className="text-base text-muted-foreground text-center mb-4">
              {form.mode === "entrega"
                ? `${E.truck} Entrega`
                : `${E.store} Recogida`}{" "}
              · {form.address}
            </p>

            <div className="bg-secondary rounded-2xl p-4 mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Tu pedido
              </p>

              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3"
                  >
                    <div className="size-9 rounded-lg bg-gradient-warm flex items-center justify-center text-lg shrink-0 overflow-hidden">
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

                    <span className="flex-1 text-sm font-medium truncate">
                      {item.quantity}x {item.name}
                    </span>

                    <span className="text-sm font-bold text-primary shrink-0">
                      RD$
                      {(item.price * item.quantity).toFixed(0)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
                <span className="text-sm font-semibold">
                  Total
                </span>

                <span className="font-display font-bold text-xl text-primary">
                  RD${totalPrice().toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  setFormOpen(true);
                }}
                className="flex-1 py-4 rounded-full bg-secondary font-semibold text-base"
              >
                {E.pencil} Editar
              </button>

              <button
                onClick={async () => {
                  setConfirmOpen(false);
                  await submitOrder();
                }}
                className="flex-[2] py-4 rounded-full bg-[#25D366] text-white font-bold text-base"
              >
                Enviar por WhatsApp {E.chat}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
