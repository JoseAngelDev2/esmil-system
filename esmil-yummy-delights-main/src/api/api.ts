import type { Product, CategoryItem } from "@/types/products";
import { CATEGORY_META, FALLBACK_PRODUCTS, FALLBACK_CATEGORIES } from "@/types/products";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

interface ApiCategoria {
  _id: string;
  nombre: string;
}

interface ApiProducto {
  _id: string;
  nombre: string;
  precio: number;
  categoria: ApiCategoria | string;
  imagen?: string | null;
  stock: number;
  descripcion?: string;
  activo: boolean;
}

interface ApiHorario {
  _id: string;
  fecha: string;
  horas: string[];
}

export interface CrearPedidoPayload {
  cliente: string;
  telefono: string;
  productos: {
    producto: string;
    nombre: string;
    precio: number;
    cantidad: number;
  }[];
  fecha: string;
  hora: string;
  notas?: string;
}

function mapProducto(p: ApiProducto): Product {
  const categoriaNombre =
    typeof p.categoria === "string"
      ? p.categoria
      : p.categoria?.nombre ?? "General";
  const meta = CATEGORY_META[categoriaNombre];
  return {
    id: p._id,
    name: p.nombre,
    price: p.precio,
    category: categoriaNombre,
    categoryId: typeof p.categoria === "string" ? p.categoria : p.categoria?._id,
    emoji: meta?.emoji ?? "🍭",
    image: p.imagen ?? null,
    description: p.descripcion ?? "",
    stock: p.stock,
  };
}

function mapCategoria(c: ApiCategoria): CategoryItem {
  const meta = CATEGORY_META[c.nombre];
  return {
    id: c._id,
    name: c.nombre,
    description: meta?.description ?? "Productos seleccionados",
    image: meta?.image ?? "",
  };
}

export async function cargarCategorias(): Promise<CategoryItem[]> {
  try {
    const res = await fetch(`${API_URL}/categorias`);
    if (!res.ok) throw new Error();
    const data: ApiCategoria[] = await res.json();
    return data.map(mapCategoria);
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

export async function cargarProductos(categoriaId?: string): Promise<Product[]> {
  try {
    const params = new URLSearchParams({ activo: "true" });
    if (categoriaId) params.append("categoria", categoriaId);
    const res = await fetch(`${API_URL}/productos?${params}`);
    if (!res.ok) throw new Error();
    const data: ApiProducto[] = await res.json();
    return data.map(mapProducto);
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

export async function cargarHorarios(): Promise<ApiHorario[]> {
  try {
    const hoy = new Date().toISOString().split("T")[0];
    const res = await fetch(`${API_URL}/horarios?desde=${hoy}`);
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return [];
  }
}

export async function crearPedido(payload: CrearPedidoPayload): Promise<void> {
  const res = await fetch(`${API_URL}/pedidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al guardar pedido");
}
