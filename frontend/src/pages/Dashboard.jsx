import { useContext, useEffect, useState } from "react";
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
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  background-color: #f9fafb;
  min-height: 100vh;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Card = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
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
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;

  &:last-child {
    border-bottom: none;
  }
`;

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

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

  return (
    <DashboardContainer>
      <Card>
        <Title>Bienvenido, {user?.name}</Title>
        <Balance>Saldo actual: €{balance}</Balance>
        <Button onClick={logout} variant="destructive">
          Cerrar Sesión
        </Button>
      </Card>
      <Card>
        <Elements stripe={stripePromise}>
          <PaymentForm />
        </Elements>
      </Card>
      <TransactionsContainer>
        <Title>Historial de Transacciones</Title>
        <TransactionList>
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <TransactionItem key={tx.id_wallet}>
                {tx.description} - €{tx.amount} -{" "}
                {new Date(tx.date_create).toLocaleString()}
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
