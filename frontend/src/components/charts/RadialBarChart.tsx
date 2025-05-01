import { ResponsiveRadialBar } from "@nivo/radial-bar";
import styled from "styled-components";

const ChartContainer = styled.div`
  height: 500px;
  width: 600px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1rem;
`;

const RadialBarChart = ({ data }) => {
  return (
    <ChartContainer>
      <Title>Total de ventas por estaciones</Title>
      <ResponsiveRadialBar
        data={data}
        valueFormat=">-.2f"
        padding={0.4}
        cornerRadius={2}
        margin={{ top: 40, right: 120, bottom: 40, left: 40 }}
        radialAxisStart={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
        circularAxisOuter={{ tickSize: 5, tickPadding: 12, tickRotation: 0 }}
        colors={["#5B8DEF", "#4ECDC4", "#556270", "#C7F467"]}
        legends={[
          {
            anchor: "right",
            direction: "column",
            justify: false,
            translateX: 80,
            translateY: 0,
            itemsSpacing: 6,
            itemDirection: "left-to-right",
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: "#111827", // negro oscuro
            symbolSize: 18,
            symbolShape: "square",
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "#000",
                },
              },
            ],
          },
        ]}
      />
    </ChartContainer>
  );
};

export default RadialBarChart;
