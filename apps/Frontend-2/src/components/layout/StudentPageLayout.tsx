import React from "react";
import { cn } from "@/lib/utils";

interface StudentPageLayoutProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function StudentPageLayout({ 
  children, 
  className = "", 
  containerClassName = "" 
}: StudentPageLayoutProps) {
  return (
    <div className={cn("flex-1 flex flex-col bg-background min-h-0", className)}>
      <div className={cn(
        "w-full space-y-6 animate-in fade-in duration-700",
        containerClassName
      )}>
        {children}
      </div>
    </div>
  );
}

export default StudentPageLayout;
