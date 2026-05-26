import { SidebarTrigger } from "@/components/ui/sidebar"
import { useLocation } from "react-router-dom"
import { NotificationBell } from "@/components/notification-bell"
import { ModeToggle } from "@/components/mode-toggle"

const routeTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/students": "Students",
  "/admin/departments": "Departments",
  "/admin/companies": "Companies",
  "/admin/drives": "Placement Drives",
  "/admin/jobs": "Manage Jobs",
  "/admin/applications": "Applications",
  "/admin/shortlisting": "Shortlisting",
  "/admin/event-management": "Interview Scheduler",
  "/admin/skills": "Skills",
  "/admin/bulk-email": "Bulk Email",
  "/admin/notification": "Notifications",
  "/student/dashboard": "Dashboard",
  "/student/profile": "My Profile",
  "/student/eligibility": "Eligibility",
  "/student/jobs": "Job Listings",
  "/student/application": "My Applications",
  "/student/notifications": "Notifications",
  "/company/dashboard": "Dashboard",
  "/company/profile": "Company Profile",
  "/company/post-job": "Post a Job",
  "/company/jobs": "Manage Jobs",
  "/company/applicants": "Applicants",
  "/company/shortlist": "Shortlist",
  "/company/interviews": "Interview Rounds",
  "/company/university-list": "Universities",
  "/company/send-job-to-university": "Send Job to University",
  "/company/notifications": "Notifications",
  "/superadmin/dashboard": "Dashboard",
  "/superadmin/universities": "Universities",
  "/superadmin/admins": "Admins",
  "/superadmin/companies": "Companies",
}

// Site Header component for the Indigo SuperAdmin theme
export function SiteHeader() {
  const location = useLocation()

  const getTitle = () => {
    // First check for exact matches
    if (routeTitles[location.pathname]) return routeTitles[location.pathname];

    // Check for dynamic routes (e.g., /admin/applications/7)
    // We look for the longest matching prefix in routeTitles
    const matchedRoute = Object.keys(routeTitles)
      .filter(route => location.pathname.startsWith(route))
      .sort((a, b) => b.length - a.length)[0];

    if (matchedRoute) return routeTitles[matchedRoute];

    const path = location.pathname.split("/").filter(Boolean).pop();
    if (!path) return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/80 shadow-sm backdrop-blur-2xl transition-all duration-300">
      <div className="flex w-full items-center gap-4 px-4 sm:px-6">
        {/* Sidebar toggle (ChatGPT style - always visible in page header) */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-9 w-9 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200 shrink-0" />
          <div className="mx-1.5 hidden h-5 w-[1px] bg-slate-200 dark:bg-slate-800/80 sm:block" />
        </div>

        {/* Page title area */}
        <div className="flex animate-in flex-col duration-500 fade-in slide-in-from-left-4">
          <h1 className="text-[16px] sm:text-[18px] leading-tight font-bold tracking-tight text-foreground truncate max-w-[150px] sm:max-w-[300px] md:max-w-none">
            {getTitle()}
          </h1>
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center rounded-full border border-border bg-muted/50 p-1 transition-colors hover:bg-muted dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10">
            <ModeToggle />
          </div>
          <div className="mx-1 hidden h-8 w-[1px] bg-border sm:block" />
          <NotificationBell />
        </div>
      </div>
    </header>
  )
}
