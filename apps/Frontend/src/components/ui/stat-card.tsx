import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon?: LucideIcon;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  className,
}) => {
  return (
    <div className={cn(
      "bg-[#1e1f26] p-8 rounded-[2.5rem] border border-[rgba(255,255,255,0.07)] shadow-none group hover:border-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        {Icon && (
          <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-7 h-7" />
          </div>
        )}
        {subtext && (
          <div className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-400/20">
            {subtext}
          </div>
        )}
      </div>
      <div>
        <div className="text-4xl font-black text-[#e2e2eb] mb-1 tracking-tight">
          {value}
        </div>
        <div className="text-[#908fa0] text-xs font-bold uppercase tracking-[0.1em]">
          {label}
        </div>
      </div>
    </div>
  );
};
