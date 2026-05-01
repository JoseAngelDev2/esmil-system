const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema({
  fecha: {
    type: String, // YYYY-MM-DD
    required: [true, 'La fecha es requerida']
  },
  horas: [{
    type: String // HH:MM
  }]
}, { timestamps: true });

// Índice único por fecha
horarioSchema.index({ fecha: 1 }, { unique: true });

module.exports = mongoose.model('Horario', horarioSchema);
