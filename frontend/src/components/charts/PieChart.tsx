import { ResponsivePie } from "@nivo/pie";
import styled from "styled-components";

const ChartContainer = styled.div`
  height: 500px;
  max-width: 700px;
  margin: 0 auto;
`;

const Message = styled.p`
  padding-top: 200px;
  text-align: center;
  color: #6b7280;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1rem;
`;

const LegendContainer = styled.div`
  text-align: center;
`;

const LegendItem = styled.div`
  display: inline-block;
  margin: 0 10px;
`;

const LegendColor = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  background-color: ${(props) => props.color};
  border-radius: 50%;
  margin-right: 5px;
`;

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
    <ChartContainer>
      {!hasData ? (
        <Message>No hay datos disponibles para mostrar.</Message>
      ) : (
        <>
          <Title>Total de transacciones</Title>
          <ResponsivePie
            data={coloredData}
            margin={{ top: 20, right: 110, bottom: 20, left: 110 }}
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
          <LegendContainer>
            {Object.entries(colorMapping).map(([key, color]) => (
              <LegendItem key={key}>
                <LegendColor color={color}></LegendColor>
                {key}
              </LegendItem>
            ))}
          </LegendContainer>
        </>
      )}
    </ChartContainer>
  );
};

export default PieChart;
