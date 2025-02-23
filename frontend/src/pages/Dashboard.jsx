import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import styled from "styled-components";
import { Button } from "../components/ui/Button";
import PaymentForm from "../components/ui/PaymentForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column; /* Forzar columna */
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background-color: #f9fafb;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
`;

const Card = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: none;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const Balance = styled.p`
  font-size: 1.5rem;
  font-weight: bold;
  color: #10b981;
  margin-bottom: 1rem;
`;

const TwoFAContainer = styled(Card)`
  width: 100%;
  margin-top: 1rem;
`;

const TransactionsContainer = styled(Card)`
  text-align: left;
  max-width: 500px;
`;

const TransactionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TransactionItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;

  &:last-child {
    border-bottom: none;
  }
`;

const RefundButton = styled(Button)`
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
  background-color: #ef4444;
  color: white;
  &:hover {
    background-color: #dc2626;
  }
`;

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  // Funciones para refrescar el estado
  const fetchBalance = async () => {
    try {
      const response = await api.get("/wallet/balance");
      setBalance(response.data.balance);
    } catch (error) {
      console.error("Error al obtener el saldo:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get("/wallet/transactions");
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error("Error al obtener transacciones:", error);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  const handleRefund = async (transaction) => {
    const confirmRefund = window.confirm(
      "¿Estás seguro de que deseas solicitar un reembolso?"
    );
    if (!confirmRefund) return;

    try {
      const response = await api.post(`/wallet/pop`, {
        id_user: user.id_user,
        amount: transaction.amount,
        payment_intent_id: transaction.id_transaction,
      });

      alert(response.data.message || "Reembolso solicitado con éxito");

      // Actualizamos balance y transacciones
      await fetchBalance();
      await fetchTransactions();
    } catch (error) {
      console.error("Error al solicitar reembolso:", error);
      alert(
        error.response?.data?.error ||
          "Hubo un error al solicitar el reembolso."
      );
    }
  };

  const handlePaymentSuccess = async () => {
    await fetchBalance();
    await fetchTransactions();
  };

  // Botón para activar 2FA (si no está habilitado)
  const handleActivateTwoFA = () => {
    console.log("Activando 2FA");
    navigate("/2fa-activation");
  };

  return (
    <DashboardContainer>
      {/* Bloque de Saldo y Cerrar Sesión */}
      <Card>
        <Title>Bienvenido, {user?.name}</Title>
        <Balance>Saldo actual: €{balance}</Balance>
        <Button onClick={logout} variant="destructive">
          Cerrar Sesión
        </Button>
      </Card>

      {/* Bloque de Activación de 2FA */}
      {user && !user.google2fa_enabled && (
        <TwoFAContainer>
          <Title>Seguridad</Title>
          <p>Activa la autenticación de dos factores para mayor seguridad.</p>
          <Button onClick={handleActivateTwoFA}>Activar 2FA</Button>
        </TwoFAContainer>
      )}

      {/* Bloque de Formulario de Pago */}
      <Card>
        <Elements stripe={stripePromise}>
          <PaymentForm onPaymentSuccess={handlePaymentSuccess} />
        </Elements>
      </Card>

      {/* Bloque de Historial de Transacciones */}
      <TransactionsContainer>
        <Title>Historial de Transacciones</Title>
        <TransactionList>
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <TransactionItem key={tx.id_wallet}>
                <span>
                  {tx.description} - €{tx.amount} -{" "}
                  {new Date(tx.date_create).toLocaleString()}
                </span>
                {tx.id_wallet_type === 2 ? (
                  <RefundButton disabled>Reembolsado</RefundButton>
                ) : (
                  <RefundButton onClick={() => handleRefund(tx)}>
                    Reembolso
                  </RefundButton>
                )}
              </TransactionItem>
            ))
          ) : (
            <p>No hay transacciones aún.</p>
          )}
        </TransactionList>
      </TransactionsContainer>
    </DashboardContainer>
  );
};

export default Dashboard;
