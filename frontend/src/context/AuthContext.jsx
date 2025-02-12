import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get("/user");
      setUser(response.data);
    } catch (error) {
      console.log(error);
      logout();
    }

    AuthProvider.propTypes = {
      children: PropTypes.node.isRequired,
    };
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      fetchUser();
    } catch (error) {
      console.error("Error en login:", error);
    }
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
