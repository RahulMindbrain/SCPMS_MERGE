import { LogOut, GraduationCap, PanelLeft, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export interface SidebarItem {
  icon: LucideIcon;
  label: string;
  path: string;
  section: string;
}

interface SidebarProps {
  items: SidebarItem[];
  isCollapsed: boolean;
  onToggle: () => void;
  onSignOut?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  title?: string;
  subtitle?: string;
}

const Sidebar = ({ items, isCollapsed, onToggle, onSignOut, isOpenMobile, onCloseMobile, subtitle, title }: SidebarProps) => {
  const sidebarClasses = `
    bg-sidebar text-sidebar-foreground flex flex-col shadow-2xl z-50 border-r border-sidebar-border transition-all duration-300 ease-in-out
    ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
    ${isOpenMobile ? 'fixed inset-y-0 left-0 w-64' : 'fixed inset-y-0 -left-64 lg:sticky lg:inset-auto lg:h-screen lg:top-0'}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={onCloseMobile}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Header Section */}
        <div className={`flex items-center py-6 px-4 ${isCollapsed ? 'lg:flex-col lg:space-y-4' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <GraduationCap className="text-white w-6 h-6 lg:w-7 lg:h-7" />
            </div>
            {(!isCollapsed || isOpenMobile) && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <h1 className="font-bold text-lg leading-tight">
                  {title}
                </h1>

                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  {subtitle}
                </p>

              </div>
            )}
          </div>

          <button
            onClick={isOpenMobile ? onCloseMobile : onToggle}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-300"
          >
            {isOpenMobile ? <X className="w-5 h-5" /> : <PanelLeft className={`w-5 h-5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 px-3 flex flex-col space-y-4 py-4 overflow-y-auto no-scrollbar ${isCollapsed ? 'lg:items-center' : ''}`}>
          {Object.entries(
            items.reduce((acc, item) => {
              if (!acc[item.section]) acc[item.section] = [];
              acc[item.section].push(item);
              return acc;
            }, {} as Record<string, SidebarItem[]>)
          ).map(([section, sectionItems]) => (
            <div key={section} className="flex flex-col space-y-1.5">
              {(!isCollapsed || isOpenMobile) && (
                <span className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section}
                </span>
              )}
              {sectionItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => isOpenMobile && onCloseMobile?.()}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl transition-all duration-300 group relative ${isCollapsed ? 'lg:w-12 lg:h-12 lg:justify-center' : 'px-4 py-2.5 gap-3 w-full'
                    } ${isOpenMobile ? 'px-4 py-2.5 gap-3 w-full' : ''} ${isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />

                      {(!isCollapsed || isOpenMobile) && (
                        <span className={`text-sm font-medium whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300 ${isActive ? 'font-bold' : ''}`}>
                          {item.label}
                        </span>
                      )}

                      {/* Tooltip on hover (only when collapsed on desktop) */}
                      {isCollapsed && !isOpenMobile && (
                        <div className="hidden lg:block absolute left-16 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10 translate-x-1 group-hover:translate-x-0 duration-300 z-50">
                          {item.label}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer / Sign Out */}
        <div className={`p-4 border-t border-white/5 ${isCollapsed && !isOpenMobile ? 'lg:flex lg:justify-center' : ''}`}>
          <button
            onClick={onSignOut}
            className={`flex items-center rounded-xl transition-all group relative text-gray-400 hover:bg-red-500/10 hover:text-red-400 ${isCollapsed && !isOpenMobile ? 'lg:w-12 lg:h-12 lg:justify-center' : 'px-4 py-3 gap-3 w-full'
              }`}
          >
            <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
            {(!isCollapsed || isOpenMobile) && <span className="text-sm font-medium">Sign Out</span>}

            {isCollapsed && !isOpenMobile && (
              <div className="hidden lg:block absolute left-16 bg-red-900/90 text-white px-3 py-1.5 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-red-500/20 translate-x-1 group-hover:translate-x-0 duration-300 z-50">
                Sign Out
              </div>
            )}
          </button>
        </div>

        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </aside>
    </>
  );
};

export default Sidebar;