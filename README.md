# 🍬 EsmilDelicias - Sistema Completo

Sistema de gestión para la tienda EsmilDelicias con:
- **Backend API** (Node.js + Express + MongoDB)
- **Admin Dashboard** (React + Tailwind)
- **Integración** con el frontend existente

---

## 📁 Estructura del Proyecto

```
esmil-system/
├── backend/                  # API Node.js + Express
│   ├── controllers/          # Lógica de negocio
│   ├── models/               # Esquemas MongoDB
│   ├── routes/               # Rutas de la API
│   ├── middleware/           # Auth JWT + Multer
│   ├── config/               # Seed inicial
│   ├── uploads/              # Imágenes de productos
│   ├── server.js             # Entry point
│   └── .env.example
├── admin-dashboard/          # React Dashboard
│   └── src/
│       ├── pages/            # Login, Dashboard, Categorías, Productos, Horarios, Pedidos
│       ├── components/       # Layout, Sidebar
│       ├── services/         # API calls (axios)
│       └── context/          # AuthContext (JWT)
├── FRONTEND_INTEGRATION.js   # Cómo conectar el frontend existente
└── README.md
```

---

## 🚀 Instalación y Ejecución

### Requisitos
- Node.js 18+
- MongoDB (local o Atlas)

---

### 1. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus datos (MongoDB URI, JWT secret, etc.)

# Ejecutar seed (crea admin + datos de ejemplo)
npm run seed

# Iniciar servidor
npm run dev       # desarrollo (nodemon)
npm start         # producción
```

El servidor corre en: **http://localhost:5000**

---

### 2. Admin Dashboard

```bash
cd admin-dashboard

# Instalar dependencias
npm install

# Configurar
cp .env.example .env
# VITE_API_URL=http://localhost:5000

# Iniciar dashboard
npm run dev
```

El dashboard corre en: **http://localhost:3001**

---

## 🔐 Credenciales por Defecto

| Campo | Valor |
|-------|-------|
| Email | admin@esmildelicias.com |
| Contraseña | admin123 |

> ⚠️ Cambia estos valores en producción vía `.env`

---

## 🌐 API Endpoints

### Autenticación
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/login` | ❌ | Login admin |
| GET | `/auth/me` | ✅ | Info admin actual |

### Categorías
| Método | Ruta | Auth |
|--------|------|------|
| GET | `/categorias` | ❌ (público) |
| POST | `/categorias` | ✅ |
| PUT | `/categorias/:id` | ✅ |
| DELETE | `/categorias/:id` | ✅ |

### Productos
| Método | Ruta | Auth |
|--------|------|------|
| GET | `/productos` | ❌ (público) |
| GET | `/productos/:id` | ❌ |
| POST | `/productos` | ✅ (multipart) |
| PUT | `/productos/:id` | ✅ (multipart) |
| DELETE | `/productos/:id` | ✅ |

**Query params GET /productos:** `?categoria=ID&activo=true&search=texto`

### Horarios
| Método | Ruta | Auth |
|--------|------|------|
| GET | `/horarios` | ❌ (público) |
| POST | `/horarios` | ✅ |
| PATCH | `/horarios/:id/horas` | ✅ |
| DELETE | `/horarios/:id` | ✅ |
| DELETE | `/horarios/:id/horas/:hora` | ✅ |

**Query params GET /horarios:** `?desde=YYYY-MM-DD`

### Pedidos
| Método | Ruta | Auth |
|--------|------|------|
| GET | `/pedidos` | ✅ |
| GET | `/pedidos/stats` | ✅ |
| GET | `/pedidos/:id` | ✅ |
| POST | `/pedidos` | ❌ (público - desde el frontend) |
| PUT | `/pedidos/:id` | ✅ (cambiar estado) |

---

## 🔗 Integración con el Frontend Existente

Ver el archivo `FRONTEND_INTEGRATION.js` para el código completo.

### Resumen rápido:

```javascript
// 1. Cargar productos (reemplaza datos estáticos)
const productos = await fetch('http://localhost:5000/productos?activo=true').then(r => r.json());

// 2. Cargar horarios disponibles
const horarios = await fetch('http://localhost:5000/horarios?desde=2024-01-01').then(r => r.json());

// 3. Crear pedido
await fetch('http://localhost:5000/pedidos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cliente, telefono, productos, fecha, hora })
});
```

---

## 🎛️ Dashboard Admin - Módulos

### 📊 Dashboard
- Stats en tiempo real: total pedidos, pendientes, entregados, ingresos
- Últimos 5 pedidos con estado visual

### 🏷️ Categorías
- CRUD completo con validación
- Protección: no se puede eliminar si tiene productos asociados

### 📦 Productos
- CRUD completo con subida de imágenes
- Búsqueda en tiempo real
- Filtros por categoría y estado
- Gestión de stock

### 📅 Horarios
- Calendario visual mensual
- Click en día → configurar horas disponibles
- Agregar/quitar horas individualmente
- Vista general de todos los horarios

### 🛍️ Pedidos
- Listado con filtros por estado
- Vista expandible por pedido (detalle de productos)
- Cambiar estado: pendiente → confirmado → entregado
- Cancelar pedidos

---

## 🛠️ Tecnologías

| Parte | Stack |
|-------|-------|
| Backend | Node.js, Express, Mongoose, JWT, Multer |
| Database | MongoDB |
| Frontend Admin | React 18, Vite, Tailwind CSS, React Router |
| Auth | JWT con localStorage |
| Imágenes | Multer (almacenamiento local) |

---

## 📝 Variables de Entorno

### Backend `.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/esmil-delicias
JWT_SECRET=cambia_esto_en_produccion
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@esmildelicias.com
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:5173
```

### Dashboard `.env`
```env
VITE_API_URL=http://localhost:5000
```
