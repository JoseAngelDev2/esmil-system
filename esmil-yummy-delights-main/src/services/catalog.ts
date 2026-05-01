import {
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
  getCategoryMeta,
  type CategoryItem,
  type Product,
} from "@/data/products";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type ApiCategory = {
  _id: string;
  nombre: string;
  imagen?: string;
};

type ApiProduct = {
  _id: string;
  nombre: string;
  precio: number;
  categoria?: ApiCategory | string | null;
  imagen?: string | null;
  stock?: number;
  descripcion?: string;
};

export type CatalogData = {
  products: Product[];
  categories: CategoryItem[];
  fromFallback: boolean;
};

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Error ${res.status} cargando ${path}`);
  }
  return res.json();
}

function normalizeCategory(category: ApiCategory): CategoryItem {
  const meta = getCategoryMeta(category.nombre);
  return {
    id: category._id,
    name: category.nombre,
    description: meta.description,
    image: category.imagen || meta.image,
  };
}

function normalizeProduct(product: ApiProduct): Product {
  const category =
    typeof product.categoria === "object" && product.categoria ? product.categoria : undefined;
  const categoryName = category?.nombre ?? "Sin categoria";
  const meta = getCategoryMeta(categoryName);

  return {
    id: product._id,
    name: product.nombre,
    price: Number(product.precio) || 0,
    category: categoryName,
    categoryId: category?._id,
    emoji: meta.emoji,
    image: product.imagen ?? null,
    description: product.descripcion || "Producto disponible para reservar",
    stock: product.stock,
  };
}

export async function loadCatalog(): Promise<CatalogData> {
  try {
    const [categories, products] = await Promise.all([
      request<ApiCategory[]>("/categorias"),
      request<ApiProduct[]>("/productos?activo=true"),
    ]);

    return {
      categories: categories.map(normalizeCategory),
      products: products.map(normalizeProduct),
      fromFallback: false,
    };
  } catch {
    return {
      categories: FALLBACK_CATEGORIES,
      products: FALLBACK_PRODUCTS,
      fromFallback: true,
    };
  }
}

export async function createOrder(input: {
  cliente: string;
  telefono: string;
  productos: Array<{ producto: string; cantidad: number }>;
  fecha: string;
  hora: string;
  notas?: string;
}) {
  return requestWithBody("/pedidos", input);
}

async function requestWithBody<TBody>(path: string, body: TBody) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status} enviando ${path}`);
  }

  return res.json();
}
