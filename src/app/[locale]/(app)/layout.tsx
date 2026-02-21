import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { SearchModal } from '@/components/layout/SearchModal';
import { NotificationPanel } from '@/components/layout/NotificationPanel';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ToastProvider } from '@/components/ui/Toast';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-content px-6 py-6 md:px-8">
              <div className="mb-4 hidden sm:block">
                <Breadcrumb />
              </div>
              {children}
            </div>
          </main>
        </div>
        <SearchModal />
        <NotificationPanel />
      </div>
    </ToastProvider>
  );
}
