import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/site-header';
import { TooltipProvider } from '@/components/ui/tooltip';

import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/reducers/rootReducer';
import WarningBanner from '@/components/WarningBanner';

const AdminLayout: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isApproved = user?.status === 'ACTIVE';

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "15.5rem",
            "--header-height": "3.5rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="sidebar" />
        <SidebarInset className="bg-background overflow-y-auto overflow-x-hidden">
          <SiteHeader />
          <main className="relative flex flex-1 flex-col bg-background min-h-0 @container/main">
            <div className="flex-1 p-4 md:p-5 lg:p-6 w-full mx-auto max-w-[1440px]">
              <WarningBanner 
                isVisible={!isApproved}
                role="ADMIN"
                message="Your admin account is currently inactive or not authorized to access this panel."
              />
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default AdminLayout;
