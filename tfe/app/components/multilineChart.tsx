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
  onPrevious: () => void;
  onNext: () => void;
  disablePrevious: boolean;
  disableNext: boolean;
};

export default function MultiLineChart({
  title,
  data,
  onPrevious,
  onNext,
  disablePrevious,
  disableNext,
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
    <div className="multiline--chart">
      <div className="line--chart__header">
        <button className="line--chart__button" onClick={onPrevious} disabled={disablePrevious}>
          <svg width="18" height="18" viewBox="0 0 16 16">
            <path d="M11 2 L5 8 L11 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <h3 className="line--chart__title">{title}</h3>

        <button className="line--chart__button" onClick={onNext} disabled={disableNext}>
          <svg width="18" height="18" viewBox="0 0 16 16">
            <path d="M5 2 L11 8 L5 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="multiline--chart__canvas">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            elements: {
              point: {
                radius: 0,
                hoverRadius: 4,
              }
            },
          
          }}
        />
      </div>
    </div>
  );
}