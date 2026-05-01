/**
 * ============================================================
 * GUÍA DE INTEGRACIÓN: Frontend Existente → Backend EsmilDelicias
 * ============================================================
 *
 * Agrega esto a tu frontend existente para conectarlo con el backend real.
 * Reemplaza los datos estáticos/simulados con llamadas a la API.
 *
 * Base URL: http://localhost:5000
 */

const API_URL = 'http://localhost:5000'; // cambiar en producción

// ============================================================
// 1. CARGAR PRODUCTOS (reemplaza datos estáticos)
// ============================================================
export async function cargarProductos(categoriaId = null) {
  const params = new URLSearchParams({ activo: 'true' });
  if (categoriaId) params.append('categoria', categoriaId);

  const res = await fetch(`${API_URL}/productos?${params}`);
  if (!res.ok) throw new Error('Error cargando productos');
  return res.json();
  // Retorna: [{ _id, nombre, precio, categoria: { _id, nombre }, imagen, stock, descripcion }]
}

// ============================================================
// 2. CARGAR CATEGORÍAS (para filtros de productos)
// ============================================================
export async function cargarCategorias() {
  const res = await fetch(`${API_URL}/categorias`);
  if (!res.ok) throw new Error('Error cargando categorías');
  return res.json();
  // Retorna: [{ _id, nombre }]
}

// ============================================================
// 3. CARGAR HORARIOS DISPONIBLES (para selector de fecha/hora)
// ============================================================
export async function cargarHorarios() {
  const hoy = new Date().toISOString().split('T')[0];
  const res = await fetch(`${API_URL}/horarios?desde=${hoy}`);
  if (!res.ok) throw new Error('Error cargando horarios');
  return res.json();
  // Retorna: [{ _id, fecha: "YYYY-MM-DD", horas: ["10:00", "11:00"] }]
}

// ============================================================
// 4. ENVIAR PEDIDO (desde el formulario de reserva)
// ============================================================
export async function enviarPedido({ cliente, telefono, productos, fecha, hora, notas }) {
  const res = await fetch(`${API_URL}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cliente,
      telefono,
      productos: productos.map(p => ({
        producto: p._id || p.id,
        nombre: p.nombre,
        precio: p.precio,
        cantidad: p.cantidad || 1
      })),
      fecha,
      hora,
      notas: notas || ''
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al enviar pedido');
  }
  return res.json();
}

// ============================================================
// EJEMPLO DE USO EN REACT (componente de pedidos)
// ============================================================
/*
import { cargarProductos, cargarHorarios, enviarPedido } from './api-integration';

// En tu componente:
useEffect(() => {
  cargarProductos().then(setProductos);
  cargarHorarios().then(setHorarios);
}, []);

// Para el selector de fechas:
const fechasDisponibles = horarios.map(h => h.fecha);

// Para las horas de una fecha seleccionada:
const horasDisponibles = horarios.find(h => h.fecha === fechaSeleccionada)?.horas || [];

// Al confirmar pedido:
const confirmarPedido = async () => {
  try {
    await enviarPedido({
      cliente: nombre,
      telefono,
      productos: carrito,
      fecha: fechaSeleccionada,
      hora: horaSeleccionada,
    });
    alert('¡Pedido realizado!');
  } catch (err) {
    alert(err.message);
  }
};
*/
