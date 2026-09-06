import { CheckCircle2, ListChecks, Flag, IndianRupee } from 'lucide-react';
import { Task } from '../types';

interface SummaryCardsProps {
  tasks: Task[];
}

export const SummaryCards = ({ tasks }: SummaryCardsProps) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = total - completed;

  // Determine current active phase based on completion or current week
  // Phase 1 (Weeks 1-2): Sep 6 – Sep 19
  // Phase 2 (Weeks 3-8): Sep 20 – Oct 31
  // Phase 3 (Weeks 9-13): Nov 1 – Nov 30
  // Phase 4 (Weeks 13-17): Dec 1 – Dec 31
  const phase1Tasks = tasks.filter((t) => t.phase === 'Foundation');
  const phase1Done = phase1Tasks.every((t) => t.done);
  const phase2Tasks = tasks.filter((t) => t.phase === 'Outreach & First Clients');
  const phase2Done = phase2Tasks.every((t) => t.done);
  const phase3Tasks = tasks.filter((t) => t.phase === 'Delivery & Scale');
  const phase3Done = phase3Tasks.every((t) => t.done);

  let activePhaseName = 'Phase 1: Foundation';
  let activePhaseDates = 'Sep 6 – Sep 19';

  if (phase1Done && !phase2Done) {
    activePhaseName = 'Phase 2: Outreach';
    activePhaseDates = 'Sep 20 – Oct 31';
  } else if (phase1Done && phase2Done && !phase3Done) {
    activePhaseName = 'Phase 3: Delivery & Scale';
    activePhaseDates = 'Nov 1 – Nov 30';
  } else if (phase1Done && phase2Done && phase3Done) {
    activePhaseName = 'Phase 4: Final Push';
    activePhaseDates = 'Dec 1 – Dec 31';
  }

  return (
    <div
      id="summary-cards-grid"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
    >
      {/* Total Progress */}
      <div
        id="card-total-progress"
        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827] transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Total Progress
          </span>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-0.5 rounded-md">
            {pct}%
          </span>
        </div>
        <div id="statCompletionPct" className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {pct}%
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            id="statProgressBar"
            className="h-full rounded-full bg-slate-900 dark:bg-white transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          {completed} of {total} tasks completed
        </p>
      </div>

      {/* Tasks Done */}
      <div
        id="card-tasks-done"
        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827] transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Tasks Done
          </span>
          <span className="text-xs font-semibold text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-0.5 rounded-md">
            117 Total
          </span>
        </div>
        <div id="statTasksCount" className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {completed} <span className="text-lg font-normal text-slate-400">/ {total}</span>
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p id="statTasksRemaining" className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          {remaining} remaining to finish
        </p>
      </div>

      {/* Active Phase */}
      <div
        id="card-active-phase"
        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827] transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Active Phase
          </span>
          <span className="text-xs font-semibold text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-0.5 rounded-md">
            4 Phases
          </span>
        </div>
        <div id="statActivePhase" className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white" title={activePhaseName}>
          {activePhaseName}
        </div>
        <div className="mt-4 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-900 dark:bg-white"></span>
          <p id="statPhaseDate" className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {activePhaseDates}
          </p>
        </div>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          Roadmap schedule
        </p>
      </div>

      {/* Income Goal */}
      <div
        id="card-income-goal"
        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827] transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Income Target
          </span>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-200 px-2.5 py-0.5 rounded-md">
            Target
          </span>
        </div>
        <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          ₹20,00,000
        </div>
        <div className="mt-4 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Dec 31, 2026 Milestone
          </p>
        </div>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          Full 4-month trajectory
        </p>
      </div>
    </div>
  );
};
