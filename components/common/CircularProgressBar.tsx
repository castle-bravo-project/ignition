import React from 'react';

interface CircularProgressBarProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({ score, size = 80, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getTrackColor = () => {
    if (score >= 80) return 'stroke-green-500';
    if (score >= 50) return 'stroke-yellow-400';
    return 'stroke-red-500';
  };

  const getTextcolor = () => {
    if (score >= 80) return 'fill-green-400';
    if (score >= 50) return 'fill-yellow-300';
    return 'fill-red-400';
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle
          className="stroke-current text-gray-700"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          className={`stroke-current transition-all duration-500 ease-in-out ${getTrackColor()}`}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xl font-bold ${getTextcolor()}`}>{score}</span>
      </div>
    </div>
  );
};

export default CircularProgressBar;
