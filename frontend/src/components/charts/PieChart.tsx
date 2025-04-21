import { ResponsivePie } from "@nivo/pie";

const PieChart = ({ data }) => {
  const hasData = data && data.length > 0;

  return (
    <div
      style={{
        height: "500px",
        width: "200%",
        maxWidth: "700px",
        margin: "0 auto",
      }}
    >
      {!hasData ? (
        <p
          style={{ paddingTop: "200px", textAlign: "center", color: "#6b7280" }}
        >
          No hay datos disponibles para mostrar.
        </p>
      ) : (
        <>
          <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
            Tipos de Transacciones
          </h2>
          <ResponsivePie
            data={data}
            margin={{ top: 40, right: 20, bottom: 40, left: 20 }}
            innerRadius={0.5}
            padAngle={0.5}
            cornerRadius={2}
            activeOuterRadiusOffset={10}
            colors={{ scheme: "category10" }}
            borderWidth={2}
            borderColor={{ from: "color", modifiers: [["darker", 0.6]] }}
            arcLinkLabelsSkipAngle={5}
            arcLinkLabelsTextColor="#333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={5}
            arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
          />
        </>
      )}
    </div>
  );
};

export default PieChart;
