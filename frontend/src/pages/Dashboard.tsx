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
import { Transaction } from "@/types/transaction";
import TransactionFilters from "../components/ui/TransactionsFilter";

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

const TwoFAContainer = styled(Card)`
  width: 100%;
  margin-top: 1rem;
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
  const [filters, setFilters] = useState({});
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

  const fetchTransactions = async (page = 1, filters = {}) => {
    try {
      const response = await api.get(`/wallet/transactions`, {
        params: { page, limit, ...filters },
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
    fetchTransactions(currentPage, filters);
  }, [filters, currentPage]);

  // Función para manejar el cambio de filtros
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // resetear a la primera página al cambiar filtros
  };

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
        <>
          {/* Filtros de transacciones */}
          <TransactionFilters onFilterChange={handleFilterChange} />
          <TransactionList
            transactions={transactions}
            handleRefund={handleRefund}
            currentPage={currentPage}
            goToNextPage={goToNextPage}
            goToPrevPage={goToPrevPage}
            nextPageUrl={nextPageUrl}
            prevPageUrl={prevPageUrl}
          />
        </>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
