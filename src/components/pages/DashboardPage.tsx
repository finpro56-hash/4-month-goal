import React from 'react';
import {
  Target,
  ArrowRight,
  BarChart3,
  ListTodo,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Task, AppPage } from '../../types';
import { SummaryCards } from '../SummaryCards';

interface DashboardPageProps {
  tasks: Task[];
  onNavigate: (page: AppPage) => void;
  onToggleTaskDone: (date: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  tasks,
  onNavigate,
  onToggleTaskDone,
}) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Next up pending tasks (first 4 uncompleted tasks)
  const pendingTasks = tasks.filter((t) => !t.done).slice(0, 4);

  // Phases breakdown
  const phases = [
    {
      key: 'Foundation',
      name: 'Phase 1: Foundation',
      dates: 'Sep 6 – Sep 19',
      weeks: 'Weeks 1–2',
      target: 'Set up profiles, portfolio, resumes, client outreach systems',
    },
    {
      key: 'Outreach & First Clients',
      name: 'Phase 2: Outreach & First Clients',
      dates: 'Sep 20 – Oct 31',
      weeks: 'Weeks 3–8',
      target: '50+ job apps, first 2 dev clients, first 3 fitness coaching clients',
    },
    {
      key: 'Delivery & Scale',
      name: 'Phase 3: Delivery & Scale',
      dates: 'Nov 1 – Nov 30',
      weeks: 'Weeks 9–13',
      target: 'Interviews/offers, scale freelance retainers, expand coaching roster',
    },
    {
      key: 'Final Push & Collection',
      name: 'Phase 4: Final Push & Collection',
      dates: 'Dec 1 – Dec 31',
      weeks: 'Weeks 14–17',
      target: 'Collect ₹20L target revenue, finalize 2027 agreements, year-end review',
    },
  ];

  const phaseStats = phases.map((p) => {
    const pTasks = tasks.filter((t) => t.phase.includes(p.key));
    const pDone = pTasks.filter((t) => t.done).length;
    const pTotal = pTasks.length;
    const pPct = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;
    const isCompleted = pPct === 100 && pTotal > 0;
    const isActive = !isCompleted && pDone > 0;

    return {
      ...p,
      done: pDone,
      total: pTotal,
      pct: pPct,
      isCompleted,
      isActive,
    };
  });

  return (
    <div id="dashboard-page-view" className="space-y-6 animate-fade-in">
      {/* Target Hero Card */}
      <div
        id="dashboard-hero-card"
        className="relative overflow-hidden rounded-3xl border border-slate-900 bg-slate-900 p-6 sm:p-8 text-white shadow-md dark:border-slate-800 dark:bg-[#111827]"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>₹20,00,000 Income Goal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Target Execution Engine
            </h2>
            <p className="max-w-xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              17-week comprehensive blueprint across Job Search, Freelance Software Development, Fitness Coaching, and Daily Execution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dashboard-goto-diagram-btn"
              onClick={() => onNavigate('diagram')}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/25 transition active:scale-95"
            >
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              <span>View Diagram</span>
            </button>
            <button
              id="dashboard-goto-list-btn"
              onClick={() => onNavigate('list')}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition active:scale-95 shadow-sm"
            >
              <ListTodo className="h-4 w-4" />
              <span>Open Task List</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span>Overall Plan Completion</span>
            <span className="font-semibold text-white">{completed} / {total} Tasks ({pct}%)</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Primary Summary Cards */}
      <SummaryCards tasks={tasks} />

      {/* Two Column Section: Phase Milestones & Next Up Tasks */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Phase Milestones (2 cols on lg) */}
        <div
          id="dashboard-phases-section"
          className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827] transition-colors"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                  Roadmap Phases
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  4-Phase milestone trajectory to ₹20L
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('diagram')}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <span>Diagrams</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {phaseStats.map((phase, idx) => (
              <div
                key={phase.key}
                id={`phase-card-${idx + 1}`}
                className={`rounded-xl border p-4 transition-all ${
                  phase.isCompleted
                    ? 'border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                    : phase.isActive
                    ? 'border-slate-300 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/40'
                    : 'border-slate-100 bg-white dark:border-slate-800/80 dark:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {phase.name}
                    </span>
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {phase.weeks}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {phase.done}/{phase.total} ({phase.pct}%)
                    </span>
                    {phase.isCompleted && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                  {phase.target}
                </p>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      phase.isCompleted
                        ? 'bg-emerald-500'
                        : 'bg-slate-900 dark:bg-white'
                    }`}
                    style={{ width: `${phase.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks Quick Action (1 col on lg) */}
        <div
          id="dashboard-upcoming-tasks-section"
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827] flex flex-col justify-between transition-colors"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                    Next Priorities
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Immediate action items
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                {tasks.filter((t) => !t.done).length} left
              </span>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-900 dark:text-white">
                  All tasks completed!
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  You hit all 17-week milestone tasks for ₹20L.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((t) => (
                  <div
                    key={t.id || t.date}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleTaskDone(t.date)}
                      className="min-h-[38px] min-w-[38px] -m-1.5 flex items-center justify-center rounded-lg"
                      title="Mark done"
                    >
                      <div className="h-4 w-4 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>{t.date}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {t.category}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-900 dark:text-slate-100 line-clamp-2 leading-relaxed">
                        {t.task}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            id="dashboard-view-all-tasks-link"
            onClick={() => onNavigate('list')}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
          >
            <span>View All {tasks.length} Tasks in List</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
