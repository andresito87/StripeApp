import PieChart from "./PieChart";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { Transaction } from "@/types/transaction";

const ChartsDashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactionsByType();
  }, []);

  const fetchTransactionsByType = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/wallet/transactions-types`);

      if (response.data.summary && Array.isArray(response.data.summary)) {
        setTransactions(response.data.summary);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error al obtener transacciones:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "1fr" }}>
      {loading ? (
        <p style={{ textAlign: "center", paddingTop: "200px" }}>
          Cargando gráficos...
        </p>
      ) : (
        <PieChart data={transactions} />
      )}
    </div>
  );
};

export default ChartsDashboard;
