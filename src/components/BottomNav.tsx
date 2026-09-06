import React from 'react';
import { LayoutDashboard, BarChart3, ListTodo } from 'lucide-react';
import { AppPage } from '../types';

interface BottomNavProps {
  activePage: AppPage;
  onSelectPage: (page: AppPage) => void;
  pendingTasksCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activePage,
  onSelectPage,
  pendingTasksCount,
}) => {
  const navItems: Array<{
    id: AppPage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'diagram',
      label: 'Diagram',
      icon: BarChart3,
    },
    {
      id: 'list',
      label: 'List',
      icon: ListTodo,
      badge: pendingTasksCount,
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/85 dark:bg-[#0B0F17]/95 dark:border-slate-800/85 shadow-lg transition-colors duration-200 pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="mx-auto max-w-md sm:max-w-xl px-2 sm:px-6">
        <div className="flex h-16 items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                id={`bottom-nav-${item.id}-btn`}
                type="button"
                onClick={() => onSelectPage(item.id)}
                className={`relative flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 px-2 rounded-2xl transition-all duration-150 active:scale-95 ${
                  isActive
                    ? 'text-slate-950 dark:text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active Indicator Pill */}
                {isActive && (
                  <span className="absolute top-1 h-1 w-8 rounded-full bg-slate-900 dark:bg-emerald-400 transition-all" />
                )}

                <div className="relative mt-1">
                  <Icon
                    className={`h-5 w-5 transition-transform duration-150 ${
                      isActive ? 'scale-110 stroke-[2.3]' : 'scale-100 stroke-[1.8]'
                    }`}
                  />
                  {/* Badge on List tab if pending tasks exist */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      id="bottom-nav-tasks-badge"
                      className={`absolute -top-1.5 -right-3 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`mt-1 text-[11px] tracking-tight ${
                    isActive ? 'font-semibold' : 'font-normal'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
