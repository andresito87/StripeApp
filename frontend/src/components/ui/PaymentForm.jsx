import { useState, useContext } from "react";
import PropTypes from "prop-types";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import styled from "styled-components";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { Button } from "./Button";
import { Input } from "./Input";
import StyledCardElement from "./StyledCardElement";
import { toast } from "react-toastify";

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

/*********************  LÓGICA  *********************/

const PaymentForm = ({ onPaymentSuccess }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext); // Obtener usuario autenticado
  const stripe = useStripe();
  const elements = useElements();

  // Función para realizar una recarga
  const handleMicropayment = async () => {
    if (!stripe || !elements || !user) {
      toast.error("API de Stripe o Datos de usuario no disponibles");
      return;
    }

    setLoading(true);

    try {
      // Crear el método de pago en Stripe
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
        toast.error(`Error al crear el método de pago: ${pmError.message}`);
        setLoading(false);
        return;
      }

      // Enviar al backend el paymentMethod.id para que el servidor gestione la transacción
      const response = await api.post("/wallet/put", {
        id_user: user.id_user,
        amount: parseInt(amount),
        payment_method_id: paymentMethod.id,
      });

      if (response.status === 200) {
        toast.success(response.data.message);
        setAmount("");

        // Limpiar el CardElement
        const cardElement = elements.getElement(CardElement);
        if (cardElement) {
          cardElement.clear();
        }

        // Notificar al Dashboard que la operación fue exitosa
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        throw new Error(response.data.error || "Error en la transacción");
      }
    } catch (error) {
      toast.error(`${error.response?.data?.error || error.message}`);
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
    </PaymentContainer>
  );
};

// Validación de props, tipos de datos
PaymentForm.propTypes = {
  onPaymentSuccess: PropTypes.func,
};

export default PaymentForm;
