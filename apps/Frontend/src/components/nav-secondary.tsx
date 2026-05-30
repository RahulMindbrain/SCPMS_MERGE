"use client"

import * as React from "react"
import { motion } from "framer-motion"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: React.ReactNode
    badge?: number | string
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const location = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  if (!items || items.length === 0) return null

  return (
    <SidebarGroup {...props} className="p-1">
      <SidebarGroupLabel className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-slate-400/80 dark:text-slate-500/80 px-3 mb-1.5 select-none group-data-[collapsible=icon]:hidden">
        More
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5 px-1 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
          {items.map((item) => {
            const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + '/')
            return (
              <SidebarMenuItem key={item.title} className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={`
                    h-10 transition-all duration-200 rounded-xl border-none relative group/btn
                    ${isActive
                      ? "bg-indigo-50/70 text-indigo-600 font-semibold dark:bg-indigo-950/40 dark:text-indigo-300"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100 hover:translate-x-1 group-data-[collapsible=icon]:hover:translate-x-0"
                    }
                    group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center
                  `}
                >
                  <Link to={item.url} onClick={handleLinkClick} className="flex items-center w-full gap-3 pl-3 pr-2.5 relative group/link group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
                    <span className={`size-5 flex items-center justify-center shrink-0 transition-all duration-200 [&>svg]:size-5 ${isActive ? "text-indigo-600 dark:text-indigo-400 scale-105" : "text-slate-400 dark:text-slate-500 group-hover/link:text-slate-700 dark:group-hover/link:text-slate-300"}`}>
                       {item.icon}
                    </span>
                    <span className={`text-[13.5px] font-medium tracking-tight group-data-[collapsible=icon]:hidden whitespace-nowrap transition-all duration-200 ${isActive ? "text-indigo-600 dark:text-indigo-300 font-semibold" : "text-slate-600 dark:text-slate-400 group-hover/link:text-slate-900 dark:group-hover/link:text-slate-100"}`}>
                      {item.title}
                    </span>

                    {item.badge !== undefined && (
                      <span className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tracking-tight transition-all duration-200 group-data-[collapsible=icon]:hidden ${
                        isActive 
                          ? "bg-indigo-600 text-white dark:bg-indigo-500 dark:text-slate-950" 
                          : "bg-slate-100 text-slate-600 dark:bg-slate-900/60 dark:text-slate-400 group-hover/link:bg-indigo-50 group-hover/link:text-indigo-600 dark:group-hover/link:bg-indigo-950/50 dark:group-hover/link:text-indigo-400"
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <motion.div 
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 w-[3.5px] h-5 bg-indigo-600 dark:bg-indigo-500 rounded-r-full group-data-[collapsible=icon]:hidden"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>


  )
}
