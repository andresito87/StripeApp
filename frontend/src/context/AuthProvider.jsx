// src/context/AuthProvider.jsx
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [twoFAToken, setTwoFAToken] = useState(null);

  const logout = useCallback(() => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
    setTwoFAToken(null);
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

  const login = async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });
      if (response.data.two_fa_required || response.data["2fa_required"]) {
        setTwoFAToken(response.data.two_fa_token || response.data["2fa_token"]);
      } else if (response.data.token) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        fetchUser();
      }
    } catch (error) {
      console.error(
        "Error en login:",
        error.response?.data?.message || error.message
      );
    }
  };

  const verifyTwoFactor = async (otp) => {
    try {
      const response = await api.post(
        "/2fa/verify-login",
        { otp },
        {
          headers: {
            Authorization: `Bearer ${twoFAToken}`,
          },
        }
      );
      if (response.data.token) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        await fetchUser();
        setTwoFAToken(null);
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

  // Función para cancelar el flujo de 2FA y reiniciar el proceso de login
  const cancelTwoFactor = useCallback(() => {
    setTwoFAToken(null);
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
        isTwoFactorRequired: !!twoFAToken,
        cancelTwoFactor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
