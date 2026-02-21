'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Radio } from 'lucide-react';
import { realTimeSaleData } from './mock-data';

export function RealTimeSaleChart() {
  const totalSales = realTimeSaleData.reduce((sum, d) => sum + d.sales, 0);

  return (
    <div className="card-elevated p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-600/10 text-purple-600">
            <Radio size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary tracking-tight">Real-Time Sale</h2>
            <span className="text-xs text-text-muted">${totalSales.toLocaleString()} today</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] text-text-muted font-medium">Live</span>
        </div>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={realTimeSaleData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0052CC" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#4C9AFF" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EBECF0" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#97A0AF', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#97A0AF', fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ payload, label }) => {
                if (!payload || payload.length === 0) return null;
                return (
                  <div className="rounded-xl bg-white/95 backdrop-blur-sm border border-border-light/60 px-4 py-3 shadow-xl">
                    <p className="text-xs font-bold text-text-primary mb-1">{label}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-text-muted">Sales:</span>
                      <span className="font-bold text-text-primary">${Number(payload[0].value).toLocaleString()}</span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="sales" fill="url(#gradBar)" radius={[4, 4, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
