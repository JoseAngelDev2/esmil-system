import { createFileRoute } from "@tanstack/react-router";
import { Heart, Target, Eye } from "lucide-react";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/nosotros")({
  head: () => ({
    meta: [
      { title: "Sobre nosotros — EsmilDelicias" },
      { name: "description", content: "Conoce la historia, misión y visión de EsmilDelicias, tu suplidora de confianza." },
    ],
  }),
  component: Nosotros,
});

function Nosotros() {
  return (
    <Layout>
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <h1 className="font-display text-4xl md:text-5xl font-bold">Sobre EsmilDelicias</h1>
          <p className="mt-3 max-w-2xl mx-auto text-primary-foreground/90">
            Una pequeña suplidora con el corazón puesto en cada cliente.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <p className="text-lg text-muted-foreground leading-relaxed">
          <strong className="text-foreground">EsmilDelicias</strong> nació con la idea de acercar los productos
          favoritos de siempre a tu casa, oficina o evento. Somos un negocio familiar que selecciona con cariño
          cada dulce, snack y bebida que ofrecemos, garantizando frescura, variedad y los mejores precios.
        </p>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          Creemos que las pequeñas cosas hacen grandes momentos: una golosina compartida, una bebida fría
          en una tarde caliente, un snack para acompañar una buena conversación. Por eso trabajamos cada día
          para que tu experiencia sea sencilla, rápida y muy sabrosa.
        </p>
      </section>

      <section className="container mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        {[
          { icon: Heart, title: "Pasión", text: "Atendemos cada pedido como si fuera para nuestra propia familia." },
          { icon: Target, title: "Misión", text: "Llevar sabor, energía y alegría a cada cliente con productos de calidad y atención cercana." },
          { icon: Eye, title: "Visión", text: "Ser la suplidora favorita de la comunidad, reconocida por su variedad, frescura y servicio." },
        ].map((v, i) => (
          <div key={i} className="bg-card rounded-3xl p-6 shadow-soft hover-lift text-center">
            <div className="mx-auto size-14 rounded-2xl bg-gradient-fire flex items-center justify-center text-primary-foreground mb-4">
              <v.icon className="size-7" />
            </div>
            <h3 className="font-display text-xl font-bold">{v.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{v.text}</p>
          </div>
        ))}
      </section>
    </Layout>
  );
}
