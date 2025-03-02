import { useState, useContext } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { Button } from "./Button";
import { Input } from "./Input";

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

const Message = styled.p`
  font-size: 1rem;
  margin-top: 1rem;
  color: ${(props) => (props.error ? "#ef4444" : "#10b981")};
`;

/*********************  LÓGICA  *********************/

const RefundForm = ({ onRefundSuccess }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useContext(AuthContext); // Obtener usuario autenticado

  const handleRefund = async () => {
    if (!user) {
      setErrorMessage("Usuario no autenticado.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      // Enviar la solicitud de reembolso al backend
      const response = await api.post("/wallet/popFromBalance", {
        id_user: user.id_user,
        amount: parseFloat(amount),
      });

      if (response.data.refund.status === "succeeded") {
        setInfoMessage("¡Reembolso procesado con éxito!");
        setAmount("");

        // Notificar al Dashboard que la operación fue exitosa
        if (onRefundSuccess) {
          onRefundSuccess();
        }
      } else {
        throw new Error(response.data.error || "Error en el reembolso");
      }
    } catch (error) {
      setErrorMessage(
        `Error en el reembolso: ${error.response?.data?.error || error.message}`
      );
      console.error("Error en el reembolso:", error);
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
      />

      <Button onClick={handleRefund} disabled={loading}>
        {loading ? "Procesando..." : "Solicitar Reembolso"}
      </Button>

      {/* Muestra un mensaje informativo si hay uno */}
      {infoMessage && <Message>{infoMessage}</Message>}

      {/* Muestra un mensaje de error si hay uno */}
      {errorMessage && <Message error>{errorMessage}</Message>}
    </RefundContainer>
  );
};

// Validación de props, tipos de datos
RefundForm.propTypes = {
  onRefundSuccess: PropTypes.func,
};

export default RefundForm;
