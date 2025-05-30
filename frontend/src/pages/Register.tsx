import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styled from "styled-components";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

/*********************  ESTILOS  *********************/

const RegisterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background-color: #eef2f7;
`;

const RegisterBox = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1);
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

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  // Función ejecutada al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!name || !email || !password) {
      toast.error("Todos los campos son obligatorios.");
      return;
    }

    try {
      await register(name, email, password);
      toast.success("Usuario registrado correctamente");
      navigate("/login");
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        // Manejo de errores específicos de Axios
        console.error("Error al realizar la solicitud:", err);
        toast.error(
          "Error: " +
            (err.response?.data?.email[0]
              ? "El email ya esta en uso"
              : "Ocurrió un error al registrar.")
        );
      } else {
        console.error("Error desconocido:", err);
        toast.error("Hubo un error desconocido.");
      }
    }
  };

  return (
    <RegisterContainer>
      <RegisterBox>
        <Title>Crear Cuenta</Title>
        {/* Formulario que se encarga de capturar y enviar los datos de registro */}
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Correo Electrónico"
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
          <Button type="submit">Registrar</Button>
        </Form>
        {/* Redirigir al usuario a la página de inicio de sesión si ya tiene una cuenta */}
        <SwitchText>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </SwitchText>
      </RegisterBox>
    </RegisterContainer>
  );
};

export default Register;
