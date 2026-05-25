import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

type ChartPoint = {
  label: string;
  value: number;
};

type LineChartProps = {
  title: string;
  unit: string;
  data: ChartPoint[];
};

export default function LineChart({
  title,
  unit,
  data,
}: LineChartProps) {
  if (!data.length) {
    return <p style={{ marginTop: "12px" }}>No data available.</p>;
  }

  const chartData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        label: title,
        data: data.map((item) => item.value),
        tension: 0.3,
        fill: false,
        borderColor: "#753443",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${Number(context.raw).toFixed(1)} ${unit}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "220px", marginTop: "18px" }}>
      <Line data={chartData} options={options} />
    </div>
  );
}