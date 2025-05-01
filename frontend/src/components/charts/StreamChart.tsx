import { ResponsiveStream } from "@nivo/stream";
import styled from "styled-components";

const ChartContainer = styled.div`
  height: 500px;
  width: 600px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1rem;
`;

const StreamChart = ({ data }) => {
  return (
    <ChartContainer>
      <Title>Productos más vendidos</Title>
      <ResponsiveStream
        data={data}
        keys={["Producto 4", "Producto 3", "Producto 2", "Producto 1"]}
        margin={{ top: 50, right: 100, bottom: 50, left: 60 }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "",
          legendOffset: 36,
          truncateTickAt: 0,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "",
          legendOffset: -40,
          truncateTickAt: 0,
        }}
        enableGridX={true}
        enableGridY={false}
        offsetType="silhouette"
        colors={["#5B8DEF", "#4ECDC4", "#556270", "#C7F467"]}
        fillOpacity={0.85}
        borderColor={{ theme: "background" }}
        fill={[
          {
            match: {
              id: "Producto 1",
            },
            id: "dots",
          },
          {
            match: {
              id: "Producto 2",
            },
            id: "squares",
          },
        ]}
        dotSize={8}
        dotColor={{ from: "color" }}
        dotBorderWidth={2}
        dotBorderColor={{
          from: "color",
          modifiers: [["darker", 0.7]],
        }}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            translateX: 100,
            itemWidth: 80,
            itemHeight: 20,
            itemTextColor: "#111827",
            symbolSize: 12,
            symbolShape: "circle",
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "#000000",
                },
              },
            ],
          },
        ]}
      />
    </ChartContainer>
  );
};

export default StreamChart;
