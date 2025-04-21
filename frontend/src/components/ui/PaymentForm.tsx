import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import styled from "styled-components";
import api from "../../services/api";
import { Button } from "./Button";
import { Input } from "./Input";
import { StyledCardElement } from "./StyledCardElement";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

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

export const PaymentForm = ({ onPaymentSuccess }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
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
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        toast.error("El elemento Stripe de tarjeta no está disponible");
        setLoading(false);
        return;
      }

      // Crear método de pago
      const { error: pmError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
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

      // Primer intento de pago
      let response = await api.post("/wallet/push", {
        id_user: user.id_user,
        amount: parseInt(amount),
        payment_method_id: paymentMethod.id,
      });

      let data = response.data;

      // Si requiere autenticación (3D Secure)
      if (data.requires_action) {
        const { error: confirmError, paymentIntent } =
          await stripe.handleCardAction(data.payment_intent_client_secret);

        if (confirmError) {
          toast.error(`Autenticación fallida: ${confirmError.message}`);
          setLoading(false);
          return;
        }

        // Confirmar intento en el servidor
        response = await api.post("/wallet/push", {
          id_user: user.id_user,
          amount: parseInt(amount), // Reenviamos el monto por seguridad (opcional)
          payment_intent_id: paymentIntent.id,
        });

        data = response.data;

        if (data.error) {
          throw new Error(data.error);
        }
      }

      // Si todo fue bien
      toast.success(data.message || "Recarga completada con éxito");
      setAmount("");

      const cardElementClear = elements.getElement(CardElement);
      if (cardElementClear) {
        cardElementClear.clear();
      }

      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          toast.error(error.response.data?.error || "Error en la transacción");
          console.error("Error en la transacción:", error.response);
        } else if (error.request) {
          toast.error(
            "No se recibió respuesta del servidor. Intenta más tarde."
          );
          console.error("No se recibió respuesta:", error.request);
        } else {
          toast.error(`Error en la solicitud: ${error.message}`);
          console.error("Error en la solicitud:", error.message);
        }
      } else {
        toast.error("Error desconocido");
        console.error("Error desconocido:", error);
      }
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
        required
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
