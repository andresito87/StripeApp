import { ResponsivePie } from "@nivo/pie";

const PieChart = ({ data }) => {
  const hasData = data && data.length > 0;

  const colorMapping = {
    Éxito: "#10B981",
    Fallido: "#EF4444",
    "En disputa": "#FBBF24",
    "Acción requerida": "#6366F1",
    Bloqueado: "#D1D5DB",
  };

  const coloredData = data.map((item) => ({
    ...item,
    color: colorMapping[item.id] || "#3B82F6",
  }));

  return (
    <div style={{ height: "500px", maxWidth: "700px", margin: "0 auto" }}>
      {!hasData ? (
        <p
          style={{ paddingTop: "200px", textAlign: "center", color: "#6b7280" }}
        >
          No hay datos disponibles para mostrar.
        </p>
      ) : (
        <>
          <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
            Total de transacciones
          </h2>
          <ResponsivePie
            data={coloredData}
            margin={{ top: 40, right: 20, bottom: 80, left: 20 }}
            innerRadius={0.5}
            padAngle={0.5}
            cornerRadius={2}
            activeOuterRadiusOffset={10}
            colors={(d: any) => d.data.color}
            borderWidth={2}
            borderColor={{ from: "color", modifiers: [["darker", 0.6]] }}
            arcLinkLabelsSkipAngle={5}
            arcLinkLabelsTextColor="#333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={5}
            arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
          />
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            {Object.entries(colorMapping).map(([key, color]) => (
              <div
                key={key}
                style={{ display: "inline-block", margin: "0 10px" }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "12px",
                    height: "12px",
                    backgroundColor: color,
                    borderRadius: "50%",
                    marginRight: "5px",
                  }}
                ></span>
                {key}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PieChart;
