const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');

exports.getAll = async (req, res) => {
  try {
    const { estado, fecha, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (estado) filter.estado = estado;
    if (fecha) filter.fecha = fecha;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Pedido.countDocuments(filter);
    const pedidos = await Pedido.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      pedidos,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { cliente, telefono, productos, fecha, hora, notas } = req.body;

    if (!cliente || !telefono || !fecha || !hora || !productos?.length) {
      return res.status(400).json({
        error: 'Cliente, teléfono, productos, fecha y hora son requeridos'
      });
    }

    // Calcular total desde la DB para evitar manipulación
    let total = 0;
    const productosConPrecio = [];

    for (const item of productos) {
      const producto = await Producto.findById(item.producto || item._id);
      if (!producto) {
        return res.status(400).json({ error: `Producto no encontrado: ${item.nombre}` });
      }
      const cantidad = item.cantidad || 1;
      total += producto.precio * cantidad;
      productosConPrecio.push({
        producto: producto._id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad
      });
    }

    const pedido = await Pedido.create({
      cliente: cliente.trim(),
      telefono: telefono.trim(),
      productos: productosConPrecio,
      total,
      fecha,
      hora,
      notas: notas || '',
      estado: 'pendiente'
    });

    res.status(201).json(pedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'confirmado', 'entregado', 'cancelado'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );

    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    const [total, pendientes, confirmados, entregados, hoyCount, ingresos] = await Promise.all([
      Pedido.countDocuments(),
      Pedido.countDocuments({ estado: 'pendiente' }),
      Pedido.countDocuments({ estado: 'confirmado' }),
      Pedido.countDocuments({ estado: 'entregado' }),
      Pedido.countDocuments({ fecha: hoy }),
      Pedido.aggregate([
        { $match: { estado: { $ne: 'cancelado' } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    res.json({
      total,
      pendientes,
      confirmados,
      entregados,
      hoy: hoyCount,
      ingresos: ingresos[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
