
import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Metric } from '../types';

interface MetricCardProps {
  metric: Metric;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const getChangeIcon = () => {
    if (metric.changeType === 'increase') return <ArrowUp size={14} className="text-green-400" />;
    if (metric.changeType === 'decrease') return <ArrowDown size={14} className="text-red-400" />;
    return <Minus size={14} className="text-gray-500" />;
  };

  const getChangeColor = () => {
    if (metric.changeType === 'increase') return 'text-green-400';
    if (metric.changeType === 'decrease') return 'text-red-400';
    return 'text-gray-500';
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 transition-all hover:border-brand-primary hover:shadow-lg">
      <p className="text-sm font-medium text-gray-400">{metric.title}</p>
      <div className="mt-2 flex items-baseline">
        <p className="text-3xl font-bold text-white">{metric.value}</p>
        {metric.unit && <span className="ml-1 text-xl font-medium text-gray-400">{metric.unit}</span>}
      </div>
      <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
      {metric.change && (
        <div className="mt-3 flex items-center text-xs">
          {getChangeIcon()}
          <span className={`ml-1 font-semibold ${getChangeColor()}`}>{metric.change}</span>
          <span className="ml-1 text-gray-500">vs last week</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
