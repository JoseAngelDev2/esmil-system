import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import { useCart } from "@/store/cart";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);

  const handleAdd = () => {
    if (product.stock !== undefined && product.stock <= 0) {
      toast.error(`${product.name} está agotado`);
      return;
    }
    add(product);
    toast.success(`${product.name} agregado`, {
      description: `RD$${product.price.toFixed(2)}`,
      duration: 1500,
    });
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-soft hover-lift flex flex-col">
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
        <span className="absolute top-3 left-3 bg-background/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded-full">
          {product.category}
        </span>
        {product.stock !== undefined && product.stock <= 0 && (
          <span className="absolute bottom-3 left-3 bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-1 rounded-full">
            Agotado
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-base leading-tight">{product.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 mb-3 flex-1">{product.description}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-xl font-bold text-primary">RD${product.price}</span>
          <button
            onClick={handleAdd}
            disabled={product.stock !== undefined && product.stock <= 0}
            className="inline-flex items-center gap-1 bg-gradient-fire text-primary-foreground px-3 py-2 rounded-full text-sm font-semibold shadow-soft hover:shadow-warm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="size-4" />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
