import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, MessageCircle, Mail, Send } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { BUSINESS } from "@/store/cart";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — EsmilDelicias" },
      { name: "description", content: "Contáctanos por WhatsApp, formulario o visítanos. Estamos para servirte." },
    ],
  }),
  component: Contacto,
});

const schema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(80),
  email: z.string().trim().email("Email inválido").max(120),
  message: z.string().trim().min(5, "Mensaje muy corto").max(500),
});

function Contacto() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      toast.error(r.error.issues[0].message);
      return;
    }
    const msg = `Hola ${BUSINESS.name}, soy ${form.name} (${form.email}).\n\n${form.message}`;
    window.open(`https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    toast.success("¡Mensaje enviado!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <Layout>
      <section className="bg-gradient-warm py-12">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <h1 className="font-display text-4xl md:text-5xl font-bold">Contáctanos</h1>
          <p className="mt-2 text-primary-foreground/90">Respondemos rápido. ¡Escríbenos!</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <a
            href={`https://wa.me/${BUSINESS.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-card rounded-2xl p-5 shadow-soft hover-lift"
          >
            <div className="size-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center">
              <MessageCircle className="size-6" />
            </div>
            <div>
              <p className="font-semibold">WhatsApp</p>
              <p className="text-sm text-muted-foreground">+1 (809) 201-7995</p>
            </div>
          </a>

          <div className="flex items-center gap-4 bg-card rounded-2xl p-5 shadow-soft">
            <div className="size-12 rounded-xl bg-gradient-fire text-primary-foreground flex items-center justify-center">
              <MapPin className="size-6" />
            </div>
            <div>
              <p className="font-semibold">Ubicación</p>
              <p className="text-sm text-muted-foreground">{BUSINESS.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-card rounded-2xl p-5 shadow-soft">
            <div className="size-12 rounded-xl bg-gradient-warm text-primary-foreground flex items-center justify-center">
              <Mail className="size-6" />
            </div>
            <div>
              <p className="font-semibold">Email</p>
              <p className="text-sm text-muted-foreground">{BUSINESS.email}</p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-soft aspect-video">
            <iframe
              title="Ubicación EsmilDelicias"
              src="https://www.google.com/maps?q=Santo+Domingo&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-6 shadow-soft space-y-4 h-fit">
          <h2 className="font-display text-2xl font-bold">Escríbenos</h2>
          <div>
            <label className="text-sm font-semibold">Nombre</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Mensaje</label>
            <textarea
              rows={5}
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-fire text-primary-foreground px-6 py-3 rounded-full font-bold shadow-warm hover-lift"
          >
            <Send className="size-4" />
            Enviar mensaje
          </button>
        </form>
      </section>
    </Layout>
  );
}
