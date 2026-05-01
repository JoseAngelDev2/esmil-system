import { useEffect, useState } from "react";
import { loadCatalog, type CatalogData } from "@/services/catalog";
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from "@/data/products";

export function useCatalog() {
  const [catalog, setCatalog] = useState<CatalogData>({
    products: FALLBACK_PRODUCTS,
    categories: FALLBACK_CATEGORIES,
    fromFallback: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    loadCatalog()
      .then((data) => {
        if (!cancelled) setCatalog(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ...catalog, loading };
}
