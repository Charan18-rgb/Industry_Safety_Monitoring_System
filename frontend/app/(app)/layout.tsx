'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { AlertBanner } from '@/components/alerts/AlertBanner';
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';
import { ToastContainer } from '@/components/ui/ToastContainer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#020408]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <AlertBanner />
        <main className="flex-1 overflow-y-auto bg-[#020408]">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(0,102,255,0.03)_0%,transparent_60%)]" />
          <div className="relative">
            <WebSocketProvider>
              {children}
            </WebSocketProvider>
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
