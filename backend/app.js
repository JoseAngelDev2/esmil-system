require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://localhost:3001",
  "http://localhost:8080",
  "https://esmil-system-bzhz.vercel.app",
  "https://esmil-system-9wkf.vercel.app"
];

const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.DASHBOARD_URL,
  ...(process.env.CORS_ORIGINS || "").split(","),
]
  .map((origin) => origin?.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use("/auth", require("./routes/auth"));
app.use("/categorias", require("./routes/categorias"));
app.use("/productos", require("./routes/productos"));
app.use("/horarios", require("./routes/horarios"));
app.use("/pedidos", require("./routes/pedidos"));

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "EsmilDelicias API corriendo",
    timestamp: new Date(),
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
  });
});

module.exports = app;
