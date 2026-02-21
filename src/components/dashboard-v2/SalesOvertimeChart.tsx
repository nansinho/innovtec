'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { salesOvertimeData } from './mock-data';

type Period = 'weekly' | 'monthly' | 'yearly';

export function SalesOvertimeChart() {
  const [period, setPeriod] = useState<Period>('monthly');

  const data = salesOvertimeData[period];
  const totalSales = data.reduce((sum, d) => sum + d.sales, 0);

  return (
    <div className="card-elevated p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-blue-600/10 text-primary">
            <BarChart3 size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary tracking-tight">Sales Overtime</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <TrendingUp size={12} className="text-success" />
              <span className="text-xs text-text-muted">${totalSales.toLocaleString()} total</span>
            </div>
          </div>
        </div>

        <Tabs.Root value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <Tabs.List className="flex rounded-xl bg-background/80 p-1 border border-border-light/40">
            <Tabs.Trigger value="weekly" className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-text-muted">
              Weekly
            </Tabs.Trigger>
            <Tabs.Trigger value="monthly" className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-text-muted">
              Monthly
            </Tabs.Trigger>
            <Tabs.Trigger value="yearly" className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-text-muted">
              Yearly
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-[11px] text-text-muted font-medium">Sales</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-success" />
          <span className="text-[11px] text-text-muted font-medium">Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-accent" />
          <span className="text-[11px] text-text-muted font-medium">Profit</span>
        </div>
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0052CC" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#0052CC" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#36B37E" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#36B37E" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4A017" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#D4A017" stopOpacity={0.02} />
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
                    <p className="text-xs font-bold text-text-primary mb-2">{label}</p>
                    {payload.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-text-muted">{entry.name}:</span>
                        <span className="font-bold text-text-primary">${Number(entry.value).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Area type="monotone" dataKey="sales" name="Sales" stroke="#0052CC" strokeWidth={2} fill="url(#gradSales)" dot={false} activeDot={{ r: 4, fill: '#0052CC', stroke: '#fff', strokeWidth: 2 }} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#36B37E" strokeWidth={2} fill="url(#gradRevenue)" dot={false} activeDot={{ r: 4, fill: '#36B37E', stroke: '#fff', strokeWidth: 2 }} />
            <Area type="monotone" dataKey="profit" name="Profit" stroke="#D4A017" strokeWidth={2} fill="url(#gradProfit)" dot={false} activeDot={{ r: 4, fill: '#D4A017', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
