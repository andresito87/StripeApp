import styled from "styled-components";
import { Button } from "./Button";
import { Transaction } from "@/types/Transaction";

/*********************  ESTILOS  *********************/
const TransactionsContainer = styled.div`
  text-align: left;
  max-width: 500px;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const Item = styled.li`
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

/*********************  ESTILOS DE PAGINACIÓN  *********************/
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
interface TransactionListProps {
  transactions: Transaction[];
  handleRefund: (transaction: Transaction) => Promise<void>;
  currentPage: number;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  nextPageUrl: string | null;
  prevPageUrl: string | null;
}

export const TransactionList = ({
  transactions,
  handleRefund,
  currentPage,
  goToNextPage,
  goToPrevPage,
  nextPageUrl,
  prevPageUrl,
}: TransactionListProps) => {
  return (
    <TransactionsContainer>
      <Title>Historial de Transacciones</Title>
      <List>
        {transactions.length > 0 ? (
          [
            ...transactions,
            ...Array(Math.max(0, 5 - transactions.length)).fill(null), // Llena los huecos con null
          ].map((transaction, index) => (
            <Item key={transaction?.id_wallet || `empty-${index}`}>
              {transaction ? (
                <>
                  <span>
                    {transaction.description} - {transaction.amount}€ -{" "}
                    {transaction.date_refunded
                      ? new Date(transaction.date_refunded).toLocaleString()
                      : new Date(transaction.date_created).toLocaleString()}
                  </span>
                  {transaction.id_wallet_type === 1 &&
                  transaction.status === "succeeded" ? (
                    <RefundButton onClick={() => handleRefund(transaction)}>
                      Reembolsar
                    </RefundButton>
                  ) : (
                    <RefundButton disabled>Reembolsado</RefundButton>
                  )}
                </>
              ) : (
                <span style={{ visibility: "hidden" }}>───</span>
              )}
            </Item>
          ))
        ) : (
          <p>No hay transacciones registradas.</p>
        )}
      </List>

      {transactions.length > 0 && (
        <PaginationContainer>
          <PaginationButton onClick={goToPrevPage} disabled={!prevPageUrl}>
            Anterior
          </PaginationButton>

          <PageNumber>Página {currentPage}</PageNumber>

          <PaginationButton onClick={goToNextPage} disabled={!nextPageUrl}>
            Siguiente
          </PaginationButton>
        </PaginationContainer>
      )}
    </TransactionsContainer>
  );
};
