/**
 * Animated Chart Component - UX Innovation
 * 
 * Advanced chart component with smooth animations, interactive tooltips,
 * and real-time data updates using Chart.js and Framer Motion.
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity,
  Maximize2,
  Download,
  RefreshCw
} from 'lucide-react';

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
  ArcElement,
  Filler
);

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface AnimatedChartProps {
  type: 'line' | 'bar' | 'doughnut';
  title: string;
  data: ChartDataPoint[];
  timeSeriesData?: Array<{
    timestamp: string;
    values: { [key: string]: number };
  }>;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  animated?: boolean;
  realTime?: boolean;
  onDataPointClick?: (dataPoint: ChartDataPoint, index: number) => void;
  className?: string;
}

const AnimatedChart: React.FC<AnimatedChartProps> = ({
  type,
  title,
  data,
  timeSeriesData,
  height = 300,
  showLegend = true,
  showGrid = true,
  animated = true,
  realTime = false,
  onDataPointClick,
  className = ''
}) => {
  const chartRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Brand colors for consistency
  const brandColors = [
    '#f59e0b', // brand-primary
    '#fbbf24', // brand-secondary
    '#10b981', // emerald-500
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#f97316', // orange-500
    '#ef4444', // red-500
    '#06b6d4', // cyan-500
  ];

  // Generate chart data based on type
  const generateChartData = () => {
    const colors = data.map((_, index) => brandColors[index % brandColors.length]);
    
    if (type === 'line' && timeSeriesData) {
      const datasets = Object.keys(timeSeriesData[0]?.values || {}).map((key, index) => ({
        label: key,
        data: timeSeriesData.map(point => point.values[key]),
        borderColor: brandColors[index % brandColors.length],
        backgroundColor: `${brandColors[index % brandColors.length]}20`,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: brandColors[index % brandColors.length],
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      }));

      return {
        labels: timeSeriesData.map(point => point.timestamp),
        datasets
      };
    }

    return {
      labels: data.map(item => item.label),
      datasets: [{
        label: title,
        data: data.map(item => item.value),
        backgroundColor: type === 'doughnut' 
          ? colors.map(color => `${color}80`)
          : colors.map(color => `${color}40`),
        borderColor: colors,
        borderWidth: 2,
        ...(type === 'line' && {
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: colors[0],
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        })
      }]
    };
  };

  // Chart options with animations
  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: 'top' as const,
          labels: {
            color: '#d1d5db',
            font: {
              size: 12
            },
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: '#1f2937',
          titleColor: '#ffffff',
          bodyColor: '#d1d5db',
          borderColor: '#374151',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: (context: any) => {
              const dataPoint = data[context.dataIndex];
              let label = `${context.dataset.label}: ${context.parsed.y || context.parsed}`;
              if (dataPoint?.trend) {
                const trendIcon = dataPoint.trend === 'up' ? '↗' : dataPoint.trend === 'down' ? '↘' : '→';
                label += ` ${trendIcon}`;
              }
              return label;
            }
          }
        }
      },
      onClick: (event: any, elements: any[]) => {
        if (elements.length > 0 && onDataPointClick) {
          const index = elements[0].index;
          onDataPointClick(data[index], index);
        }
      },
      animation: animated ? {
        duration: 1000,
        easing: 'easeOutQuart' as const,
        delay: (context: any) => context.dataIndex * 100
      } : false,
      interaction: {
        intersect: false,
        mode: 'index' as const
      }
    };

    if (type === 'doughnut') {
      return {
        ...baseOptions,
        cutout: '60%',
        plugins: {
          ...baseOptions.plugins,
          legend: {
            ...baseOptions.plugins.legend,
            position: 'right' as const
          }
        }
      };
    }

    return {
      ...baseOptions,
      scales: {
        x: {
          display: showGrid,
          grid: {
            color: '#374151',
            drawBorder: false
          },
          ticks: {
            color: '#9ca3af',
            font: {
              size: 11
            }
          }
        },
        y: {
          display: showGrid,
          grid: {
            color: '#374151',
            drawBorder: false
          },
          ticks: {
            color: '#9ca3af',
            font: {
              size: 11
            }
          }
        }
      }
    };
  };

  const getChartIcon = () => {
    switch (type) {
      case 'line':
        return <Activity size={16} className="text-brand-primary" />;
      case 'bar':
        return <BarChart3 size={16} className="text-brand-primary" />;
      case 'doughnut':
        return <PieChart size={16} className="text-brand-primary" />;
      default:
        return <TrendingUp size={16} className="text-brand-primary" />;
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const renderChart = () => {
    const chartData = generateChartData();
    const options = getChartOptions();

    switch (type) {
      case 'line':
        return <Line ref={chartRef} data={chartData} options={options} />;
      case 'bar':
        return <Bar ref={chartRef} data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut ref={chartRef} data={chartData} options={options} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      className={`bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10 transition-all duration-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {getChartIcon()}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {realTime && (
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
        
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0.6 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={handleRefresh}
            className="p-2 rounded hover:bg-gray-800 transition-colors"
            disabled={isLoading}
          >
            <motion.div
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
            >
              <RefreshCw size={16} className="text-gray-400" />
            </motion.div>
          </button>
          <button className="p-2 rounded hover:bg-gray-800 transition-colors">
            <Download size={16} className="text-gray-400" />
          </button>
          <button className="p-2 rounded hover:bg-gray-800 transition-colors">
            <Maximize2 size={16} className="text-gray-400" />
          </button>
        </motion.div>
      </div>

      {/* Chart Container */}
      <motion.div
        className="relative"
        style={{ height }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw size={24} className="text-brand-primary" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {renderChart()}
      </motion.div>

      {/* Data Summary */}
      {data.length > 0 && (
        <motion.div
          className="mt-4 pt-4 border-t border-gray-800"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Total Points:</span>
              <span className="ml-2 text-white font-medium">{data.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Max Value:</span>
              <span className="ml-2 text-white font-medium">{Math.max(...data.map(d => d.value))}</span>
            </div>
            <div>
              <span className="text-gray-400">Min Value:</span>
              <span className="ml-2 text-white font-medium">{Math.min(...data.map(d => d.value))}</span>
            </div>
            <div>
              <span className="text-gray-400">Average:</span>
              <span className="ml-2 text-white font-medium">
                {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnimatedChart;
