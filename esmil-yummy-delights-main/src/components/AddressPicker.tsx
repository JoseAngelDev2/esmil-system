import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Search, Star, Trash2, X, Crosshair } from "lucide-react";
import { toast } from "sonner";

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
}

interface Props {
  value: string;
  onChange: (address: string, coords?: { lat: number; lng: number }) => void;
}

const STORAGE_KEY = "esmildelicias-addresses";
// Centro por defecto: Santo Domingo
const DEFAULT_CENTER: [number, number] = [18.4861, -69.9312];

function loadSaved(): SavedAddress[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSaved(list: SavedAddress[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function AddressPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [labelInput, setLabelInput] = useState("");

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  useEffect(() => {
    setSaved(loadSaved());
  }, []);

  // Inicializa Leaflet solo cuando se abre el modal
  useEffect(() => {
    if (!open || !mapRef.current || mapInstanceRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !mapRef.current) return;

      // Fix iconos por defecto en bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      LRef.current = L;
      const map = L.map(mapRef.current).setView(DEFAULT_CENTER, 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker(DEFAULT_CENTER, { draggable: true }).addTo(map);
      markerRef.current = marker;
      mapInstanceRef.current = map;

      const updateFromLatLng = async (lat: number, lng: number) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`,
            { headers: { "Accept-Language": "es" } }
          );
          const data = await r.json();
          const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setSelected({ lat, lng, address: addr });
        } catch {
          setSelected({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
        }
      };

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        updateFromLatLng(e.latlng.lat, e.latlng.lng);
      });
      marker.on("dragend", () => {
        const ll = marker.getLatLng();
        updateFromLatLng(ll.lat, ll.lng);
      });

      // Tamaño correcto al abrir
      setTimeout(() => map.invalidateSize(), 100);
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Limpia el mapa al cerrar
  useEffect(() => {
    if (!open && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  }, [open]);

  const flyTo = (lat: number, lng: number, address: string) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16);
      markerRef.current.setLatLng([lat, lng]);
    }
    setSelected({ lat, lng, address });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=do`,
        { headers: { "Accept-Language": "es" } }
      );
      const data = await r.json();
      setResults(data);
      if (data.length === 0) toast.info("Sin resultados");
    } catch {
      toast.error("No se pudo buscar");
    } finally {
      setSearching(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalización no disponible");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { "Accept-Language": "es" } }
          );
          const data = await r.json();
          flyTo(latitude, longitude, data.display_name || "Mi ubicación");
        } catch {
          flyTo(latitude, longitude, "Mi ubicación");
        }
      },
      () => toast.error("No se pudo obtener tu ubicación")
    );
  };

  const confirmSelection = () => {
    if (!selected) {
      toast.error("Selecciona un punto en el mapa");
      return;
    }
    onChange(selected.address, { lat: selected.lat, lng: selected.lng });

    if (labelInput.trim()) {
      const next: SavedAddress = {
        id: crypto.randomUUID(),
        label: labelInput.trim(),
        address: selected.address,
        lat: selected.lat,
        lng: selected.lng,
      };
      const updated = [next, ...saved].slice(0, 10);
      setSaved(updated);
      saveSaved(updated);
      toast.success("Dirección guardada");
    }
    setOpen(false);
    setLabelInput("");
  };

  const useSaved = (a: SavedAddress) => {
    onChange(a.address, { lat: a.lat, lng: a.lng });
    setOpen(false);
  };

  const deleteSaved = (id: string) => {
    const updated = saved.filter((s) => s.id !== id);
    setSaved(updated);
    saveSaved(updated);
  };

  const savedList = useMemo(() => saved, [saved]);

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Calle, número, sector"
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 inline-flex items-center gap-1 px-3 rounded-xl bg-gradient-fire text-primary-foreground font-semibold text-sm shadow-soft hover-lift"
          aria-label="Elegir en mapa"
        >
          <MapPin className="size-4" />
          Mapa
        </button>
      </div>

      {savedList.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {savedList.slice(0, 4).map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => useSaved(a)}
              className="inline-flex items-center gap-1 text-xs bg-secondary hover:bg-accent hover:text-accent-foreground px-2.5 py-1 rounded-full"
            >
              <Star className="size-3" />
              {a.label}
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div
            className="bg-card rounded-2xl shadow-warm w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display text-lg font-bold">Elegir dirección</h3>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-secondary rounded-lg">
                <X className="size-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar dirección, calle, sector..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50"
                >
                  {searching ? "..." : "Buscar"}
                </button>
                <button
                  type="button"
                  onClick={useMyLocation}
                  className="px-3 py-2 rounded-xl bg-secondary hover:bg-accent text-sm"
                  title="Mi ubicación"
                >
                  <Crosshair className="size-4" />
                </button>
              </form>

              {results.length > 0 && (
                <ul className="border border-border rounded-xl divide-y divide-border max-h-40 overflow-y-auto text-sm">
                  {results.map((r, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => {
                          flyTo(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
                          setResults([]);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-secondary"
                      >
                        {r.display_name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div ref={mapRef} className="w-full h-64 rounded-xl overflow-hidden border border-border z-0" />

              {selected && (
                <div className="bg-secondary rounded-xl p-3 text-sm">
                  <p className="font-semibold mb-0.5">📍 Dirección seleccionada</p>
                  <p className="text-muted-foreground">{selected.address}</p>
                </div>
              )}

              {savedList.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Guardadas</p>
                  <ul className="space-y-1.5">
                    {savedList.map((a) => (
                      <li key={a.id} className="flex items-center gap-2 bg-secondary rounded-xl p-2">
                        <Star className="size-4 text-primary shrink-0" />
                        <button
                          type="button"
                          onClick={() => useSaved(a)}
                          className="flex-1 text-left min-w-0"
                        >
                          <p className="text-sm font-semibold truncate">{a.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{a.address}</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSaved(a.id)}
                          className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold">Guardar como (opcional)</label>
                <input
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  placeholder="Casa, Trabajo, Mamá..."
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="p-4 border-t border-border flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-full bg-secondary font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmSelection}
                className="flex-1 px-4 py-2.5 rounded-full bg-gradient-fire text-primary-foreground font-bold text-sm shadow-warm"
              >
                Usar esta dirección
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
