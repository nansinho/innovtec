'use client';

import { useEffect, useState } from 'react';

interface DonutChartProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function DonutChart({
  value,
  max,
  size = 80,
  strokeWidth = 8,
  color = '#0052CC',
  trackColor = '#F0F2F5',
  label,
  showPercentage = true,
  className = '',
}: DonutChartProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-sm font-bold text-text-primary leading-none">
            {Math.round(percentage)}%
          </span>
        )}
        {label && (
          <span className="text-[9px] text-text-muted leading-none mt-0.5">{label}</span>
        )}
      </div>
    </div>
  );
}
