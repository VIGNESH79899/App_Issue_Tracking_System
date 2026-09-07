import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { HeaderNav } from './HeaderNav';
import { ToastNotificationContainer } from '../common/ToastNotification';

export const AppLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarNav />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-50">
            <SidebarNav onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <HeaderNav onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Toast Alerts */}
      <ToastNotificationContainer />
    </div>
  );
};
