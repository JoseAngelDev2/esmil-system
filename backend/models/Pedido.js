const mongoose = require('mongoose');

const itemPedidoSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto'
  },
  nombre: String,
  precio: Number,
  cantidad: {
    type: Number,
    default: 1
  }
});

const pedidoSchema = new mongoose.Schema({
  cliente: {
    type: String,
    required: [true, 'El nombre del cliente es requerido'],
    trim: true
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true
  },
  productos: [itemPedidoSchema],
  total: {
    type: Number,
    required: true
  },
  fecha: {
    type: String, // YYYY-MM-DD
    required: true
  },
  hora: {
    type: String, // HH:MM
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmado', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  notas: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Pedido', pedidoSchema);
