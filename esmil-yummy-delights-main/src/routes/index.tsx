import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Truck, Clock, Sparkles } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { getCategoryMeta } from "@/data/products";
import { useCatalog } from "@/hooks/useCatalog";
import heroImg from "@/assets/hero-snacks.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { products, categories, loading, fromFallback } = useCatalog();
  const featured = products.slice(0, 4);

  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div className="text-primary-foreground animate-fade-up">
            <span className="inline-flex items-center gap-2 bg-background/20 backdrop-blur px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="size-4" /> ¡Nuevos productos cada semana!
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-bold leading-[1.05] mb-4">
              Dulces, snacks y bebidas <span className="text-brand-sky">a tu puerta</span>
            </h1>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-md">
              En EsmilDelicias encuentras lo más rico para compartir en familia, con amigos o en tu
              próxima fiesta.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/productos"
                className="inline-flex items-center gap-2 bg-background text-primary px-6 py-3 rounded-full font-bold shadow-warm hover-lift"
              >
                Ver productos <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/reservar"
                className="inline-flex items-center gap-2 bg-foreground/90 text-background px-6 py-3 rounded-full font-bold hover-lift"
              >
                Hacer pedido
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-brand-sky/30 rounded-[3rem] blur-2xl" />
            <img
              src={heroImg}
              alt="Variedad de dulces, snacks y bebidas de EsmilDelicias"
              width={1536}
              height={1024}
              className="relative rounded-3xl shadow-warm w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-4">
        {[
          { icon: Truck, title: "Entrega rápida", text: "A domicilio en tu zona" },
          { icon: Clock, title: "Reserva fácil", text: "Elige fecha y hora" },
          { icon: Sparkles, title: "Productos frescos", text: "Calidad garantizada" },
        ].map((b, i) => (
          <div key={i} className="flex items-center gap-4 bg-card p-5 rounded-2xl shadow-soft">
            <div className="size-12 rounded-xl bg-gradient-warm flex items-center justify-center text-primary-foreground">
              <b.icon className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-12">
        {fromFallback && !loading && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Mostrando catálogo de ejemplo. Cuando el backend esté activo, esta sección se alimentará
            del CRUD del dashboard.
          </div>
        )}

        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Explora por categoría</h2>
          <p className="text-muted-foreground mt-2">Todo lo que se te antoja, en un solo lugar</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              from="/"
              to="/productos"
              search={{ cat: cat.id }}
              className="group relative overflow-hidden rounded-3xl shadow-soft hover-lift aspect-[4/3]"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = getCategoryMeta(cat.name).image;
                }}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-background">
                <h3 className="font-display text-2xl font-bold">{cat.name}</h3>
                <p className="text-sm text-background/85">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* PROMO */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-gradient-fire rounded-3xl p-8 md:p-12 text-primary-foreground flex flex-col md:flex-row items-center justify-between gap-6 shadow-warm">
          <div>
            <span className="inline-block bg-brand-sky text-foreground text-xs font-bold px-3 py-1 rounded-full mb-3">
              PROMO DE LA SEMANA
            </span>
            <h3 className="font-display text-3xl md:text-4xl font-bold">
              ¡10% OFF en pedidos sobre RD$500!
            </h3>
            <p className="text-primary-foreground/90 mt-2">
              Aplica al confirmar por WhatsApp. Tiempo limitado.
            </p>
          </div>
          <Link
            to="/productos"
            className="bg-background text-primary px-6 py-3 rounded-full font-bold whitespace-nowrap hover-lift"
          >
            Aprovechar ahora
          </Link>
        </div>
      </section>

      {/* FEATURED */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Más vendidos</h2>
            <p className="text-muted-foreground mt-1">Los favoritos de nuestros clientes</p>
          </div>
          <Link
            to="/productos"
            className="text-primary font-semibold hover:underline hidden sm:inline-flex items-center gap-1"
          >
            Ver todo <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-72 rounded-2xl bg-secondary animate-pulse" />
              ))
            : featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </Layout>
  );
}
