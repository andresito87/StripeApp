// src/context/AuthProvider.jsx
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // Cerrar sesión
  const logout = useCallback(() => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get("/user");
      setUser(response.data);
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  // Iniciar sesión
  const login = async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      fetchUser();
    } catch (error) {
      console.error(
        "Error en login:",
        error.response?.data?.message || error.message
      );
    }
  };

  // Registrar usuario
  const register = async ({ name, email, password }) => {
    try {
      const response = await api.post("/register", { name, email, password });
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      fetchUser();
    } catch (error) {
      console.error(
        "Error en registro:",
        error.response?.data?.message || error.message
      );
    }
  };

  AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
