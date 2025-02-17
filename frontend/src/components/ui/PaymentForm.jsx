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
      // 1️⃣ Crear PaymentMethod en el cliente
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
        alert(`Error al crear el método de pago: ${pmError.message}`);
        setLoading(false);
        return;
      }

      // 2️⃣ Enviar al servidor el paymentMethod.id para crear el PaymentIntent
      const response = await api.post("/wallet/put", {
        id_user: user.id_user,
        amount: parseInt(amount),
        payment_method_id: paymentMethod.id,
      });

      const { clientSecret } = response.data;

      if (!clientSecret) {
        throw new Error("No se obtuvo el clientSecret");
      }

      // 3️⃣ Confirmar el pago en el cliente
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (error) {
        console.error("Error al confirmar el pago:", error);
        alert(`Error al confirmar el pago: ${error.message}`);
      } else if (paymentIntent?.status === "succeeded") {
        setPaymentId(paymentIntent.id);
        alert("Recarga exitosa!");
      } else {
        console.warn("El pago no se completó:", paymentIntent);
        alert("Pago no completado");
      }
    } catch (error) {
      alert(
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
