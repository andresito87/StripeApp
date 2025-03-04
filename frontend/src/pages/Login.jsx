// src/pages/Login.jsx
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import styled from "styled-components";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { toast } from "react-toastify";

/*********************  ESTILOS  *********************/

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  background-color: #f3f4f6;
  box-sizing: border-box;
`;

const LoginBox = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
`;

const SwitchText = styled.p`
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 1rem;

  a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

/*********************  LÓGICA  *********************/

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const { login, verifyTwoFactor, isTwoFactorRequired, cancelTwoFactor } =
    useContext(AuthContext);
  const navigate = useNavigate();

  // Login inicial con email y contraseña
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    if (!isTwoFactorRequired) {
      toast.success("Usuario autenticado correctamente");
      navigate("/dashboard");
    }
  };

  // Verificación del OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      await verifyTwoFactor(otp);
      toast.success("Usuario autenticado correctamente");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Código OTP inválido");
    }
  };

  // Función para cancelar el flujo de 2FA y reiniciar el login cuando el usuario vuelve al inicio
  const handleCancel = () => {
    cancelTwoFactor();
    setOtp("");
  };

  return (
    <LoginContainer>
      <LoginBox>
        <Title>Iniciar sesión</Title>

        {/* Si no se requiere autenticación 2fa, se muestra el formulario normal */}
        {!isTwoFactorRequired ? (
          <Form onSubmit={handleLoginSubmit}>
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit">Ingresar</Button>
          </Form>
        ) : (
          // Si se requiere 2FA, se muestra el formulario para la verificación del OTP
          <Form onSubmit={handleOtpSubmit}>
            <p>Introduce el código de Google Authenticator</p>
            <Input
              type="text"
              placeholder="Código OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <Button type="submit">Verificar OTP</Button>
          </Form>
        )}

        {/* Muestra un enlace para registrarse o se ofrece cancelar y volver al inicio de sesión. */}
        {!isTwoFactorRequired ? (
          <SwitchText>
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </SwitchText>
        ) : (
          <SwitchText>
            <a onClick={handleCancel} style={{ cursor: "pointer" }}>
              Volver al inicio de sesión
            </a>
          </SwitchText>
        )}
      </LoginBox>
    </LoginContainer>
  );
};

export default Login;
