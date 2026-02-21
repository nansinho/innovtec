import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { QuickAccess } from '@/components/dashboard/QuickAccess';
import { KPICards } from '@/components/dashboard/KPICards';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { NewsSection } from '@/components/dashboard/NewsSection';
import { PlanningWeek } from '@/components/dashboard/PlanningWeek';
import { TeamPreview } from '@/components/dashboard/TeamPreview';
import { DocumentsToSign } from '@/components/dashboard/DocumentsToSign';
import { FormationsProgress } from '@/components/dashboard/FormationsProgress';
import { SSEMetrics } from '@/components/dashboard/SSEMetrics';
import { RecentActionPlans } from '@/components/dashboard/RecentActionPlans';

export default function DashboardPage() {
  return (
    <div>
      {/* Hero Banner - full bleed */}
      <WelcomeBanner />

      {/* KPI Cards overlapping the banner */}
      <div className="-mt-20 relative z-10 mb-8">
        <KPICards />
      </div>

      <div className="space-y-8">
        {/* Section 1: Activity Chart + Quick Access — asymmetric 3+2 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <ActivityChart />
          </div>
          <div className="lg:col-span-2">
            <QuickAccess />
          </div>
        </div>

        {/* Section 2: News — hero + side articles */}
        <NewsSection />

        {/* Section 3: Metrics row — asymmetric 2+1+2 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <SSEMetrics />
          </div>
          <div className="lg:col-span-1">
            <FormationsProgress />
          </div>
          <div className="lg:col-span-2">
            <DocumentsToSign />
          </div>
        </div>

        {/* Section 4: Planning — full width */}
        <PlanningWeek />

        {/* Section 5: Team + Action Plans — asymmetric 2+3 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <TeamPreview />
          </div>
          <div className="lg:col-span-3">
            <RecentActionPlans />
          </div>
        </div>
      </div>
    </div>
  );
}
