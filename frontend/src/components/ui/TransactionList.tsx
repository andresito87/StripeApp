import styled from "styled-components";
import { Transaction } from "@/types/transaction";
import { TransactionRow } from "./TransactionRow";

/*********************  ESTILOS  *********************/
const TransactionsContainer = styled.div`
  text-align: left;
  max-width: 1200px;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  color: #1f2937;
  margin-top: 0rem;
  margin-bottom: 1rem;
`;

const ListWrapper = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* Mejora el desplazamiento en dispositivos táctiles */
  width: 100%;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
`;

const Header = styled.li`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 12px;
  font-weight: bold;
  color: #1f2937;
  background-color: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  min-width: 1000px;
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
      <ListWrapper>
        {/* Cabecera de la tabla */}
        <Header>
          <span>Importe</span>
          <span>Estado</span>
          <span>Motivo</span>
          <span>Descripción</span>
          <span>Cliente</span>
          <span>Fecha Creación</span>
          <span>Fecha Reembolso</span>
          <span>Acciones</span>
        </Header>
        <List>
          {transactions.length > 0 ? (
            [
              ...transactions,
              ...Array(Math.max(0, 5 - transactions.length)).fill(null), // Llena los huecos con null
            ].map((transaction, index) => (
              <div key={transaction ? transaction.id_wallet : `empty-${index}`}>
                {transaction ? (
                  <TransactionRow
                    transaction={transaction}
                    handleRefund={handleRefund}
                  />
                ) : (
                  <span style={{ visibility: "hidden" }}>───</span>
                )}
              </div>
            ))
          ) : (
            <p>No hay transacciones registradas.</p>
          )}
        </List>
      </ListWrapper>

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
