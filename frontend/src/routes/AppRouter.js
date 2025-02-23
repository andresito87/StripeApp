import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import { AuthProvider, AuthContext } from "../context/AuthContext";
import PropTypes from "prop-types";
import Register from "../pages/Register";
import TwoFactorActivation from "../pages/TwoFactorActivation";
import { setNavigate } from "../services/NavigationService";

const PrivateRoute = ({ children }) => {
  const { token } = React.useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};
PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

const AppRouter = () => {
  const SetNavigation = () => {
    const navigate = useNavigate();
    React.useEffect(() => {
      setNavigate(navigate);
    }, [navigate]);
    return null;
  };

  return (
    <AuthProvider>
      <Router>
        <SetNavigation />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/2fa-activation"
            element={
              <PrivateRoute>
                <TwoFactorActivation />
              </PrivateRoute>
            }
          />
          {/* <Route path="*" element={<Navigate to="/dashboard" />} /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;
