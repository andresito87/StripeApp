import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PropTypes from "prop-types";
import { AuthContext } from "./context/AuthContext";
import { AuthProvider } from "./context/AuthProvider";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import TwoFactorActivation from "./pages/TwoFactorActivation";
/* Libreria de toast usada en toda la aplicación */
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Definición del componente PrivateRoute para proteger rutas autenticadas
const PrivateRoute = ({ children }) => {
  const { token } = React.useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};

// Definición del componente PublicRoute para evitar que usuarios autenticados accedan a login o registro
const PublicRoute = ({ children }) => {
  const { token } = React.useContext(AuthContext);
  return token ? <Navigate to="/dashboard" /> : children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas, si el usuario está autenticado redirige al dashboard */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Rutas privadas, accesibles solo si el usuario está autenticado */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route path="/2fa-activation" element={<TwoFactorActivation />} />

          {/* Redirigir cualquier ruta desconocida al dashboard si está autenticado, o al login si no */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
