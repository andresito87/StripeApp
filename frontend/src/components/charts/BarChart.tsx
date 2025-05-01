import { ResponsiveBar } from "@nivo/bar";
import styled from "styled-components";

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

const BarChart = ({ data }) => {
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
    <div
      style={{
        height: "500px",
        width: "100%",
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
            Total de transacciones por meses
          </h2>
          <LegendContainer>
            {Object.entries(colorMapping).map(([key, color]) => (
              <LegendItem key={key}>
                <LegendColor color={color}></LegendColor>
                {key}
              </LegendItem>
            ))}
          </LegendContainer>
          <ResponsiveBar
            data={data}
            keys={["exitosas", "disputadas"]}
            indexBy="mes"
            margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={({ id }) => (id === "exitosas" ? "#10B981" : "#FBBF24")}
            defs={[
              {
                id: "dots",
                type: "patternDots",
                background: "inherit",
                color: "#38bcb2",
                size: 4,
                padding: 1,
                stagger: true,
              },
              {
                id: "lines",
                type: "patternLines",
                background: "inherit",
                color: "#eed312",
                rotation: -45,
                lineWidth: 6,
                spacing: 10,
              },
            ]}
            fill={[
              {
                match: {
                  id: "fries",
                },
                id: "dots",
              },
              {
                match: {
                  id: "sandwich",
                },
                id: "lines",
              },
            ]}
            borderColor={{
              from: "color",
              modifiers: [["darker", 1.6]],
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 10,
              tickRotation: 45,
              legend: "Meses",
              legendPosition: "middle",
              legendOffset: 50,
              truncateTickAt: 0,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Transacciones",
              legendPosition: "middle",
              legendOffset: -40,
              truncateTickAt: 0,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{
              from: "color",
              modifiers: [["darker", 1.6]],
            }}
            legends={[
              {
                dataFrom: "keys",
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: "left-to-right",
                itemOpacity: 0.85,
                symbolSize: 20,
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
            role="application"
            ariaLabel="Gráfico de transacciones en un año"
            barAriaLabel={(e) =>
              e.id + ": " + e.formattedValue + " en meses: " + e.indexValue
            }
          />
        </>
      )}
    </div>
  );
};

export default BarChart;
