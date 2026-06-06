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
  onPrevious:()=>void;
  onNext:()=>void;
  disablePrevious:boolean;
  disableNext:boolean;  
};

export default function LineChart({
  title,
  unit,
  data,
  onPrevious,
  onNext,
  disablePrevious,
  disableNext
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
        display: false,
        
       
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${Number(context.raw).toFixed(1)} ${unit}`;
          }
        }
      },
      
    },
    layout:{
      padding: {top:20}
    },
    scales: {
      
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="line--chart">
      <div className="line--chart__header">
        <button className="line--chart__button" onClick={onPrevious} disabled={disablePrevious}>
          <svg width="18" height="18" viewBox="0 0 16 16">
            <path d="M11 2 L5 8 L11 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <h3 className="line--chart__title">{title}</h3>

        <button className="line--chart__button" onClick={onNext} disabled={disableNext}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16">
            <path d="M5 2 L11 8 L5 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="line--chart__canvas">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}