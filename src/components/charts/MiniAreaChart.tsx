'use client';

import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

interface MiniAreaChartProps {
  data: { value: number }[];
  color?: string;
  height?: number;
  gradientId?: string;
  className?: string;
}

export function MiniAreaChart({
  data,
  color = '#0052CC',
  height = 40,
  gradientId = 'miniAreaGradient',
  className = '',
}: MiniAreaChartProps) {
  if (!data || data.length === 0) return null;

  const uniqueGradientId = `${gradientId}-${color.replace('#', '')}`;

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={uniqueGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Tooltip
            content={({ payload }) => {
              if (!payload || payload.length === 0) return null;
              return (
                <div className="rounded-lg bg-white/90 backdrop-blur-sm border border-border-light/60 px-2.5 py-1.5 shadow-lg text-xs font-semibold text-text-primary">
                  {payload[0]?.value}
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${uniqueGradientId})`}
            dot={false}
            activeDot={{ r: 3, fill: color, stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
