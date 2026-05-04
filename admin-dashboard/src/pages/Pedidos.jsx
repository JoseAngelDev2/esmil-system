import { useEffect, useState } from 'react';
import { pedidosService } from '../services/api';
import toast from 'react-hot-toast';
import { ShoppingBag, ChevronDown, Phone, Calendar, Clock, Package, FileText } from 'lucide-react';
import { generarFactura } from '../utils/generarFactura';

const ESTADOS = ['todos', 'pendiente', 'confirmado', 'entregado', 'cancelado'];
const NEXT_ESTADO = {
  pendiente: 'confirmado',
  confirmado: 'entregado',
};

// Solo los pedidos confirmados o entregados pueden generar factura
const PUEDE_FACTURAR = ['confirmado', 'entregado'];

function PedidoCard({ pedido, onChangeEstado }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [facturando, setFacturando] = useState(false);

  const fmt = (n) =>
    new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(n);

  const handleChange = async (estado) => {
    setLoading(true);
    try {
      await onChangeEstado(pedido._id, estado);
    } finally {
      setLoading(false);
    }
  };

  const handleFactura = async () => {
    setFacturando(true);
    try {
      generarFactura(pedido);
      toast.success('Factura generada correctamente');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo generar la factura');
    } finally {
      setFacturando(false);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden transition-all">
      {/* ── Cabecera del card (siempre visible) ── */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/20"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">{pedido.cliente}</p>
            <div className="flex items-center gap-3 text-slate-500 text-xs mt-0.5">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />{pedido.telefono}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />{pedido.fecha}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />{pedido.hora}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <p className="text-white font-semibold text-sm hidden sm:block">{fmt(pedido.total)}</p>
          <span className={`badge badge-${pedido.estado}`}>{pedido.estado}</span>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* ── Detalle expandido ── */}
      {open && (
        <div className="border-t border-slate-700/50 p-4 space-y-4">

          {/* Productos */}
          <div>
            <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Productos
            </h4>
            <div className="space-y-1.5">
              {pedido.productos.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">
                    {item.nombre}
                    {item.cantidad > 1 && (
                      <span className="text-slate-500 ml-1">x{item.cantidad}</span>
                    )}
                  </span>
                  <span className="text-slate-400">
                    {fmt(item.precio * (item.cantidad || 1))}
                  </span>
                </div>
              ))}
              <div className="border-t border-slate-700/50 pt-1.5 flex justify-between text-sm font-semibold">
                <span className="text-slate-300">Total</span>
                <span className="text-white">{fmt(pedido.total)}</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          {pedido.notas && (
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">
                Notas
              </p>
              <p className="text-slate-300 text-sm">{pedido.notas}</p>
            </div>
          )}

          {/* ── Acciones ── */}
          <div className="flex flex-wrap gap-2 pt-1">
            {/* Avanzar estado */}
            {NEXT_ESTADO[pedido.estado] && (
              <button
                onClick={() => handleChange(NEXT_ESTADO[pedido.estado])}
                disabled={loading}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                {loading && (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Marcar como {NEXT_ESTADO[pedido.estado]}
              </button>
            )}

            {/* Cancelar */}
            {pedido.estado !== 'cancelado' && pedido.estado !== 'entregado' && (
              <button
                onClick={() => handleChange('cancelado')}
                disabled={loading}
                className="btn-danger text-xs"
              >
                Cancelar pedido
              </button>
            )}

            {/* ── BOTÓN FACTURA — solo si confirmado o entregado ── */}
            {PUEDE_FACTURAR.includes(pedido.estado) && (
              <button
                onClick={handleFactura}
                disabled={facturando}
                className="
                  flex items-center gap-1.5
                  px-4 py-2 rounded-xl text-xs font-semibold
                  bg-emerald-500/10 text-emerald-400
                  border border-emerald-500/25
                  hover:bg-emerald-500/20 hover:border-emerald-500/50
                  active:scale-95
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {facturando ? (
                  <span className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                Sacar factura
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 15 };
      if (filtroEstado !== 'todos') params.estado = filtroEstado;
      const { data } = await pedidosService.getAll(params);
      setPedidos(data.pedidos);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      toast.error('Error cargando pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    load(1);
  }, [filtroEstado]);

  const handleChangeEstado = async (id, estado) => {
    try {
      const { data } = await pedidosService.updateEstado(id, estado);
      setPedidos(prev => prev.map(p => p._id === id ? data : p));
      toast.success(`Pedido marcado como ${estado}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Pedidos</h1>
        <p className="text-slate-500 mt-1 text-sm">{total} pedidos en total</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {ESTADOS.map(e => (
          <button
            key={e}
            onClick={() => setFiltroEstado(e)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              filtroEstado === e
                ? 'bg-brand-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {e === 'todos' ? 'Todos' : e}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : pedidos.length === 0 ? (
        <div className="card text-center py-16 text-slate-500">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No hay pedidos con este filtro</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map(p => (
            <PedidoCard key={p._id} pedido={p} onChangeEstado={handleChangeEstado} />
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => { setPage(p => p - 1); load(page - 1); }}
            disabled={page === 1}
            className="btn-secondary text-sm disabled:opacity-40"
          >
            ‹ Anterior
          </button>
          <span className="text-slate-500 text-sm px-4">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => { setPage(p => p + 1); load(page + 1); }}
            disabled={page === totalPages}
            className="btn-secondary text-sm disabled:opacity-40"
          >
            Siguiente ›
          </button>
        </div>
      )}
    </div>
  );
}
