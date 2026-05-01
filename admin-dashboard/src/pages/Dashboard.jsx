import { useEffect, useState } from 'react';
import { pedidosService, productosService, categoriasService } from '../services/api';
import { ShoppingBag, Package, Tag, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-xl border ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-slate-500 text-xs font-medium">{label}</p>
        <p className="text-2xl font-display font-bold text-white mt-0.5">{value ?? '—'}</p>
        {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [counts, setCounts] = useState({ productos: 0, categorias: 0 });
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, p, c, ped] = await Promise.all([
          pedidosService.getStats(),
          productosService.getAll(),
          categoriasService.getAll(),
          pedidosService.getAll({ limit: 5, page: 1 }),
        ]);
        setStats(s.data);
        setCounts({ productos: p.data.length, categorias: c.data.length });
        setPedidos(ped.data.pedidos);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fmt = (n) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(n);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-64 bg-slate-800 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-800 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">Resumen general de EsmilDelicias</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag} label="Total Pedidos" value={stats?.total} sub={`${stats?.hoy} hoy`} color="brand" />
        <StatCard icon={Clock} label="Pendientes" value={stats?.pendientes} color="blue" />
        <StatCard icon={CheckCircle} label="Entregados" value={stats?.entregados} color="green" />
        <StatCard icon={TrendingUp} label="Ingresos Totales" value={fmt(stats?.ingresos || 0)} color="purple" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={Package} label="Productos Activos" value={counts.productos} />
        <StatCard icon={Tag} label="Categorías" value={counts.categorias} />
      </div>

      {/* Últimos pedidos */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-white text-lg">Últimos Pedidos</h2>
          <Link to="/pedidos" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
            Ver todos →
          </Link>
        </div>

        {pedidos.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">Aún no hay pedidos</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 text-xs uppercase tracking-wide">
                  <th className="pb-3 pr-4">Cliente</th>
                  <th className="pb-3 pr-4">Fecha</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(p => (
                  <tr key={p._id} className="table-row">
                    <td className="py-3 pr-4 text-white font-medium">{p.cliente}</td>
                    <td className="py-3 pr-4 text-slate-400">{p.fecha} {p.hora}</td>
                    <td className="py-3 pr-4 text-slate-300">{fmt(p.total)}</td>
                    <td className="py-3">
                      <span className={`badge badge-${p.estado}`}>{p.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
