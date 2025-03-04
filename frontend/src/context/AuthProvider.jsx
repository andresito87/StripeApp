// src/context/AuthProvider.jsx
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isTwoFA, setIsTwoFA] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null); // permite almacenar temporalmente el email del usuario cuando en un 2fa login
  const [pendingPassword, setPendingPassword] = useState(null); // permite almacenar temporalmente el password del usuario cuando en un 2fa login

  // Función para realizar el deslogueo
  const logout = useCallback(() => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
    setIsTwoFA(false);
    setPendingEmail(null);
    setPendingPassword(null);
  }, []);

  // Función para obtener el usuario actualmente logueado
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

  // Función que permite la autenticación del usuario
  const login = async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });
      if (response.data.token) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        fetchUser();
      } else {
        setIsTwoFA(true);
        setPendingEmail(email);
        setPendingPassword(password);
      }
    } catch (error) {
      console.error(
        "Error en login:",
        error.response?.data?.message || error.message
      );
    }
  };

  // Función que permite la autenticación con 2fa
  const verifyTwoFactor = async (otp) => {
    if (!pendingEmail || !pendingPassword) {
      console.error(
        "Error: No hay email/password disponibles para la verificación de 2FA"
      );
      return;
    }

    try {
      const response = await api.post("/2fa/verifyOtp", {
        email: pendingEmail,
        password: pendingPassword,
        otp,
      });

      if (response.data.token) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        await fetchUser();
        setPendingEmail(null);
        setPendingPassword(null);
        return response.data.token;
      }
    } catch (error) {
      console.error(
        "Error al verificar el OTP:",
        error.response?.data?.message || error.message
      );
      throw error;
    }
  };

  // Función que permite el registro de nuevos usuarios
  const register = async ({ name, email, password }) => {
    await api.post("/register", { name, email, password });
  };

  // Función para cancelar el flujo de 2FA y reiniciar el proceso de login
  const cancelTwoFactor = useCallback(() => {
    setIsTwoFA(false);
    setPendingEmail(null);
    setPendingPassword(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        verifyTwoFactor,
        fetchUser,
        isTwoFactorRequired: !!isTwoFA,
        cancelTwoFactor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Validación de props, tipos de datos
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
