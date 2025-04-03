import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import styled from "styled-components";
import { Button } from "../components/ui/Button";
import { PaymentForm } from "../components/ui/PaymentForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import RefundForm from "../components/ui/RefundForm";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { Navbar } from "../components/ui/Navbar";
import { TransactionList } from "../components/ui/TransactionList";
import { Transaction } from "@/types/Transaction";

/*********************  ESTILOS  *********************/
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

const TransactionItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
  min-height: 80px;

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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: auto;
  padding: 1rem;
  width: 100%;
  position: sticky;
  bottom: 0;
  background: white;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
`;

const PaginationButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  background-color: #3b82f6;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background-color: #2563eb;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const PageNumber = styled.span`
  font-weight: bold;
  color: #374151;
  font-size: 1rem;
`;

/*********************  LÓGICA  *********************/
// Inicializamos Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);
  const limit = 10;

  const { updateBalance } = useAuth();

  // Funciones para refrescar el estado
  const fetchBalance = async () => {
    try {
      const response = await api.get("/wallet/balance");
      const newBalance = response.data.balance;
      setBalance(newBalance); // Actualizamos el balance localmente
      updateBalance(newBalance); // También actualizamos el contexto si es necesario
    } catch (error) {
      console.error("Error al obtener el saldo:", error);
    }
  };

  const fetchTransactions = async (page = 1) => {
    try {
      const response = await api.get(`/wallet/transactions`, {
        params: { page, limit },
      });

      if (
        response.data.transactions &&
        Array.isArray(response.data.transactions.data)
      ) {
        setTransactions(response.data.transactions.data);
        setCurrentPage(response.data.transactions.current_page);
        setNextPageUrl(response.data.transactions.next_page_url);
        setPrevPageUrl(response.data.transactions.prev_page_url);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error al obtener transacciones:", error);
    }
  };

  // Permite actualizar el balance y el listado de transacciones cuando de monta el componente
  useEffect(() => {
    fetchBalance();
    fetchTransactions(currentPage);
  }, []);

  const handleRefund = async (transaction: Transaction) => {
    try {
      const response = await api.put(
        `/wallet/refund/${transaction.id_transaction}`,
        {
          id_user: user?.id_user,
          amount: transaction.amount,
          payment_intent_id: transaction.id_transaction,
        }
      );

      toast.success(response.data.message || "Reembolso solicitado con éxito");

      // Actualizamos balance y transacciones
      await fetchBalance();
      await fetchTransactions();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error("Error al solicitar reembolso:", error);
        toast.error(
          error.response?.data?.error ||
            "Hubo un error al solicitar el reembolso."
        );
      } else {
        // Manejo de errores que no son de Axios (puedes agregar un manejo de errores general aquí)
        console.error("Error desconocido:", error);
        toast.error("Hubo un error desconocido.");
      }
    }
  };

  // Refrescar balance y listado de transacciones
  const handlePaymentSuccess = async () => {
    await fetchBalance();
    await fetchTransactions();
  };

  // Botón para activar 2FA (si no está habilitado)
  const handleActivateTwoFA = () => {
    navigate("/2fa-activation");
  };

  // Refrescar balance y listado de transacciones
  const handleRefundSuccess = async () => {
    await fetchBalance();
    await fetchTransactions();
  };

  const goToNextPage = () => {
    if (nextPageUrl) {
      setCurrentPage((prev) => prev + 1);
      fetchTransactions(currentPage + 1); // Recargar datos
    }
  };

  const goToPrevPage = () => {
    if (prevPageUrl) {
      setCurrentPage((prev) => prev - 1);
      fetchTransactions(currentPage - 1); // Recargar datos
    }
  };

  return (
    <DashboardContainer>
      {/* Barra de navegación */}
      <Navbar />

      {/* Bloque de Saldo y Cerrar Sesión */}
      {location.pathname === "/dashboard" && (
        <>
          {/* Bloque de Activación de 2FA */}
          {user && !user?.google2fa_enabled && (
            <TwoFAContainer>
              <Title>Seguridad</Title>
              <p>
                Activa la autenticación de dos factores para mayor seguridad.
              </p>
              <Button onClick={handleActivateTwoFA}>Activar 2FA</Button>
            </TwoFAContainer>
          )}

          {/* Bloque de Formulario de Pago */}
          <Card>
            <Elements stripe={stripePromise}>
              <PaymentForm onPaymentSuccess={handlePaymentSuccess} />
            </Elements>
          </Card>
        </>
      )}

      {/* Nuevo Bloque de Reembolso desde Saldo */}
      {location.pathname === "/refund" && (
        <Card>
          <RefundForm onRefundSuccess={handleRefundSuccess} />
        </Card>
      )}

      {/* Bloque de Historial de Transacciones */}
      {location.pathname === "/history" && (
        <TransactionList
          transactions={transactions}
          handleRefund={handleRefund}
          currentPage={currentPage}
          goToNextPage={goToNextPage}
          goToPrevPage={goToPrevPage}
          nextPageUrl={nextPageUrl}
          prevPageUrl={prevPageUrl}
        />
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
