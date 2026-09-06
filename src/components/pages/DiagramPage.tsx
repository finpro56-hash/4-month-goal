import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Layers,
  Clock,
  IndianRupee,
  CheckCircle2,
} from 'lucide-react';
import { Task, TaskCategory } from '../../types';
import { categoryMeta } from '../AnalyticsCharts';

interface DiagramPageProps {
  tasks: Task[];
}

export const DiagramPage: React.FC<DiagramPageProps> = ({ tasks }) => {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.done).length;
  const overallPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 1. Category Data
  const categories = Object.keys(categoryMeta) as TaskCategory[];
  const categoryStats = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat);
    const completed = catTasks.filter((t) => t.done).length;
    const total = catTasks.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Parse approximate hours
    const totalHours = catTasks.reduce((acc, curr) => {
      const match = curr.time.match(/([\d.]+)\s*h/i);
      return acc + (match ? parseFloat(match[1]) : 2);
    }, 0);

    const completedHours = catTasks
      .filter((t) => t.done)
      .reduce((acc, curr) => {
        const match = curr.time.match(/([\d.]+)\s*h/i);
        return acc + (match ? parseFloat(match[1]) : 2);
      }, 0);

    return {
      category: cat,
      meta: categoryMeta[cat],
      completed,
      total,
      pct,
      totalHours: Math.round(totalHours),
      completedHours: Math.round(completedHours),
    };
  });

  // 2. Phase Data
  const phases = [
    { key: 'Foundation', label: 'Phase 1: Foundation', weeks: 'W1–W2', targetRevenue: 'Setup & Pipeline' },
    { key: 'Outreach & First Clients', label: 'Phase 2: Outreach', weeks: 'W3–W8', targetRevenue: '₹2,50,000 First Wins' },
    { key: 'Delivery & Scale', label: 'Phase 3: Scale', weeks: 'W9–W13', targetRevenue: '₹9,00,000 Milestone' },
    { key: 'Final Push & Collection', label: 'Phase 4: Final Push', weeks: 'W14–W17', targetRevenue: '₹20,00,000 Realized' },
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

  // 3. Weekly Stats (Weeks 1 to 17)
  const weeks = Array.from({ length: 17 }, (_, i) => i + 1);
  const weeklyStats = weeks.map((w) => {
    const wTasks = tasks.filter((t) => t.week === w);
    const completed = wTasks.filter((t) => t.done).length;
    const total = wTasks.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      week: w,
      completed,
      total,
      pct,
    };
  });

  // SVG Doughnut Calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let cumulativeFraction = 0;

  // Revenue Streams Diagram
  const revenueStreams = [
    {
      title: 'Freelance Software Development',
      amount: '₹8,00,000',
      share: 40,
      color: '#8b5cf6',
      desc: 'US/EU remote clients, web app MVPs, monthly retainers ($1k–$2.5k)',
    },
    {
      title: 'Full-Time / Contract Role',
      amount: '₹6,00,000',
      share: 30,
      color: '#3b82f6',
      desc: 'Target 10–12 LPA equivalent role, signed during Phase 2/3',
    },
    {
      title: 'High-Ticket Fitness Coaching',
      amount: '₹4,00,000',
      share: 20,
      color: '#10b981',
      desc: '8–10 premium 12-week clients at ₹35,000–₹50,000 each',
    },
    {
      title: 'Retainers & Year-End Close',
      amount: '₹2,00,000',
      share: 10,
      color: '#f59e0b',
      desc: 'Maintenance retainers & advance collections in Dec 2026',
    },
  ];

  const totalEstHours = categoryStats.reduce((acc, c) => acc + c.totalHours, 0);
  const totalCompletedHours = categoryStats.reduce((acc, c) => acc + c.completedHours, 0);

  return (
    <div id="diagram-page-view" className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827] transition-colors">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span>Visual Roadmap Diagrams</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Performance &amp; Allocation Charts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-dimensional analysis of task execution, weekly velocity, and effort distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2 dark:border-slate-800 dark:bg-slate-900/60">
            <span className="block text-[10px] uppercase font-semibold text-slate-400">
              Total Progress
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {overallPct}%
            </span>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2 dark:border-slate-800 dark:bg-slate-900/60">
            <span className="block text-[10px] uppercase font-semibold text-slate-400">
              Hours Logged
            </span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {totalCompletedHours} / {totalEstHours}h
            </span>
          </div>
        </div>
      </div>

      {/* Row 1: Category Doughnut Chart & Phase Progress */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 1. Category Completion Doughnut */}
        <div
          id="diagram-category-card"
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827] transition-colors"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                <PieIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Execution by Category
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Distribution across all 6 core disciplines
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {completedTasks} of {totalTasks}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* SVG Doughnut */}
            <div className="relative flex h-48 w-48 shrink-0 items-center justify-center">
              <svg className="h-48 w-48 -rotate-90 transform" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="18"
                  fill="transparent"
                />

                {/* Slices */}
                {categoryStats.map((item) => {
                  const sliceFraction = totalTasks > 0 ? item.total / totalTasks : 0;
                  const strokeDasharray = `${sliceFraction * circumference} ${circumference}`;
                  const strokeDashoffset = -cumulativeFraction * circumference;
                  cumulativeFraction += sliceFraction;

                  return (
                    <circle
                      key={item.category}
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke={item.meta.color}
                      strokeWidth="18"
                      fill="transparent"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300 opacity-90 hover:opacity-100 cursor-pointer"
                    />
                  );
                })}
              </svg>

              {/* Center Metric */}
              <div className="absolute text-center pointer-events-none">
                <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {completedTasks}
                </span>
                <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                  Completed
                </span>
              </div>
            </div>

            {/* Category breakdown rows */}
            <div className="w-full flex-1 space-y-2.5 text-xs">
              {categoryStats.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.meta.color }}
                      />
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                        {item.category}
                      </span>
                    </div>
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      {item.completed}/{item.total} ({item.pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.pct}%`,
                        backgroundColor: item.meta.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Phase Progress Meters */}
        <div
          id="diagram-phase-card"
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827] transition-colors"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Progress by Phase
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  4 sequential gates towards target realization
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              17 Weeks Total
            </span>
          </div>

          <div className="space-y-4">
            {phaseStats.map((p, idx) => (
              <div
                key={p.key}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/40 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white dark:bg-white dark:text-slate-900">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white truncate">
                      {p.label}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">({p.weeks})</span>
                  </div>

                  <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    {p.completed}/{p.total} ({p.pct}%)
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Milestone Target:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{p.targetRevenue}</span>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      p.pct === 100
                        ? 'bg-emerald-500'
                        : 'bg-slate-900 dark:bg-white'
                    }`}
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: 17-Week Task Velocity Bar Chart */}
      <div
        id="diagram-weekly-velocity-card"
        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827] transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                17-Week Velocity Diagram
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Tasks scheduled and completed week by week
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>100% Completed</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-900 dark:bg-white" />
              <span>In Progress</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="h-56 flex items-end justify-between gap-1 sm:gap-2 pt-4 pb-2 px-1">
          {weeklyStats.map((w) => {
            const isAllDone = w.total > 0 && w.completed === w.total;
            const isSelected = selectedWeek === w.week;

            return (
              <div
                key={w.week}
                onClick={() => setSelectedWeek(isSelected ? null : w.week)}
                className="flex flex-col items-center flex-1 h-full justify-end cursor-pointer group relative"
              >
                {/* Floating tooltip */}
                <div
                  className={`absolute bottom-full mb-1 z-30 pointer-events-none flex-col items-center ${
                    isSelected ? 'flex' : 'hidden group-hover:flex'
                  }`}
                >
                  <div className="rounded-xl bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-xl whitespace-nowrap dark:bg-slate-800">
                    <span className="font-bold text-emerald-400">Week {w.week}:</span> {w.completed}/{w.total} ({w.pct}%)
                  </div>
                  <div className="w-1.5 h-1.5 rotate-45 bg-slate-900 -mt-0.5 dark:bg-slate-800" />
                </div>

                {/* Bar Track & Fill */}
                <div
                  className={`w-full rounded-xl flex flex-col justify-end overflow-hidden p-0.5 transition-all ${
                    isSelected
                      ? 'ring-2 ring-emerald-500 bg-slate-200 dark:bg-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800'
                  }`}
                  style={{ height: '170px' }}
                >
                  <div
                    className={`w-full rounded-lg transition-all duration-300 ${
                      isAllDone
                        ? 'bg-emerald-500 shadow-xs'
                        : 'bg-slate-900 dark:bg-white'
                    }`}
                    style={{
                      height: `${Math.max((w.completed / (w.total || 7)) * 100, 5)}%`,
                    }}
                  />
                </div>

                {/* Week Label */}
                <span
                  className={`text-[10px] font-mono mt-2 transition-colors ${
                    isSelected
                      ? 'font-bold text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  W{w.week}
                </span>
              </div>
            );
          })}
        </div>

        {selectedWeek && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span>
              Selected: <strong>Week {selectedWeek}</strong> —{' '}
              {weeklyStats[selectedWeek - 1].completed} of {weeklyStats[selectedWeek - 1].total} tasks done (
              {weeklyStats[selectedWeek - 1].pct}%)
            </span>
            <button
              onClick={() => setSelectedWeek(null)}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Row 3: Revenue Stream Model Architecture */}
      <div
        id="diagram-revenue-streams-card"
        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827] transition-colors"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <IndianRupee className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Income Architecture Breakdown (Target: ₹20,00,000)
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Revenue streams structured across freelance dev, employment, coaching, and retainers
              </p>
            </div>
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm">
            ₹20L Total
          </span>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="h-3 w-full rounded-full overflow-hidden flex mb-5 bg-slate-100 dark:bg-slate-800">
          {revenueStreams.map((stream) => (
            <div
              key={stream.title}
              title={`${stream.title}: ${stream.amount} (${stream.share}%)`}
              className="h-full transition-all hover:opacity-80"
              style={{
                width: `${stream.share}%`,
                backgroundColor: stream.color,
              }}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {revenueStreams.map((stream) => (
            <div
              key={stream.title}
              className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: stream.color }}
                />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {stream.share}%
                </span>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {stream.amount}
              </div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {stream.title}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                {stream.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
