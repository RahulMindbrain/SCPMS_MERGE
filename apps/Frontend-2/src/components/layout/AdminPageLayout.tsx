import React from "react";

interface AdminPageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminPageLayout({ children, className = "" }: AdminPageLayoutProps) {
  return (
    <div className={`flex-1 flex flex-col bg-background min-h-0 ${className}`}>
      <div className="w-full space-y-8 animate-in fade-in duration-700">
        {children}
      </div>
    </div>
  );
}
