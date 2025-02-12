import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

// Obtener el token desde localStorage
const getToken = () => localStorage.getItem("token");

// Configurar instancia de Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token en cada petición
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
