import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import styled from "styled-components";
import api from "../../services/api";
import { Button } from "./Button";
import { Input } from "./Input";
import StyledCardElement from "./StyledCardElement";
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
      // Obtener el elemento CardElement
      const cardElement = elements.getElement(CardElement);

      // Verificar si CardElement está presente
      if (!cardElement) {
        toast.error("El elemento Stripe de tarjeta no está disponible");
        setLoading(false);
        return;
      }

      // Crear el método de pago en Stripe
      const { error: pmError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement, // me aseguro de que no es null
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
      console.log(user);
      // Enviar al backend el paymentMethod.id para que el servidor gestione la transacción
      const response = await api.post("/wallet/push", {
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
      // Aseguramos que el error sea un AxiosError
      if (axios.isAxiosError(error)) {
        // Si el error tiene una respuesta, mostrar el mensaje de error de la respuesta
        if (error.response) {
          // Error con respuesta del servidor (4xx, 5xx)
          toast.error(
            `${
              error.response.data?.error ||
              error.response.statusText ||
              "Error en la transacción"
            }`
          );
          console.error("Error en la transacción:", error.response);
        } else if (error.request) {
          // Error de red: no se recibió respuesta
          toast.error(
            "No se recibió respuesta del servidor. Intenta más tarde."
          );
          console.error("No se recibió respuesta:", error.request);
        } else {
          // Error relacionado con la configuración de la solicitud
          toast.error(`Error en la solicitud: ${error.message}`);
          console.error(
            "Error en la configuración de la solicitud:",
            error.message
          );
        }
      } else {
        // Si el error no es un AxiosError, lo manejamos genéricamente
        toast.error(`Error desconocido`);
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
