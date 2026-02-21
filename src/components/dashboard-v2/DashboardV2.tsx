'use client';

import { WelcomeHeaderV2 } from './WelcomeHeaderV2';
import { StatCardsV2 } from './StatCardsV2';
import { SalesOvertimeChart } from './SalesOvertimeChart';
import { RealTimeSaleChart } from './RealTimeSaleChart';

export function DashboardV2() {
  return (
    <div className="space-y-6">
      <WelcomeHeaderV2 />
      <StatCardsV2 />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <SalesOvertimeChart />
        </div>
        <div className="lg:col-span-2">
          <RealTimeSaleChart />
        </div>
      </div>
    </div>
  );
}
