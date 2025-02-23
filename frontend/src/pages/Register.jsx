import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import styled from "styled-components";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

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

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register({ name, email, password });
    navigate("/dashboard");
  };

  return (
    <RegisterContainer>
      <RegisterBox>
        <Title>Crear Cuenta</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit">Registrar</Button>
        </Form>
        <SwitchText>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </SwitchText>
      </RegisterBox>
    </RegisterContainer>
  );
};

export default Register;
