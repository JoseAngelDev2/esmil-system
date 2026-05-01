const Horario = require('../models/Horario');

exports.getAll = async (req, res) => {
  try {
    const { desde } = req.query;
    const filter = {};

    // Solo horarios futuros si se solicita
    if (desde) {
      filter.fecha = { $gte: desde };
    }

    const horarios = await Horario.find(filter).sort({ fecha: 1 });
    res.json(horarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.upsert = async (req, res) => {
  try {
    const { fecha, horas } = req.body;

    if (!fecha) {
      return res.status(400).json({ error: 'La fecha es requerida' });
    }

    if (!Array.isArray(horas) || horas.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos una hora' });
    }

    // Validar formato de horas HH:MM
    const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const horasInvalidas = horas.filter(h => !horaRegex.test(h));
    if (horasInvalidas.length > 0) {
      return res.status(400).json({ error: `Horas inválidas: ${horasInvalidas.join(', ')}` });
    }

    const horasUnicas = [...new Set(horas)].sort();

    const horario = await Horario.findOneAndUpdate(
      { fecha },
      { fecha, horas: horasUnicas },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(horario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addHora = async (req, res) => {
  try {
    const { id } = req.params;
    const { hora } = req.body;

    const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horaRegex.test(hora)) {
      return res.status(400).json({ error: 'Formato de hora inválido. Use HH:MM' });
    }

    const horario = await Horario.findByIdAndUpdate(
      id,
      { $addToSet: { horas: hora } },
      { new: true }
    );

    if (!horario) return res.status(404).json({ error: 'Horario no encontrado' });
    horario.horas.sort();
    await horario.save();
    res.json(horario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const horario = await Horario.findByIdAndDelete(req.params.id);
    if (!horario) return res.status(404).json({ error: 'Horario no encontrado' });
    res.json({ message: 'Horario eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeHora = async (req, res) => {
  try {
    const { id, hora } = req.params;

    const horario = await Horario.findByIdAndUpdate(
      id,
      { $pull: { horas: hora } },
      { new: true }
    );

    if (!horario) return res.status(404).json({ error: 'Horario no encontrado' });
    res.json(horario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
