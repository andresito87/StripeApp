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
          <StreamChart
            data={[
              {
                "Producto 1": 24,
                "Producto 2": 177,
                "Producto 3": 80,
                "Producto 4": 74,
              },
              {
                "Producto 1": 14,
                "Producto 2": 136,
                "Producto 3": 105,
                "Producto 4": 16,
              },
              {
                "Producto 1": 150,
                "Producto 2": 175,
                "Producto 3": 34,
                "Producto 4": 173,
              },
              {
                "Producto 1": 181,
                "Producto 2": 165,
                "Producto 3": 39,
                "Producto 4": 190,
              },
              {
                "Producto 1": 78,
                "Producto 2": 39,
                "Producto 3": 137,
                "Producto 4": 67,
              },
              {
                "Producto 1": 48,
                "Producto 2": 101,
                "Producto 3": 133,
                "Producto 4": 165,
              },
              {
                "Producto 1": 82,
                "Producto 2": 54,
                "Producto 3": 35,
                "Producto 4": 180,
              },
              {
                "Producto 1": 60,
                "Producto 2": 65,
                "Producto 3": 13,
                "Producto 4": 40,
              },
              {
                "Producto 1": 42,
                "Producto 2": 88,
                "Producto 3": 169,
                "Producto 4": 200,
              },
              {
                "Producto 1": 42,
                "Producto 2": 108,
                "Producto 3": 169,
                "Producto 4": 160,
              },
              {
                "Producto 1": 42,
                "Producto 2": 98,
                "Producto 3": 139,
                "Producto 4": 100,
              },
              {
                "Producto 1": 102,
                "Producto 2": 78,
                "Producto 3": 169,
                "Producto 4": 210,
              },
              {
                "Producto 1": 42,
                "Producto 2": 88,
                "Producto 3": 169,
                "Producto 4": 200,
              },
            ]}
          />
          <RadialBarChart
            data={[
              {
                id: "Primavera",
                data: [
                  {
                    x: "Producto 1",
                    y: 194,
                  },
                  {
                    x: "Producto 2",
                    y: 144,
                  },
                  {
                    x: "Producto 3",
                    y: 96,
                  },
                  {
                    x: "Producto 4",
                    y: 126,
                  },
                ],
              },
              {
                id: "Verano",
                data: [
                  {
                    x: "Producto 1",
                    y: 243,
                  },
                  {
                    x: "Producto 2",
                    y: 134,
                  },
                  {
                    x: "Producto 3",
                    y: 242,
                  },
                  {
                    x: "Producto 4",
                    y: 132,
                  },
                ],
              },
              {
                id: "Otoño",
                data: [
                  {
                    x: "Producto 1",
                    y: 141,
                  },
                  {
                    x: "Producto 2",
                    y: 180,
                  },
                  {
                    x: "Producto 3",
                    y: 196,
                  },
                  {
                    x: "Producto 4",
                    y: 185,
                  },
                ],
              },
              {
                id: "Invierno",
                data: [
                  {
                    x: "Producto 1",
                    y: 202,
                  },
                  {
                    x: "Producto 2",
                    y: 185,
                  },
                  {
                    x: "Producto 3",
                    y: 180,
                  },
                  {
                    x: "Producto 4",
                    y: 183,
                  },
                ],
              },
            ]}
          />
        </>
      )}
    </ChartsGrid>
  );
};

export default ChartsDashboard;
