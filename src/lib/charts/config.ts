import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

// CareClock Chart Theme
export const chartTheme = {
  colors: {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#13c2c2',
    purple: '#722ed1',
    orange: '#fa8c16',
    grey: '#8c8c8c',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
    success: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
    warning: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
  },
};

// Default chart options
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#1890ff',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      padding: 12,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
        color: '#8c8c8c',
      },
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false,
      },
      ticks: {
        font: {
          size: 11,
        },
        color: '#8c8c8c',
        beginAtZero: true,
      },
    },
  },
  elements: {
    point: {
      radius: 4,
      hoverRadius: 6,
    },
    line: {
      tension: 0.4,
    },
  },
};

// Chart color utilities
export function getChartColors(count: number): string[] {
  const colors = Object.values(chartTheme.colors);
  const result = [];
  
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  
  return result;
}

export function createGradient(
  ctx: CanvasRenderingContext2D,
  color: string,
  alpha: number = 0.2
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
  gradient.addColorStop(1, color + '00');
  return gradient;
}
