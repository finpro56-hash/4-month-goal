import { useState } from 'react';
import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { Task, TaskCategory } from '../types';

interface AnalyticsChartsProps {
  tasks: Task[];
}

export const categoryMeta: Record<TaskCategory, { label: string; color: string; bgClass: string }> = {
  'Job Search': { label: 'Job Search', color: '#3b82f6', bgClass: 'bg-blue-500' },
  'Freelance Dev': { label: 'Freelance Dev', color: '#8b5cf6', bgClass: 'bg-purple-500' },
  'Fitness Coaching': { label: 'Fitness Coaching', color: '#10b981', bgClass: 'bg-emerald-500' },
  'Personal Fitness': { label: 'Personal Fitness', color: '#f59e0b', bgClass: 'bg-amber-500' },
  'Admin & Outreach': { label: 'Admin & Outreach', color: '#f43f5e', bgClass: 'bg-rose-500' },
  'Rest & Review': { label: 'Rest & Review', color: '#64748b', bgClass: 'bg-slate-500' },
};

export const AnalyticsCharts = ({ tasks }: AnalyticsChartsProps) => {
  const [isOpen, setIsOpen] = useState(true);

  // 1. Category data
  const categories = Object.keys(categoryMeta) as TaskCategory[];
  const categoryStats = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat);
    const completed = catTasks.filter((t) => t.done).length;
    const total = catTasks.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      category: cat,
      meta: categoryMeta[cat],
      completed,
      total,
      pct,
    };
  });

  const totalCompleted = tasks.filter((t) => t.done).length;

  // 2. Phase data
  const phases = [
    { key: 'Foundation', label: 'P1: Foundation' },
    { key: 'Outreach & First Clients', label: 'P2: Outreach' },
    { key: 'Delivery & Scale', label: 'P3: Scale' },
    { key: 'Final Push & Collection', label: 'P4: Final Push' },
  ];

  const phaseStats = phases.map((p) => {
    const pTasks = tasks.filter((t) => t.phase.includes(p.key));
    const completed = pTasks.filter((t) => t.done).length;
    const total = pTasks.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      ...p,
      completed,
      total,
      pct,
    };
  });

  // 3. Weekly breakdown (Weeks 1 to 17)
  const weeks = Array.from({ length: 17 }, (_, i) => i + 1);
  const weeklyStats = weeks.map((w) => {
    const wTasks = tasks.filter((t) => t.week === w);
    const completed = wTasks.filter((t) => t.done).length;
    const total = wTasks.length;
    return {
      week: w,
      completed,
      total,
    };
  });

  // Calculate SVG doughnut segments for Category Chart
  // Radius = 60, circumference = 2 * PI * 60 = 376.99
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let cumulativePct = 0;

  return (
    <div
      id="analytics-card"
      className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111827] transition-colors"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            <BarChart3 className="h-4 w-4" />
          </div>
          <h2 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
            Analytics &amp; Performance Breakdown
          </h2>
        </div>
        <button
          id="toggleChartsBtn"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <span>{isOpen ? 'Collapse view' : 'Expand view'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && (
        <div
          id="chartsContainer"
          className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* 1. Category Completion Breakdown */}
          <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC]/80 p-5 dark:border-slate-800/80 dark:bg-slate-900/40">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Completion by Category
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                6 Areas
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Interactive SVG Doughnut */}
              <div className="relative flex h-40 w-40 shrink-0 items-center justify-center">
                <svg className="h-40 w-40 -rotate-90 transform" viewBox="0 0 160 160">
                  {/* Background Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeWidth="16"
                    fill="transparent"
                  />
                  {/* Slices for each category */}
                  {categoryStats.map((item) => {
                    const sliceFraction = totalCompleted > 0 ? item.completed / totalCompleted : 0;
                    const strokeDasharray = `${sliceFraction * circumference} ${circumference}`;
                    const strokeDashoffset = -cumulativePct * circumference;
                    cumulativePct += sliceFraction;

                    if (item.completed === 0) return null;

                    return (
                      <circle
                        key={item.category}
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke={item.meta.color}
                        strokeWidth="16"
                        fill="transparent"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </svg>

                {/* Center Stats */}
                <div className="absolute text-center">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {totalCompleted}
                  </span>
                  <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                    Done
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 space-y-1.5 w-full text-xs">
                {categoryStats.map((item) => (
                  <div key={item.category} className="flex items-center justify-between gap-2 py-0.5">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: item.meta.color }}
                      />
                      <span className="truncate text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                        {item.category}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                      {item.completed}/{item.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Phase Completion Breakdown */}
          <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC]/80 p-5 dark:border-slate-800/80 dark:bg-slate-900/40">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Progress by Phase
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Tracked
              </span>
            </div>
            <div className="flex h-44 flex-col justify-between py-1">
              {phaseStats.map((p) => (
                <div key={p.key} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {p.label}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                      {p.completed} / {p.total} ({p.pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-slate-900 dark:bg-white transition-all duration-500"
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Weekly Progress Breakdown (17 Weeks) */}
          <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC]/80 p-5 dark:border-slate-800/80 dark:bg-slate-900/40">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Weekly Task Breakdown
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                17 Weeks
              </span>
            </div>

            <div className="h-44 flex items-end justify-between gap-1 pt-2 px-1">
              {weeklyStats.map((w) => {
                const isAllDone = w.total > 0 && w.completed === w.total;
                return (
                  <div
                    key={w.week}
                    className="flex flex-col items-center flex-1 h-full justify-end group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                      <div className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-medium text-white whitespace-nowrap shadow-md">
                        W{w.week}: {w.completed}/{w.total} tasks
                      </div>
                      <div className="w-1.5 h-1.5 rotate-45 bg-slate-900 -mt-0.5"></div>
                    </div>

                    {/* Bar track and fill */}
                    <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-32 flex flex-col justify-end overflow-hidden p-0.5">
                      <div
                        className={`w-full rounded-full transition-all duration-300 ${
                          isAllDone
                            ? 'bg-emerald-500'
                            : 'bg-slate-900 dark:bg-white'
                        }`}
                        style={{ height: `${Math.max((w.completed / (w.total || 7)) * 100, 4)}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-1.5 dark:text-slate-500">
                      W{w.week}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
