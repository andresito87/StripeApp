// src/context/AuthProvider.jsx
import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { AuthContext, User } from "./AuthContext";
import { AxiosError } from "axios";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>({
    id_user: "",
    name: "",
    email: "",
    balance: 0,
    google2fa_enabled: false,
  });
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isTwoFA, setIsTwoFA] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(""); // permite almacenar temporalmente el email del usuario cuando en un 2fa login
  const [pendingPassword, setPendingPassword] = useState(""); // permite almacenar temporalmente el password del usuario cuando en un 2fa login

  // Función para realizar el deslogueo
  const logout = useCallback(() => {
    setUser({
      id_user: "",
      name: "",
      email: "",
      balance: 0,
      google2fa_enabled: false,
    });
    setToken("");
    localStorage.removeItem("token");
    setIsTwoFA(false);
    setPendingEmail("");
    setPendingPassword("");
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
  const login = async (email: string, password: string): Promise<string> => {
    try {
      const response = await api.post("/login", { email, password });
      if (response.data.token) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        await fetchUser();
        return "Login exitoso";
      } else {
        setIsTwoFA(true);
        setPendingEmail(email);
        setPendingPassword(password);
        return "Se requiere autenticación de dos factores";
      }
    } catch (error: unknown) {
      let errorResponse = "Error en login: ";

      if (error instanceof AxiosError) {
        errorResponse += error.response?.data?.message ?? error.message;
      } else if (error instanceof Error) {
        errorResponse += error.message;
      } else {
        errorResponse += "Error desconocido";
      }

      console.error(errorResponse);
      return errorResponse;
    }
  };

  // Función que permite la autenticación con 2fa
  const verifyTwoFactor = async (otp: string) => {
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
        setPendingEmail("");
        setPendingPassword("");
        return response.data.token;
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error(
          "Error al verificar el OTP:",
          error.response?.data?.message || error.message
        );
      } else if (error instanceof Error) {
        console.error("Error al verificar el OTP:", error.message);
      } else {
        console.error("Error al verificar el OTP: Error desconocido");
      }

      throw error;
    }
  };

  // Función que permite el registro de nuevos usuarios
  const register = async (name: string, email: string, password: string) => {
    const response = await api.post("/register", { name, email, password });
    if (response.status != 201) {
      return "Error en el registro";
    } else {
      return "Registro exitoso";
    }
  };

  // Función para cancelar el flujo de 2FA y reiniciar el proceso de login
  const cancelTwoFactor = useCallback(() => {
    setIsTwoFA(false);
    setPendingEmail("");
    setPendingPassword("");
  }, []);

  const updateBalance = (newBalance: number) => {
    setUser((user) => {
      // Verificar que `user` no sea null
      if (user) {
        return { ...user, balance: newBalance };
      }
      return user; // Retorna el valor actual si es null
    });
  };

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
        updateBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
