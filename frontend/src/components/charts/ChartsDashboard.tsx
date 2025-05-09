import styled from "styled-components";
import PieChart from "./PieChart";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { Transaction } from "@/types/transaction";
import BarChart from "./BarChart";
import StreamChart from "./StreamChart";
import RadialBarChart from "./RadialBarChart";

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8rem;
  align-items: start;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingText = styled.p`
  text-align: center;
  padding-top: 200px;
  grid-column: span 2;
`;

const ChartsDashboard = () => {
  const [dataPieChart, setDataPieChart] = useState<Transaction[]>([]);
  const [dataBarChart, setDataBarChart] = useState<Transaction[]>([]);
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
        setDataPieChart(response.data.resumen_tipo_transacciones);
      } else {
        setDataPieChart([]);
      }

      // obtengo el resumen de transacciones por meses
      if (
        response.data.transacciones_mensuales &&
        Array.isArray(response.data.transacciones_mensuales)
      ) {
        setDataBarChart(response.data.transacciones_mensuales);
      } else {
        setDataBarChart([]);
      }
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
          <PieChart data={dataPieChart} />
          <BarChart data={dataBarChart} />
        </>
      )}
    </ChartsGrid>
  );
};

export default ChartsDashboard;
