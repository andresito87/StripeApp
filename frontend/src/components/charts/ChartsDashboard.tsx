import styled from "styled-components";
import PieChart from "./PieChart";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { Transaction } from "@/types/transaction";
import BarChart from "./BarChart";

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Se apilan en pantallas pequeñas */
  }
`;

const LoadingText = styled.p`
  text-align: center;
  padding-top: 200px;
  grid-column: span 2;
`;

const ChartsDashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactionsByType();
  }, []);

  const fetchTransactionsByType = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/wallet/graphics-data`);

      // obtengo el resumen de tipo de transacciones
      if (
        response.data.resumen_tipo_transacciones &&
        Array.isArray(response.data.resumen_tipo_transacciones)
      ) {
        setTransactions(response.data.resumen_tipo_transacciones);
      } else {
        setTransactions([]);
      }

      // obtengo el resumen de transacciones por meses
    } catch (error) {
      console.error("Error al obtener transacciones:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChartsGrid>
      {loading ? (
        <LoadingText>Cargando gráficos...</LoadingText>
      ) : (
        <>
          <PieChart data={transactions} />
          <BarChart
            data={[
              { mes: "Enero", exitosas: 150, fallidas: 20 },
              { mes: "Febrero", exitosas: 130, fallidas: 35 },
              { mes: "Marzo", exitosas: 160, fallidas: 25 },
              { mes: "Abril", exitosas: 140, fallidas: 30 },
              { mes: "Mayo", exitosas: 180, fallidas: 15 },
              { mes: "Junio", exitosas: 170, fallidas: 22 },
              { mes: "Julio", exitosas: 155, fallidas: 28 },
              { mes: "Agosto", exitosas: 165, fallidas: 18 },
              { mes: "Septiembre", exitosas: 175, fallidas: 27 },
              { mes: "Octubre", exitosas: 160, fallidas: 24 },
              { mes: "Noviembre", exitosas: 150, fallidas: 30 },
              { mes: "Diciembre", exitosas: 200, fallidas: 20 },
            ]}
          />
        </>
      )}
    </ChartsGrid>
  );
};

export default ChartsDashboard;
