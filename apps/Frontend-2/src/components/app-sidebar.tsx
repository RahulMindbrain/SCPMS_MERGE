import * as React from "react"
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  ListChecks,
  Calendar,
  Mail,
  User,
  CheckCircle,
  FileSearch,
  Bell,
  PlusCircle,
  GraduationCap,
  Wrench,
  ShieldCheck,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,

} from "@/components/ui/sidebar"
import useAuth from "@/redux/hooks/useAuth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, userType, fullName, initials } = useAuth()
  const role = userType?.toLowerCase()

  const displayRole = React.useMemo(() => {
    if (!role) return "";
    if (role === "super_admin" || role === "superadmin") return "Super Admin";
    return role.charAt(0).toUpperCase() + role.slice(1);
  }, [role]);

  const navigation = React.useMemo(() => {
    if (role === "admin") {
      return {
        main: [
          {
            title: "Dashboard",
            url: "/admin/dashboard",
            icon: <LayoutDashboard />,
          },
          { title: "Students", url: "/admin/students", icon: <Users /> },
          // { title: "Companies", url: "/admin/companies", icon: <Building2 /> },
          { title: "Company Requests", url: "/admin/company-requests", icon: <Building2 /> },
          {
            title: "Placement Drives",
            url: "/admin/drives",
            icon: <Briefcase />,
          },
          { title: "Job Moderation", url: "/admin/jobs", icon: <ListChecks /> },
          // { title: "University Jobs", url: "/admin/university-jobs", icon: <Briefcase /> },
          {
            title: "Applications",
            url: "/admin/applications",
            icon: <FileText />,
          },
          {
            title: "Interview Scheduler",
            url: "/admin/event-management",
            icon: <Calendar />,
          },
          { title: "Skills", url: "/admin/skills", icon: <Wrench /> },
        ],
        secondary: [
          { title: "Bulk Email", url: "/admin/bulk-email", icon: <Mail /> },
          {
            title: "Notifications",
            url: "/admin/notification",
            icon: <Bell />,
          },
          {
            title: "Departments",
            url: "/admin/departments",
            icon: <Building2 />,
          },
        ],
      }
    } else if (role === "student") {
      return {
        main: [
          {
            title: "Dashboard",
            url: "/student/dashboard",
            icon: <LayoutDashboard />,
          },
          { title: "My Profile", url: "/student/profile", icon: <User /> },
          {
            title: "Eligibility",
            url: "/student/eligibility",
            icon: <CheckCircle />,
          },
          { title: "Job Listings", url: "/student/jobs", icon: <Briefcase /> },
          {
            title: "My Applications",
            url: "/student/application",
            icon: <FileSearch />,
          },
        ],
        secondary: [
          {
            title: "Notifications",
            url: "/student/notifications",
            icon: <Bell />,
          },
        ],
      }
    } else if (role === "company") {
      return {
        main: [
          {
            title: "Dashboard",
            url: "/company/dashboard",
            icon: <LayoutDashboard />,
          },
          { title: "Profile", url: "/company/profile", icon: <Building2 /> },
          { title: "Post Job", url: "/company/post-job", icon: <PlusCircle /> },
          { title: "Manage Jobs", url: "/company/jobs", icon: <Briefcase /> },
          { title: "Send Job Request", url: "/company/send-job-to-university", icon: <PlusCircle /> },
          { title: "Applicants", url: "/company/applicants", icon: <Users /> },
          {
            title: "Universities",
            url: "/company/university-list",
            icon: <GraduationCap />,
          },
        ],
        secondary: [
          {
            title: "Shortlist",
            url: "/company/shortlist",
            icon: <ListChecks />,
          },
          {
            title: "Interview Rounds",
            url: "/company/interviews",
            icon: <Calendar />,
          },
          {
            title: "Notifications",
            url: "/company/notifications",
            icon: <Bell />,
          },
        ],
      }
    } else if (role === "super_admin" || role === "superadmin") {
      return {
        main: [
          {
            title: "Dashboard",
            url: "/superadmin/dashboard",
            icon: <LayoutDashboard />,
          },
          { title: "Admins", url: "/superadmin/admins", icon: <ShieldCheck /> },
          {
            title: "Universities",
            url: "/superadmin/universities",
            icon: <Building2 />,
          },

          {
            title: "Companies",
            url: "/superadmin/companies",
            icon: <Briefcase />,
          },

        ],
        secondary: [

        ],
      }
    }
    return { main: [], secondary: [] }
  }, [role])

  const userData = {
    name: fullName,
    email: user?.email ?? "",
    avatar: initials,
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-100/80 dark:border-slate-900/80 bg-white/80 dark:bg-[#0c101d]/90 backdrop-blur-xl shadow-[1px_0_12px_rgba(0,0,0,0.015)] transition-all duration-300 ease-in-out"
      style={{
        "--sidebar": "transparent",
        ...props.style,
      } as React.CSSProperties}
      {...props}
    >
      <SidebarHeader className="flex h-20 shrink-0 items-center overflow-hidden border-b border-slate-100/80 dark:border-slate-900/80 px-4 pt-3 pb-1 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pt-2 transition-all duration-300">
        <div className="flex w-full items-center justify-start gap-3 group-data-[collapsible=icon]:justify-center transition-all duration-300 mt-2">
          <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 shadow-md shadow-indigo-500/25 dark:shadow-indigo-500/10">
            <GraduationCap className="size-5 text-white" />
          </div>
          <div className="flex flex-col leading-tight transition-all duration-300 ease-in-out group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 overflow-hidden whitespace-nowrap">
            <span className="text-[15px] font-bold tracking-tight text-slate-800 dark:text-slate-100">
              SCPMS
            </span>
            <span className="text-[9.5px] font-bold tracking-[0.12em] text-slate-400 dark:text-slate-500 uppercase">
              {displayRole} Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent className="no-scrollbar gap-0.5 px-2 pt-4 pb-2">
        <NavMain items={navigation.main} />
        <SidebarSeparator className="mx-3 my-1 bg-slate-100 dark:bg-slate-900/60 opacity-80" />
        <NavSecondary items={navigation.secondary} />
      </SidebarContent>

      {/* ── Footer / User ── */}
      <SidebarFooter className="border-t border-slate-100/80 dark:border-zinc-800/80 p-2 bg-slate-50/20 dark:bg-zinc-950/20">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
