import dulcesImg from "@/assets/cat-dulces.jpg";
import snacksImg from "@/assets/cat-snacks.jpg";
import bebidasImg from "@/assets/cat-bebidas.jpg";

export type Category = string;

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  categoryId?: string;
  emoji: string;
  image?: string | null;
  description: string;
  stock?: number;
}

export interface CategoryItem {
  id: string;
  name: Category;
  description: string;
  image: string;
}

export const CATEGORY_META: Record<string, { description: string; image: string; emoji: string }> =
  {
    Dulces: { description: "Chocolates, gomitas y caramelos", image: dulcesImg, emoji: "🍬" },
    Snacks: { description: "Cheetos, Doritos y más", image: snacksImg, emoji: "🥨" },
    Bebidas: { description: "Refrescos, agua y jugos", image: bebidasImg, emoji: "🥤" },
  };

export const getCategoryMeta = (name?: string) =>
  CATEGORY_META[name ?? ""] ?? {
    description: "Productos seleccionados para tu pedido",
    image: snacksImg,
    emoji: "🍭",
  };

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "d1",
    name: "Chocolatines surtidos",
    price: 25,
    category: "Dulces",
    emoji: "🍫",
    description: "Pack de chocolates variados",
  },
  {
    id: "d2",
    name: "Gomitas de frutas",
    price: 30,
    category: "Dulces",
    emoji: "🍬",
    description: "Gomitas suaves sabor frutal",
  },
  {
    id: "d3",
    name: "Paletas de caramelo",
    price: 15,
    category: "Dulces",
    emoji: "🍭",
    description: "Paletas coloridas dulces",
  },
  {
    id: "s1",
    name: "Cheetos Flamin' Hot",
    price: 60,
    category: "Snacks",
    emoji: "🌶️",
    description: "Bolsa familiar picante",
  },
  {
    id: "s2",
    name: "Doritos Nacho",
    price: 65,
    category: "Snacks",
    emoji: "🧀",
    description: "Tortillas con queso nacho",
  },
  {
    id: "s3",
    name: "Papitas Lays",
    price: 55,
    category: "Snacks",
    emoji: "🥔",
    description: "Clásicas papas fritas",
  },
  {
    id: "b1",
    name: "Coca-Cola 2L",
    price: 95,
    category: "Bebidas",
    emoji: "🥤",
    description: "Refresco familiar",
  },
  {
    id: "b2",
    name: "Agua Cristal 600ml",
    price: 25,
    category: "Bebidas",
    emoji: "💧",
    description: "Agua purificada",
  },
];

export const FALLBACK_CATEGORIES: CategoryItem[] = Object.entries(CATEGORY_META).map(
  ([name, meta]) => ({
    id: name,
    name,
    description: meta.description,
    image: meta.image,
  }),
);

export const PRODUCTS = FALLBACK_PRODUCTS;
export const CATEGORIES = FALLBACK_CATEGORIES;
