import { useEffect, useState } from "react";
import { categoriasService } from "../services/api";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  Check,
  X,
  Image,
  Link as LinkIcon,
} from "lucide-react";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [imagen, setImagen] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editImagen, setEditImagen] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await categoriasService.getAll();
      setCategorias(data);
    } catch {
      toast.error("Error cargando categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      const { data } = await categoriasService.create({ nombre, imagen });
      setCategorias((prev) => [...prev, data]);
      setNombre("");
      setImagen("");
      toast.success("Categoría creada");
    } catch (err) {
      toast.error(err.response?.data?.error || "Error al crear");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editNombre.trim()) return;
    try {
      const { data } = await categoriasService.update(id, {
        nombre: editNombre,
        imagen: editImagen,
      });
      setCategorias((prev) => prev.map((c) => (c._id === id ? data : c)));
      setEditId(null);
      toast.success("Categoría actualizada");
    } catch (err) {
      toast.error(err.response?.data?.error || "Error al actualizar");
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar la categoría "${nombre}"?`)) return;
    try {
      await categoriasService.delete(id);
      setCategorias((prev) => prev.filter((c) => c._id !== id));
      toast.success("Categoría eliminada");
    } catch (err) {
      toast.error(err.response?.data?.error || "Error al eliminar");
    }
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">
          Categorías
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Gestiona las categorías de productos
        </p>
      </div>

      {/* Formulario crear */}
      <div className="card">
        <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand-400" />
          Nueva Categoría
        </h2>
        <form
          onSubmit={handleCreate}
          className="grid gap-3 md:grid-cols-[1fr_1.4fr_auto]"
        >
          <input
            className="input"
            placeholder="Nombre de la categoría"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <div>
            <input
              className="input"
              type="url"
              placeholder="URL directa de imagen"
              value={imagen}
              onChange={(e) => setImagen(e.target.value)}
            />
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <LinkIcon className="h-3 w-3" />
              Usa enlaces directos .jpg, .png o .webp. Recomendado: 1200x900 px.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary justify-center"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Crear"
            )}
          </button>
        </form>
      </div>

      {/* Lista */}
      <div className="card">
        <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4 text-slate-400" />
          Categorías ({categorias.length})
        </h2>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-14 bg-slate-800 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : categorias.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">
            No hay categorías aún
          </p>
        ) : (
          <ul className="space-y-2">
            {categorias.map((cat) => (
              <li
                key={cat._id}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
              >
                <div className="relative w-12 h-12 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center overflow-hidden shrink-0">
                  <Tag className="w-4 h-4 text-brand-400" />
                  {cat.imagen ? (
                    <img
                      src={cat.imagen}
                      alt={cat.nombre}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.remove();
                      }}
                    />
                  ) : null}
                </div>

                {editId === cat._id ? (
                  <>
                    <div className="grid flex-1 gap-2 md:grid-cols-2">
                      <input
                        className="input py-2 text-sm"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        autoFocus
                      />
                      <input
                        className="input py-2 text-sm"
                        type="url"
                        placeholder="URL directa de imagen"
                        value={editImagen}
                        onChange={(e) => setEditImagen(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => handleUpdate(cat._id)}
                      className="p-2 text-green-400 hover:text-green-300 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <span className="block text-white text-sm font-medium">
                        {cat.nombre}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 truncate">
                        <Image className="w-3 h-3" />
                        {cat.imagen || "Sin imagen"}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setEditId(cat._id);
                        setEditNombre(cat.nombre);
                        setEditImagen(cat.imagen || "");
                      }}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id, cat.nombre)}
                      className="p-2 text-red-400/60 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
