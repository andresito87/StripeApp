import { useState, useContext } from "react";
import PropTypes from "prop-types";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import styled from "styled-components";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { Button } from "./Button";
import { Input } from "./Input";
import StyledCardElement from "./StyledCardElement";

/*********************  ESTILOS  *********************/

const PaymentContainer = styled.div`
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

const PaymentForm = ({ onPaymentSuccess }) => {
  const [amount, setAmount] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useContext(AuthContext); // Obtener usuario autenticado
  const stripe = useStripe();
  const elements = useElements();

  // Función para realizar una recarga
  const handleMicropayment = async () => {
    if (!stripe || !elements || !user) {
      setErrorMessage("API de Stripe o Datos de usuario no disponibles");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      // Crear Método de pago en el cliente
      const { error: pmError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardElement),
          billing_details: {
            email: user.email,
            name: user.name,
          },
        });

      if (pmError) {
        setErrorMessage(`Error al crear el método de pago: ${pmError.message}`);
        setLoading(false);
        return;
      }

      // Enviar al servidor el paymentMethod.id para crear el PaymentIntent
      const response = await api.post("/wallet/put", {
        id_user: user.id_user,
        amount: parseInt(amount),
        payment_method_id: paymentMethod.id,
      });

      const { clientSecret } = response.data;
      if (!clientSecret) {
        throw new Error("No se obtuvo el clientSecret");
      }

      // Confirmar el pago en el cliente
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (error) {
        setErrorMessage(`Error al confirmar el pago: ${error.message}`);
      } else if (paymentIntent?.status === "succeeded") {
        setPaymentId(paymentIntent.id);
        setInfoMessage("¡Recarga exitosa!");
        setAmount("");

        // Obtener el CardElement y limpiarlo
        const cardElement = elements.getElement(CardElement);
        if (cardElement) {
          cardElement.clear();
        }

        // Notificar al Dashboard que la operación fue exitosa
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        setErrorMessage("Pago no completado");
      }
    } catch (error) {
      setErrorMessage(
        `Error en la transacción: ${
          error.response?.data?.error || error.message
        }`
      );
      console.error("Error en la transacción:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentContainer>
      {/* Título de la sección para recargar el saldo */}
      <Title>Recargar Saldo</Title>

      <Input
        type="number"
        placeholder="Ingrese la cantidad (€)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      {/* Elemento de la tarjeta de Stripe estilizado para capturar los datos de pago */}
      <StyledCardElement />
      <Button
        onClick={handleMicropayment}
        disabled={!stripe || !elements || loading}
      >
        {loading ? "Procesando..." : "Recargar"}
      </Button>

      {/* Si existe un paymentId, se muestra en pantalla */}
      {paymentId && <p>ID de pago: {paymentId}</p>}

      {/* Muestra un mensaje informativo si hay uno */}
      {infoMessage && <Message>{infoMessage}</Message>}

      {/* Muestra un mensaje de error si hay uno */}
      {errorMessage && <Message error>{errorMessage}</Message>}
    </PaymentContainer>
  );
};

// Validación de props, tipos de datos
PaymentForm.propTypes = {
  onPaymentSuccess: PropTypes.func,
};

export default PaymentForm;
