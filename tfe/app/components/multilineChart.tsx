import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type MultiLinePoint = {
  label: string;
  flowers: number;
  green: number;
  yellow: number;
  red: number;
};

type Props = {
  title: string;
  data: MultiLinePoint[];
};

export default function MultiLineChart({
  title,
  data,
}: Props) {

  const chartData = {
    labels: data.map((item) => item.label),

    datasets: [
      {
        label: "Flowers",
        data: data.map((item) => item.flowers),
        borderColor: "#d6d6d6",
        backgroundColor: "#d6d6d6",
        tension: 0.3,
      },
      {
        label: "Green fruits",
        data: data.map((item) => item.green),
        borderColor: "#4caf50",
        backgroundColor: "#4caf50",
        tension: 0.3,
      },
      {
        label: "Yellow fruits",
        data: data.map((item) => item.yellow),
        borderColor: "#fbd704",
        backgroundColor: "#fbd704",
        tension: 0.3,
      },
      {
        label: "Red fruits",
        data: data.map((item) => item.red),
        borderColor: "#d44",
        backgroundColor: "#d44",
        tension: 0.3,
      },
    ],
  };

  return (
    <>
      <h1>{title}</h1>

      <div style={{ height: "300px" }}>
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
    </>
  );
}