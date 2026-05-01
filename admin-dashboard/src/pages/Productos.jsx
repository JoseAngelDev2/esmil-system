import { useEffect, useState, useRef } from 'react';
import { productosService, categoriasService } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search, Package, X, ImageIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const initialForm = { nombre: '', precio: '', categoria: '', stock: '0', descripcion: '', activo: true };

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="font-display font-semibold text-white text-lg">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef();

  const load = async () => {
    try {
      const [p, c] = await Promise.all([
        productosService.getAll(),
        categoriasService.getAll()
      ]);
      setProductos(p.data);
      setCategorias(c.data);
    } catch {
      toast.error('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(initialForm);
    setEditId(null);
    setImageFile(null);
    setImagePreview(null);
    setModal('form');
  };

  const openEdit = (p) => {
    setForm({
      nombre: p.nombre,
      precio: p.precio,
      categoria: p.categoria?._id || p.categoria,
      stock: p.stock,
      descripcion: p.descripcion || '',
      activo: p.activo
    });
    setEditId(p._id);
    setImagePreview(p.imagen || null);
    setImageFile(null);
    setModal('form');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.precio || !form.categoria) {
      return toast.error('Nombre, precio y categoría son requeridos');
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('imagen', imageFile);

      if (editId) {
        const { data } = await productosService.update(editId, fd);
        setProductos(prev => prev.map(p => p._id === editId ? data : p));
        toast.success('Producto actualizado');
      } else {
        const { data } = await productosService.create(fd);
        setProductos(prev => [data, ...prev]);
        toast.success('Producto creado');
      }
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      await productosService.delete(id);
      setProductos(prev => prev.filter(p => p._id !== id));
      toast.success('Producto eliminado');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar');
    }
  };

  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (n) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(n);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Productos</h1>
          <p className="text-slate-500 mt-1 text-sm">{productos.length} productos registrados</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          className="input pl-10"
          placeholder="Buscar productos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-800 rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No se encontraron productos</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 text-xs uppercase tracking-wide border-b border-slate-700/50">
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-4 py-4">Categoría</th>
                  <th className="px-4 py-4">Precio</th>
                  <th className="px-4 py-4">Stock</th>
                  <th className="px-4 py-4">Estado</th>
                  <th className="px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id} className="table-row">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.imagen ? (
                          <img src={p.imagen} alt={p.nombre} className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-slate-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{p.nombre}</p>
                          {p.descripcion && <p className="text-slate-500 text-xs truncate max-w-xs">{p.descripcion}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-400">{p.categoria?.nombre || '—'}</td>
                    <td className="px-4 py-4 text-white font-medium">{fmt(p.precio)}</td>
                    <td className="px-4 py-4">
                      <span className={`badge ${p.stock > 0 ? 'badge-entregado' : 'badge-cancelado'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`badge ${p.activo ? 'badge-confirmado' : 'badge-cancelado'}`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p._id, p.nombre)} className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal === 'form' && (
        <Modal title={editId ? 'Editar Producto' : 'Nuevo Producto'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Imagen */}
            <div>
              <label className="label">Imagen</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="w-full h-32 rounded-xl border-2 border-dashed border-slate-700 hover:border-brand-500/50 transition-colors cursor-pointer flex items-center justify-center overflow-hidden"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-slate-500">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs">Click para subir imagen</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <div>
              <label className="label">Nombre *</label>
              <input className="input" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Nombre del producto" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Precio *</label>
                <input type="number" min="0" step="0.01" className="input" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} placeholder="0.00" />
              </div>
              <div>
                <label className="label">Stock</label>
                <input type="number" min="0" className="input" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="label">Categoría *</label>
              <select className="input" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                <option value="">Seleccionar categoría</option>
                {categorias.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Descripción</label>
              <textarea className="input resize-none" rows={2} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Descripción opcional" />
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="activo" checked={form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))} className="w-4 h-4 accent-brand-500" />
              <label htmlFor="activo" className="text-sm text-slate-400">Producto activo</label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editId ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
