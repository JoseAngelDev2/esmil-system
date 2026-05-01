import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import type { Category } from "@/data/products";
import { useCatalog } from "@/hooks/useCatalog";
import { cn } from "@/lib/utils";
import { z } from "zod";

const searchSchema = z.object({
  cat: z.string().optional(),
});

export const Route = createFileRoute("/productos")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Productos — EsmilDelicias" },
      {
        name: "description",
        content: "Catálogo de dulces, snacks y bebidas. Agrega al carrito y reserva tu pedido.",
      },
    ],
  }),
  component: Productos,
});

const ALL_TAB = "Todos";

function Productos() {
  const { cat } = Route.useSearch();
  const { products, categories, loading, fromFallback } = useCatalog();
  const [active, setActive] = useState<Category>(cat ?? ALL_TAB);

  const filtered =
    active === ALL_TAB
      ? products
      : products.filter((p) => p.categoryId === active || p.category === active);
  const tabs = [{ id: ALL_TAB, name: ALL_TAB }, ...categories];

  return (
    <Layout>
      <section className="bg-gradient-warm py-12">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <h1 className="font-display text-4xl md:text-5xl font-bold">Nuestro catálogo</h1>
          <p className="mt-2 text-primary-foreground/90">Elige tus favoritos y arma tu pedido</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        {fromFallback && !loading && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Mostrando productos de ejemplo. Inicia el backend en http://localhost:5000 para ver el
            catálogo administrable.
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-all",
                active === tab.id
                  ? "bg-gradient-fire text-primary-foreground shadow-warm"
                  : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-72 rounded-2xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-secondary px-6 py-12 text-center text-muted-foreground">
            No hay productos disponibles en esta categoría.
          </div>
        )}
      </section>
    </Layout>
  );
}
