import { Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import type { Product } from "@/data/products";
import { useCart } from "@/store/cart";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const handleAdd = () => {
    if (isOutOfStock) {
      toast.error(`${product.name} está agotado`);
      return;
    }

    add(product);

    // Feedback visual en el botón
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);

    toast.success(`✓ ${product.name} agregado al carrito`, {
      description: `RD$${product.price.toFixed(2)}`,
      duration: 2000,
      position: "top-center",
      style: { fontSize: "1rem" },
    });
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-soft hover-lift flex flex-col">
      {/* Imagen / emoji */}
      <div className="relative aspect-square bg-gradient-warm flex items-center justify-center text-7xl overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="group-hover:animate-float-slow">{product.emoji}</span>
        )}

        {/* Badge categoría */}
        <span className="absolute top-2 left-2 bg-background/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded-full">
          {product.category}
        </span>

        {/* Badge agotado */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1.5 rounded-full">
              Agotado
            </span>
          </div>
        )}

        {/* Badge mínimo */}
        {product.minQty && product.minQty > 1 && (
          <span className="absolute bottom-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Mín. {product.minQty}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <h3 className="font-bold text-base leading-tight line-clamp-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-muted-foreground leading-snug line-clamp-2 flex-1">
            {product.description}
          </p>
        )}

        {/* Precio grande y visible */}
        <p className="font-display text-2xl font-bold text-primary leading-none">
          RD${product.price.toFixed(0)}
        </p>

        {/* Botón grande — mínimo 48px alto para adultos mayores */}
        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          aria-label={`Agregar ${product.name} al carrito`}
          className={`
            w-full flex items-center justify-center gap-2
            py-3 rounded-xl text-base font-bold
            transition-all duration-200 active:scale-95
            disabled:cursor-not-allowed disabled:opacity-50
            ${justAdded
              ? "bg-green-500 text-white shadow-md scale-95"
              : "bg-gradient-fire text-primary-foreground shadow-soft hover:shadow-warm"
            }
          `}
        >
          {justAdded ? (
            <>
              <ShoppingCart className="size-5" />
              ¡Agregado!
            </>
          ) : (
            <>
              <Plus className="size-5" />
              Agregar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
