import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
import { Search, X, ShoppingCart } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import type { Category } from "@/data/products";
import { useCatalog } from "@/hooks/useCatalog";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { Link } from "@tanstack/react-router";

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
        content:
          "Catálogo de dulces, snacks y bebidas. Agrega al carrito y reserva tu pedido.",
      },
    ],
  }),
  component: Productos,
});

const ALL_TAB = "Todos";

function Productos() {
  const { cat } = Route.useSearch();
  const { products, categories, loading, fromFallback } = useCatalog();
  const { items, totalPrice } = useCart();
  const [active, setActive] = useState<Category>(cat ?? ALL_TAB);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const filtered = useMemo(() => {
    let list =
      active === ALL_TAB
        ? products
        : products.filter(
            (p) => p.categoryId === active || p.category === active
          );

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [products, active, query]);

  const tabs = [{ id: ALL_TAB, name: ALL_TAB }, ...categories];

  return (
    <Layout>
      {/* Banner */}
      <section className="bg-gradient-warm py-10">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <h1 className="font-display text-4xl md:text-5xl font-bold">
            Nuestro catálogo
          </h1>
          <p className="mt-2 text-lg text-primary-foreground/90">
            Elige tus favoritos y arma tu pedido
          </p>
        </div>
      </section>

      {/* Carrito flotante — muy visible para adultos mayores */}
      {totalItems > 0 && (
        <div className="sticky top-0 z-30 bg-card border-b-2 border-primary/20 shadow-md">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="size-7 text-primary" />
                <span className="absolute -top-2 -right-2 size-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center leading-none">
                  {totalItems}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground leading-none mb-0.5">
                  {totalItems} {totalItems === 1 ? "producto" : "productos"}
                </p>
                <p className="font-display text-xl font-bold text-primary leading-none">
                  RD${totalPrice().toFixed(2)}
                </p>
              </div>
            </div>
            <Link
              to="/reservar"
              className="flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-full font-bold text-base active:scale-95 transition-transform shadow-md"
            >
              Ver carrito 💬
            </Link>
          </div>
        </div>
      )}

      <section className="container mx-auto px-4 py-6 pb-24">
        {fromFallback && !loading && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-base text-amber-900">
            Mostrando productos de ejemplo. Inicia el backend en
            http://localhost:5000 para ver el catálogo administrable.
          </div>
        )}

        {/* Buscador */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-6 text-muted-foreground pointer-events-none" />
          <input
            ref={searchRef}
            type="search"
            inputMode="search"
            placeholder="Buscar productos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-4 text-lg border-2 border-border rounded-2xl bg-background focus:border-primary focus:outline-none transition-colors"
            aria-label="Buscar productos"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 size-8 rounded-full bg-secondary flex items-center justify-center hover:bg-accent"
              aria-label="Limpiar búsqueda"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Categorías — botones grandes para adultos mayores */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-6 -mx-1 px-1 scrollbar-none snap-x">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                "flex-shrink-0 snap-start px-5 py-3 rounded-full text-base font-bold transition-all",
                active === tab.id
                  ? "bg-gradient-fire text-primary-foreground shadow-warm"
                  : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Resultado de búsqueda */}
        {query && (
          <p className="text-base text-muted-foreground mb-4">
            {filtered.length === 0
              ? "No se encontraron productos"
              : `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""} para "${query}"`}
          </p>
        )}

        {/* Grid de productos */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-72 rounded-2xl bg-secondary animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-secondary px-6 py-12 text-center text-muted-foreground text-lg">
            {query
              ? `No hay resultados para "${query}".`
              : "No hay productos disponibles en esta categoría."}
          </div>
        )}
      </section>
    </Layout>
  );
}
