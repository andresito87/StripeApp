import axios from "axios";
import { redirectTo } from "./NavigationService";

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

// Interceptor para capturar respuestas con status 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      redirectTo("/login");
    }
    return Promise.reject(error);
  }
);

export default api;
