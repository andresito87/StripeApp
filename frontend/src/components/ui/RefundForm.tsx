import { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { Button } from "./Button";
import { Input } from "./Input";
import { toast } from "react-toastify";
import axios from "axios";
import { useStripe, useElements, IbanElement } from "@stripe/react-stripe-js";

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

const StripeElementWrapper = styled.div`
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e0;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  font-size: 1rem;

  .StripeElement {
    width: 100%;
  }
`;

/*********************  LÓGICA  *********************/
const RefundForm = ({ onRefundSuccess }) => {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const stripe = useStripe();
  const elements = useElements();

  const handleRefund = async () => {
    if (!user || !stripe || !elements) {
      toast.error("Stripe o usuario no disponible");
      return;
    }

    const ibanElement = elements.getElement(IbanElement);

    setLoading(true);

    try {
      if (!ibanElement) {
        toast.error("Por favor, introduce un IBAN válido.");
        setLoading(false);
        return;
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "sepa_debit",
        sepa_debit: ibanElement,
        billing_details: {
          name: user.name,
          email: user.email,
        },
      });

      if (error) {
        toast.error(`Error creando método de pago: ${error.message}`);
        setLoading(false);
        return;
      }

      const response = await api.patch("/wallet/refundToBankAccount", {
        id_user: user.id_user,
        amount: parseFloat(amount),
        payment_method_id: paymentMethod.id,
        bank_name: bankName,
      });

      if (response.data.refund.status === "processing") {
        toast.success("Reembolso solicitado con éxito");
        setAmount("");
        setBankName("");
        ibanElement?.clear();
        if (onRefundSuccess) onRefundSuccess();
      } else {
        throw new Error(response.data.error || "Error en el reembolso");
      }
    } catch (error) {
      toast.error("Error procesando el reembolso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RefundContainer>
      <Title>Solicitar Reembolso desde Saldo</Title>

      <Input
        type="number"
        placeholder="Cantidad (€)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required={true}
      />
      <Input
        type="text"
        placeholder="Nombre del banco"
        value={bankName}
        onChange={(e) => setBankName(e.target.value)}
        required={true}
      />

      <StripeElementWrapper>
        <IbanElement
          options={{
            supportedCountries: ["SEPA"],
            placeholderCountry: "ES",
            style: {
              base: {
                fontSize: "16px",
                color: "#1f2937",
                "::placeholder": { color: "#a0aec0" },
              },
              invalid: {
                color: "#e53e3e",
              },
            },
          }}
        />
      </StripeElementWrapper>

      <Button onClick={handleRefund} disabled={loading}>
        {loading ? "Procesando..." : "Solicitar Reembolso"}
      </Button>
    </RefundContainer>
  );
};
export default RefundForm;
