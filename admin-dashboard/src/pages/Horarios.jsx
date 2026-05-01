import { useEffect, useState } from 'react';
import { horariosService } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Clock, CalendarDays, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const HOURS = Array.from({ length: 14 }, (_, i) => {
  const h = i + 8;
  return `${String(h).padStart(2, '0')}:00`;
});

export default function Horarios() {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [newHora, setNewHora] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await horariosService.getAll();
      setHorarios(data);
    } catch {
      toast.error('Error cargando horarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const horarioMap = Object.fromEntries(horarios.map(h => [h.fecha, h]));

  const selectDay = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    setSelectedHorario(horarioMap[dateStr] || null);
  };

  const handleAddHora = async () => {
    if (!newHora || !selectedDate) return;
    setSaving(true);
    try {
      if (selectedHorario) {
        const { data } = await horariosService.addHora(selectedHorario._id, newHora);
        const updated = { ...selectedHorario, horas: data.horas };
        setSelectedHorario(updated);
        setHorarios(prev => prev.map(h => h._id === data._id ? data : h));
      } else {
        const { data } = await horariosService.upsert({ fecha: selectedDate, horas: [newHora] });
        setHorarios(prev => [...prev, data]);
        setSelectedHorario(data);
      }
      setNewHora('');
      toast.success('Hora agregada');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveHora = async (hora) => {
    if (!selectedHorario) return;
    try {
      const { data } = await horariosService.deleteHora(selectedHorario._id, hora);
      setSelectedHorario(data);
      setHorarios(prev => prev.map(h => h._id === data._id ? data : h));
      toast.success('Hora eliminada');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    }
  };

  const handleDeleteDay = async () => {
    if (!selectedHorario || !confirm('¿Eliminar todas las horas de este día?')) return;
    try {
      await horariosService.delete(selectedHorario._id);
      setHorarios(prev => prev.filter(h => h._id !== selectedHorario._id));
      setSelectedHorario(null);
      toast.success('Día eliminado');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    }
  };

  const startPad = getDay(startOfMonth(currentMonth));

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Horarios</h1>
        <p className="text-slate-500 mt-1 text-sm">Configura los días y horas disponibles para pedidos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendario */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
              ‹
            </button>
            <h2 className="font-display font-semibold text-white capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h2>
            <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
              ›
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 mb-2">
            {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => (
              <div key={d} className="text-center text-slate-600 text-xs py-2 font-medium">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {[...Array(startPad)].map((_, i) => <div key={`pad-${i}`} />)}
            {days.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const hasHorario = !!horarioMap[dateStr];
              const isSelected = selectedDate === dateStr;
              const todayClass = isToday(day) ? 'ring-1 ring-brand-500/50' : '';

              return (
                <button
                  key={dateStr}
                  onClick={() => selectDay(day)}
                  className={`
                    relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all
                    ${isSelected ? 'bg-brand-500 text-white font-semibold' : 'hover:bg-slate-700/50 text-slate-300'}
                    ${todayClass}
                  `}
                >
                  {day.getDate()}
                  {hasHorario && (
                    <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-brand-400'}`} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700/50 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-400" />
              Con horario disponible
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full ring-1 ring-brand-500/50 bg-transparent" />
              Hoy
            </div>
          </div>
        </div>

        {/* Panel de horas */}
        <div className="card">
          {!selectedDate ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <CalendarDays className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">Selecciona un día en el calendario</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display font-semibold text-white">
                    {format(parseISO(selectedDate), "d 'de' MMMM", { locale: es })}
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {selectedHorario?.horas?.length || 0} horas configuradas
                  </p>
                </div>
                {selectedHorario && (
                  <button onClick={handleDeleteDay} className="btn-danger text-xs px-3 py-1.5">
                    <Trash2 className="w-3 h-3" />
                    Borrar día
                  </button>
                )}
              </div>

              {/* Agregar hora */}
              <div className="flex gap-2 mb-5">
                <select
                  className="input flex-1 text-sm"
                  value={newHora}
                  onChange={e => setNewHora(e.target.value)}
                >
                  <option value="">Seleccionar hora</option>
                  {HOURS.filter(h => !selectedHorario?.horas?.includes(h)).map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <button
                  onClick={handleAddHora}
                  disabled={saving || !newHora}
                  className="btn-primary"
                >
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>

              {/* Horas existentes */}
              {!selectedHorario?.horas?.length ? (
                <p className="text-slate-600 text-sm text-center py-6">
                  No hay horas configuradas para este día
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {selectedHorario.horas.map(hora => (
                    <div
                      key={hora}
                      className="flex items-center justify-between px-3 py-2 bg-slate-800/80 border border-slate-700/50 rounded-xl"
                    >
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-brand-400" />
                        <span className="text-sm text-white font-medium">{hora}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveHora(hora)}
                        className="text-slate-600 hover:text-red-400 transition-colors ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Listado de horarios */}
      <div className="card">
        <h2 className="font-display font-semibold text-white mb-4">
          Todos los Horarios Configurados
        </h2>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-slate-800 rounded-xl animate-pulse" />)}
          </div>
        ) : horarios.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No hay horarios configurados</p>
        ) : (
          <div className="space-y-2">
            {horarios.sort((a, b) => a.fecha.localeCompare(b.fecha)).map(h => (
              <div key={h._id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                <CalendarDays className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span className="text-white font-medium text-sm w-32">{format(parseISO(h.fecha), "d 'de' MMM yyyy", { locale: es })}</span>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {h.horas.map(hora => (
                    <span key={hora} className="badge badge-confirmado text-xs">{hora}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
