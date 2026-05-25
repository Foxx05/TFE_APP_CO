import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

type ProductionPoint = {
  label: string;
  value: number;
};

type ProductionChartProps = {
  data: ProductionPoint[];
};

function formatMonthLabel(monthKey: string) {
  const map: Record<string, string> = {
    "04": "Apr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Aug",
    "09": "Sep",
  };

  const parts = monthKey.split("-");
  if (parts.length !== 2) return monthKey;

  return map[parts[1]] || monthKey;
}

export default function ProductionChart({ data }: ProductionChartProps) {
  const chartData = {
    labels: data.map((item) => formatMonthLabel(item.label)),
    datasets: [
      {
        label: "Harvested strawberries",
        data: data.map((item) => item.value),
        backgroundColor: "#753443",
        borderRadius: 6,
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
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "260px" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}