import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (product: Product) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, qty: number) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (product) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          // Al agregar por primera vez, respetamos minQty si existe
          const initialQty = product.minQty ?? 1;
          return { items: [...state.items, { ...product, quantity: initialQty }] };
        }),

      remove: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      setQuantity: (id, qty) =>
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          const min = item?.minQty ?? 1;

          // Si la nueva cantidad es menor o igual al mínimo → eliminar
          if (qty <= 0 || qty < min) {
            return { items: state.items.filter((i) => i.id !== id) };
          }

          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: qty } : i
            ),
          };
        }),

      clear: () => set({ items: [] }),
      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      totalPrice: () => get().items.reduce((s, i) => s + i.quantity * i.price, 0),
    }),
    {
      name: "esmildelicias-cart", // persiste en localStorage automáticamente
    }
  )
);

// Configuración del negocio
export const BUSINESS = {
  name: "EsmilDelicias",
  whatsapp: "18092017995", // formato internacional sin +
  address: "Calle Principal #123, Santo Domingo",
  email: "contacto@esmildelicias.com",
};
