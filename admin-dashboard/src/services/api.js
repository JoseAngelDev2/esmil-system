import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor: añadir token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('esmil_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: manejar 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('esmil_token');
      localStorage.removeItem('esmil_admin');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// AUTH
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

// CATEGORIAS
export const categoriasService = {
  getAll: () => api.get('/categorias'),
  create: (data) => api.post('/categorias', data),
  update: (id, data) => api.put(`/categorias/${id}`, data),
  delete: (id) => api.delete(`/categorias/${id}`),
};

// PRODUCTOS
export const productosService = {
  getAll: (params) => api.get('/productos', { params }),
  create: (formData) => api.post('/productos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/productos/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/productos/${id}`),
};

// HORARIOS
export const horariosService = {
  getAll: (params) => api.get('/horarios', { params }),
  upsert: (data) => api.post('/horarios', data),
  addHora: (id, hora) => api.patch(`/horarios/${id}/horas`, { hora }),
  delete: (id) => api.delete(`/horarios/${id}`),
  deleteHora: (id, hora) => api.delete(`/horarios/${id}/horas/${hora}`),
};

// PEDIDOS
export const pedidosService = {
  getAll: (params) => api.get('/pedidos', { params }),
  getOne: (id) => api.get(`/pedidos/${id}`),
  getStats: () => api.get('/pedidos/stats'),
  updateEstado: (id, estado) => api.put(`/pedidos/${id}`, { estado }),
};

export default api;
