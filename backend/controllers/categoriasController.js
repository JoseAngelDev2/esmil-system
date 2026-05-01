const Categoria = require("../models/Categoria");

exports.getAll = async (req, res) => {
  try {
    const categorias = await Categoria.find().sort({ nombre: 1 });
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, imagen } = req.body;
    if (!nombre?.trim()) {
      return res.status(400).json({ error: "El nombre es requerido" });
    }
    const categoria = await Categoria.create({
      nombre: nombre.trim(),
      imagen: imagen?.trim() || "",
    });
    res.status(201).json(categoria);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "Ya existe una categoría con ese nombre" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { nombre, imagen } = req.body;
    if (!nombre?.trim()) {
      return res.status(400).json({ error: "El nombre es requerido" });
    }
    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      {
        nombre: nombre.trim(),
        imagen: imagen?.trim() || "",
      },
      { new: true, runValidators: true },
    );
    if (!categoria) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }
    res.json(categoria);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "Ya existe una categoría con ese nombre" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const Producto = require("../models/Producto");
    const productosAsociados = await Producto.countDocuments({
      categoria: req.params.id,
    });
    if (productosAsociados > 0) {
      return res.status(400).json({
        error: `No se puede eliminar. Hay ${productosAsociados} producto(s) en esta categoría.`,
      });
    }
    const categoria = await Categoria.findByIdAndDelete(req.params.id);
    if (!categoria) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }
    res.json({ message: "Categoría eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
