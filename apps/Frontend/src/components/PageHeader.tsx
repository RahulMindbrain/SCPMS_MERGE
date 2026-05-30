import React from "react";
import { Sparkles, type LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  icon?: LucideIcon;
  variant?: "indigo" | "sky" | "emerald" | "amber" | "rose" | "cyan" | "blue";
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  badge,
  icon: Icon,
  variant = "indigo",
  children,
}: PageHeaderProps) {
  const variantMap = {
    indigo: {
      bubblePrimary: "bg-indigo-500",
      bubbleSecondary: "bg-sky-400",
      badgeIcon: "text-indigo-400",
      titleSpan: "text-indigo-600",
    },
    sky: {
      bubblePrimary: "bg-sky-500",
      bubbleSecondary: "bg-blue-400",
      badgeIcon: "text-sky-400",
      titleSpan: "text-sky-600",
    },
    emerald: {
      bubblePrimary: "bg-emerald-500",
      bubbleSecondary: "bg-teal-400",
      badgeIcon: "text-emerald-400",
      titleSpan: "text-emerald-600",
    },
    amber: {
      bubblePrimary: "bg-amber-500",
      bubbleSecondary: "bg-orange-400",
      badgeIcon: "text-amber-400",
      titleSpan: "text-amber-600",
    },
    rose: {
      bubblePrimary: "bg-rose-500",
      bubbleSecondary: "bg-pink-400",
      badgeIcon: "text-rose-400",
      titleSpan: "text-rose-600",
    },
    cyan: {
      bubblePrimary: "bg-cyan-500",
      bubbleSecondary: "bg-sky-400",
      badgeIcon: "text-cyan-400",
      titleSpan: "text-cyan-600",
    },
    blue: {
      bubblePrimary: "bg-blue-500",
      bubbleSecondary: "bg-indigo-400",
      badgeIcon: "text-blue-400",
      titleSpan: "text-blue-600",
    },
  };

  const colors = variantMap[variant];

  return (
    <section className="hero-banner relative overflow-hidden mb-8">
      <div className="hero-mesh">
        <div className={`absolute top-[-40%] left-[-20%] w-full h-full rounded-full blur-[150px] opacity-20 ${colors.bubblePrimary}`}></div>
        <div className={`absolute bottom-[-40%] right-[-20%] w-full h-full rounded-full blur-[150px] opacity-15 ${colors.bubbleSecondary}`}></div>
      </div>
      <div className="hero-texture"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-4">
          {badge && (
            <div className="hero-badge">
              <Sparkles className={`h-3.5 w-3.5 ${colors.badgeIcon}`} />
              <span>{badge}</span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            {Icon && <Icon className={`h-8 w-8 ${colors.titleSpan} shrink-0`} />}
            <span className="truncate">{title}</span>
          </h1>
          {description && (
            <p className="max-w-2xl text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {children && <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">{children}</div>}
      </div>
    </section>
  );
}
