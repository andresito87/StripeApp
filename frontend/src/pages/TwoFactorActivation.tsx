import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

/*********************  ESTILOS  *********************/

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
  min-height: 100vh;
  background-color: #f3f4f6;
`;

const Box = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const QRImage = styled.img`
  width: 300px;
  height: auto;
  margin: 1rem 0;
`;

/*********************  LÓGICA  *********************/

const TwoFactorActivation = () => {
  const [qrImage, setQrImage] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Generar secreto y QR
  const generateSecret = async () => {
    try {
      const response = await api.post("/2fa/generate-secret");
      setQrImage(`data:image/png;base64,${response.data.qr_image}`);
    } catch (error) {
      console.error("Error al generar el secreto:", error);
      toast.error("Error al generar el código QR para 2FA.");
    }
  };

  // Generar secreto y QR al montar el componente
  React.useEffect(() => {
    generateSecret();
  }, []);

  const { fetchUser } = useAuth();

  // Función encargada de verificar el 2fa y su código secreto asociado en la app
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Envía el OTP al endpoint para activar el 2FA
      await api.post("/2fa/verify-enablement", { otp });
      await fetchUser(); // Actualiza el objeto user en el contexto
      toast.success("2FA habilitado correctamente.");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error("Error al verificar OTP:", error);
        toast.error(
          error.response?.data?.message || "Código OTP inválido o expirado."
        );
      } else {
        console.error("Error desconocido:", error);
        toast.error("Hubo un error desconocido.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Funcion ejecutada para cancelar el proceso de activación de 2fa
  const handleReturn = () => {
    navigate("/dashboard");
  };

  return (
    <Container>
      <Box>
        <Title>Activar Autenticación de Dos Factores (2FA)</Title>
        {qrImage ? (
          <>
            <p>
              Escanea el siguiente código QR con tu aplicación de autenticación
              Google Authenticator:
            </p>
            <QRImage src={qrImage} alt="Código QR 2FA" />
          </>
        ) : (
          <p>Cargando código QR...</p>
        )}
        <form onSubmit={handleVerify}>
          <Input
            type="text"
            placeholder="Ingresa el código OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Verificando..." : "Activar 2FA"}
          </Button>
        </form>
        {/* Botón para volver al Dashboard */}
        <Button onClick={handleReturn} style={{ marginTop: "1rem" }}>
          Volver al Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default TwoFactorActivation;
