const Producto = require("../models/Producto");
const path = require("path");
const fs = require("fs");
const { destroyCloudinaryImage } = require("../utils/cloudinary");

exports.getAll = async (req, res) => {
  try {
    const { categoria, activo, search } = req.query;
    const filter = {};

    if (categoria) filter.categoria = categoria;
    if (activo !== undefined) filter.activo = activo === "true";
    if (search) filter.nombre = { $regex: search, $options: "i" };

    const productos = await Producto.find(filter)
      .populate("categoria", "nombre")
      .sort({ createdAt: -1 });

    // Agregar URL completa de imagen para imágenes locales antiguas.
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const productosConUrl = productos.map((p) => {
      const obj = p.toObject();
      if (obj.imagen && !obj.imagen.startsWith("http")) {
        obj.imagen = `${baseUrl}/${obj.imagen}`;
      }
      return obj;
    });

    res.json(productosConUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id).populate(
      "categoria",
      "nombre",
    );
    if (!producto)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, precio, categoria, stock, descripcion } = req.body;

    if (!nombre || !precio || !categoria) {
      return res
        .status(400)
        .json({ error: "Nombre, precio y categoría son requeridos" });
    }

    const data = {
      nombre: nombre.trim(),
      precio: parseFloat(precio),
      categoria,
      stock: parseInt(stock) || 0,
      descripcion: descripcion || "",
    };

    if (req.file) {
      data.imagen = req.file.path;
    }

    const producto = await Producto.create(data);
    const populated = await producto.populate("categoria", "nombre");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { nombre, precio, categoria, stock, descripcion, activo } = req.body;

    const updateData = {};
    if (nombre) updateData.nombre = nombre.trim();
    if (precio !== undefined) updateData.precio = parseFloat(precio);
    if (categoria) updateData.categoria = categoria;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (activo !== undefined)
      updateData.activo = activo === "true" || activo === true;

    if (req.file) {
      const productoActual = await Producto.findById(req.params.id);
      if (productoActual?.imagen) {
        if (productoActual.imagen.startsWith("http")) {
          await destroyCloudinaryImage(productoActual.imagen);
        } else {
          const oldPath = path.join(__dirname, "..", productoActual.imagen);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }
      updateData.imagen = req.file.path;
    }

    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    ).populate("categoria", "nombre");

    if (!producto)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto)
      return res.status(404).json({ error: "Producto no encontrado" });

    if (producto.imagen) {
      if (producto.imagen.startsWith("http")) {
        await destroyCloudinaryImage(producto.imagen);
      } else {
        const imgPath = path.join(__dirname, "..", producto.imagen);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }
    }

    res.json({ message: "Producto eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
