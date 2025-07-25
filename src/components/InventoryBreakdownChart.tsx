import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Box } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

const InventoryBreakdownChart = ({
  inward,
  outward,
  physical,
  damaged,
}: {
  inward: number;
  outward: number;
  physical: number;
  damaged: number;
}) => {
  const data = {
    labels: ['Outward', 'Physical', 'Damaged'],
    datasets: [
      {
        label: 'Breakdown',
        data: [outward, physical, damaged],
        backgroundColor: ['#fb8c00', '#42a5f5', '#e53935'],
        borderWidth: 1,
      },
    ],
  };

  const total = outward + physical + damaged;

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const percent = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percent}%)`;
          },
        },
      },
      legend: {
        position: 'bottom' as const,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Box sx={{ width: 300, height: 300, mx: 'auto' }}>
      <Pie data={data} options={options} />
    </Box>
  );
};

export default InventoryBreakdownChart;
