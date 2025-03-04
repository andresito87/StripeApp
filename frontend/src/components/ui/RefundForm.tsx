import { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { Button } from "./Button";
import { Input } from "./Input";
import { toast } from "react-toastify";
import axios from "axios";

/*********************  ESTILOS  *********************/
const RefundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.15);
  width: 100%;
  box-sizing: border-box;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
`;

/*********************  LÓGICA  *********************/

const RefundForm = ({ onRefundSuccess }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // Obtener usuario autenticado

  const handleRefund = async () => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setLoading(true);

    try {
      // Enviar la solicitud de reembolso al backend
      const response = await api.post("/wallet/popFromBalance", {
        id_user: user.id_user,
        amount: parseFloat(amount),
      });

      if (response.data.refund.status === "succeeded") {
        toast.success(
          response.data.message || "Reembolso solicitado con éxito"
        );
        setAmount("");

        // Notificar al Dashboard que la operación fue exitosa
        if (onRefundSuccess) {
          onRefundSuccess();
        }
      } else {
        throw new Error(response.data.error || "Error en el reembolso");
      }
    } catch (error) {
      // Verificar si es un error de respuesta (responde con 4xx o 5xx)
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Error con respuesta del servidor (4xx, 5xx)
          toast.error(
            `Error en el reembolso: ${
              error.response.data?.error ||
              error.response.statusText ||
              "Error desconocido"
            }`
          );
          console.error("Error en el reembolso - Respuesta:", error.response);
        } else if (error.request) {
          // Error de red: no se recibió respuesta del servidor
          toast.error(
            "No se recibió respuesta del servidor. Intenta más tarde."
          );
          console.error("Error en el reembolso - Solicitud:", error.request);
        } else {
          // Error relacionado con la configuración de la solicitud
          toast.error(`Error de configuración: ${error.message}`);
          console.error(
            "Error en el reembolso - Configuración:",
            error.message
          );
        }
      } else {
        // Si el error no es un AxiosError, se trata de un error desconocido
        toast.error("Error desconocido");
        console.error("Error en el reembolso - Desconocido:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <RefundContainer>
      <Title>Solicitar Reembolso desde Saldo</Title>

      <Input
        type="number"
        placeholder="Ingrese la cantidad a reembolsar (€)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <Button onClick={handleRefund} disabled={loading}>
        {loading ? "Procesando..." : "Solicitar Reembolso"}
      </Button>
    </RefundContainer>
  );
};

// Validación de props, tipos de datos
RefundForm.propTypes = {
  onRefundSuccess: PropTypes.func,
};

export default RefundForm;
