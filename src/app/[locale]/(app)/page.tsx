import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { QuickAccess } from '@/components/dashboard/QuickAccess';
import { KPICards } from '@/components/dashboard/KPICards';
import { NewsSection } from '@/components/dashboard/NewsSection';
import { PlanningWeek } from '@/components/dashboard/PlanningWeek';
import { TeamPreview } from '@/components/dashboard/TeamPreview';
import { DocumentsToSign } from '@/components/dashboard/DocumentsToSign';
import { FormationsProgress } from '@/components/dashboard/FormationsProgress';
import { SSEMetrics } from '@/components/dashboard/SSEMetrics';
import { RecentActionPlans } from '@/components/dashboard/RecentActionPlans';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <WelcomeBanner />
      <QuickAccess />
      <KPICards />
      <NewsSection />
      <PlanningWeek />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamPreview />
        <DocumentsToSign />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormationsProgress />
        <SSEMetrics />
      </div>

      <RecentActionPlans />
    </div>
  );
}
