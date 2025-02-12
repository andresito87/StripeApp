import { useState, useContext } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import styled from "styled-components";
import { AuthContext } from "../../context/AuthContext"; // 🔹 Para obtener el usuario autenticado
import api from "../../services/api"; // 🔹 Axios configurado
import { Button } from "./Button";
import { Input } from "./Input";
import StyledCardElement from "./StyledCardElement";
import CardInfo from "./InfoBox";

// Contenedor estilizado
const PaymentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 100%;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const PaymentForm = () => {
  const [amount, setAmount] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext); // 🔹 Obtener usuario autenticado
  const stripe = useStripe();
  const elements = useElements();

  const handleMicropayment = async () => {
    if (!stripe || !elements || !user) {
      alert("Stripe o usuario no disponible");
      return;
    }

    setLoading(true);

    try {
      // 🔹 1. Crear el PaymentIntent en Laravel
      const response = await api.post("/wallet/put", {
        id_user: user.id_user, // ID del usuario autenticado
        amount: parseInt(amount), // Convertir cantidad a número
        payment_method_id: elements.getElement(CardElement), // Token de pago de Stripe
      });

      const { clientSecret } = response.data;
      if (!clientSecret) throw new Error("No se obtuvo el clientSecret");

      // 🔹 2. Confirmar el pago con Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: { email: user.email },
          },
        }
      );

      if (error) {
        alert("Error en el pago: " + error.message);
      } else {
        setPaymentId(paymentIntent.id);
        alert("Recarga exitosa!");
      }
    } catch (error) {
      alert(
        `Error en la transacción: ${
          error.response?.data?.error || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentContainer>
      <Title>Recargar Saldo</Title>
      <p>Usuario: {user?.name}</p>
      <Input
        type="number"
        placeholder="Ingrese el monto (€)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <StyledCardElement />
      <Button
        onClick={handleMicropayment}
        disabled={!stripe || !elements || loading}
      >
        {loading ? "Procesando..." : "Recargar"}
      </Button>
      {paymentId && <CardInfo paymentIntentId={paymentId} />}
    </PaymentContainer>
  );
};

export default PaymentForm;
