
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logoutUser } from "@/redux/thunks/logoutThunk"
import type { AppDispatch } from "@/redux/store/store"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { EllipsisVerticalIcon, LogOutIcon } from "lucide-react"
import { toast } from "sonner"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logoutUser())
    toast.success("Logged out successfully", { id: "logout-toast" })
    navigate("/login", { replace: true })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-14 data-[state=open]:bg-slate-100/80 data-[state=open]:dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 hover:bg-slate-100/80 dark:bg-slate-900/40 dark:hover:bg-slate-900/85 hover:shadow-xs transition-all duration-300 group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center px-3"
              tooltip={user.name}
            >
              <div className="relative group/avatar flex items-center justify-center">
                <Avatar className="h-8.5 w-8.5 rounded-xl border border-slate-200/50 dark:border-slate-800 shadow-sm transition-transform duration-300 group-hover/avatar:scale-105">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400 font-bold text-xs">{user.avatar}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-950 shadow-xs animate-pulse" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-normal group-data-[collapsible=icon]:hidden ml-3.5">
                <span className="truncate font-semibold text-slate-700 dark:text-slate-200 text-[13px] tracking-tight">{user.name}</span>
                <span className="truncate text-[11px] text-slate-400 dark:text-slate-500 font-medium tracking-tight mt-0.5">
                  {user.email}
                </span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4 text-slate-400 dark:text-slate-500 group-data-[collapsible=icon]:hidden transition-all duration-200 hover:text-slate-600 dark:hover:text-zinc-300" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-2xl bg-white/95 dark:bg-slate-950/95 border border-slate-100 dark:border-slate-800/80 shadow-2xl p-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={12}
          >
            <DropdownMenuLabel className="p-2.5 font-normal">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 rounded-xl border border-slate-100 dark:border-slate-800">
                  <AvatarFallback className="rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400 font-bold text-sm">{user.avatar}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-normal">
                  <span className="truncate font-semibold text-slate-800 dark:text-slate-100 text-[13px]">{user.name}</span>
                  <span className="truncate text-xs text-slate-400 dark:text-slate-500">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-zinc-800/80 my-1" />
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="flex items-center gap-3 p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 focus:bg-rose-50 dark:focus:bg-rose-950/20 rounded-xl cursor-pointer transition-all duration-150"
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10 dark:bg-rose-400/10">
                <LogOutIcon className="size-3.5" />
              </div>
              <span className="font-semibold text-xs tracking-tight">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
