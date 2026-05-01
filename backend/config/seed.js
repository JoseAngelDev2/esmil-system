require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Categoria = require('../models/Categoria');
const Producto = require('../models/Producto');

const seed = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/esmil-delicias';
    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB');

    // Admin
    const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL || 'admin@esmildelicias.com' });
    if (!adminExists) {
      await Admin.create({
        email: process.env.ADMIN_EMAIL || 'admin@esmildelicias.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        nombre: 'Administrador EsmilDelicias'
      });
      console.log('✅ Admin creado:', process.env.ADMIN_EMAIL || 'admin@esmildelicias.com');
    } else {
      console.log('ℹ️  Admin ya existe');
    }

    // Categorías base
    const categorias = ['Dulces', 'Snacks', 'Bebidas', 'Postres'];
    const categoriasCreadas = {};

    for (const nombre of categorias) {
      const existing = await Categoria.findOne({ nombre });
      if (!existing) {
        const cat = await Categoria.create({ nombre });
        categoriasCreadas[nombre] = cat._id;
        console.log(`✅ Categoría creada: ${nombre}`);
      } else {
        categoriasCreadas[nombre] = existing._id;
        console.log(`ℹ️  Categoría ya existe: ${nombre}`);
      }
    }

    // Productos de ejemplo
    const productosEjemplo = [
      { nombre: 'Caramelos Surtidos', precio: 50, categoria: 'Dulces', stock: 100, descripcion: 'Mezcla de caramelos de diferentes sabores' },
      { nombre: 'Chocolates Artesanales', precio: 120, categoria: 'Dulces', stock: 50, descripcion: 'Chocolates hechos a mano' },
      { nombre: 'Papas Fritas Caseras', precio: 80, categoria: 'Snacks', stock: 60 },
      { nombre: 'Palomitas de Maíz', precio: 45, categoria: 'Snacks', stock: 80 },
      { nombre: 'Jugo Natural de Naranja', precio: 60, categoria: 'Bebidas', stock: 30 },
      { nombre: 'Refresco de Tamarindo', precio: 40, categoria: 'Bebidas', stock: 40 },
      { nombre: 'Flan Casero', precio: 90, categoria: 'Postres', stock: 20 },
      { nombre: 'Tres Leches', precio: 110, categoria: 'Postres', stock: 15 },
    ];

    for (const p of productosEjemplo) {
      const exists = await Producto.findOne({ nombre: p.nombre });
      if (!exists) {
        await Producto.create({
          ...p,
          categoria: categoriasCreadas[p.categoria]
        });
        console.log(`✅ Producto creado: ${p.nombre}`);
      }
    }

    console.log('\n🎉 Seed completado exitosamente');
    console.log('📧 Login admin:', process.env.ADMIN_EMAIL || 'admin@esmildelicias.com');
    console.log('🔑 Contraseña:', process.env.ADMIN_PASSWORD || 'admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seed:', err.message);
    process.exit(1);
  }
};

seed();
