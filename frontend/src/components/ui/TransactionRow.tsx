import styled from "styled-components";
import { Button } from "./Button";
import { Transaction } from "@/types/transaction";
import { useAuth } from "../../context/AuthContext";

/*********************  ESTILOS  *********************/

// Componente para cada fila de la transacción
const TransactionItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 3rem;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
  background-color: #fafafa;
  transition: background-color 0.3s;
  min-width: 1000px;

  &:hover {
    background-color: #f3f4f6;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Description = styled.span`
  font-size: 1rem;
  color: #374151;
  min-with: 5rem;
`;

const Status = styled.span`
  font-size: 1rem;
  color: #374151;
  min-with: 5rem;
`;

const Reason = styled.span`
  font-size: 1rem;
  color: #374151;
  min-with: 5rem;
`;

const Client = styled.span`
  font-size: 1rem;
  color: #374151;
  min-with: 5rem;
`;

const Amount = styled.span`
  font-size: 1rem;
  font-weight: bold;
  color: #16a34a;
  min-with: 5rem;
`;

const CreationDate = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
  min-with: 5rem;
`;

const CreationRefunded = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
  min-with: 5rem;
`;

const RefundButton = styled(Button)`
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
  background-color: #ef4444;
  color: white;
  border-radius: 8px;

  &:hover {
    background-color: #dc2626;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

/*********************  LÓGICA  *********************/

// Componente para cada fila
interface TransactionRowProps {
  transaction: Transaction;
  handleRefund: (transaction: Transaction) => Promise<void>;
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const TransactionRow = ({
  transaction,
  handleRefund,
}: TransactionRowProps) => {
  const { user } = useAuth();

  return (
    <TransactionItem>
      <Amount>{transaction.amount}€</Amount>
      <Status>{transaction.status}</Status>
      <Reason>{transaction.reason ?? ""}</Reason>
      <Description>{transaction.description}</Description>
      <Client>{user?.email}</Client>
      <CreationDate>{formatDate(transaction.date_created)}</CreationDate>
      <CreationRefunded>
        {transaction.date_refunded ? formatDate(transaction.date_refunded) : ""}
      </CreationRefunded>
      <div>
        {transaction.id_wallet_type === 1 &&
        transaction.status === "succeeded" ? (
          <RefundButton onClick={() => handleRefund(transaction)}>
            Reembolsar
          </RefundButton>
        ) : (
          <RefundButton disabled>Reembolsado</RefundButton>
        )}
      </div>
    </TransactionItem>
  );
};
