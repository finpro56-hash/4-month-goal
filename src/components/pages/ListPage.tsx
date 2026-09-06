import React from 'react';
import { Task } from '../../types';
import { TaskFilters } from '../TaskFilters';
import { TaskTable } from '../TaskTable';
import { ListTodo, CheckCircle2, Clock } from 'lucide-react';

interface ListPageProps {
  tasks: Task[];
  filteredTasks: Task[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedPhase: string;
  onPhaseChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  onResetFilters: () => void;
  onToggleTaskDone: (date: string) => void;
}

export const ListPage: React.FC<ListPageProps> = ({
  tasks,
  filteredTasks,
  searchQuery,
  onSearchChange,
  selectedPhase,
  onPhaseChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  onResetFilters,
  onToggleTaskDone,
}) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const pending = total - completed;

  return (
    <div id="list-page-view" className="space-y-6 animate-fade-in">
      {/* List Page Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827] transition-colors">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <ListTodo className="h-3.5 w-3.5 text-emerald-500" />
            <span>Task Roadmap</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Daily Execution List
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            All 119 daily tasks scheduled from Sep 6 to Dec 31, 2026.
          </p>
        </div>

        {/* Counters */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2 dark:border-slate-800 dark:bg-slate-900/60">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <div>
              <span className="block text-[10px] uppercase font-semibold text-slate-400">
                Completed
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {completed}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2 dark:border-slate-800 dark:bg-slate-900/60">
            <Clock className="h-4 w-4 text-slate-400" />
            <div>
              <span className="block text-[10px] uppercase font-semibold text-slate-400">
                Pending
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {pending}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Task List Card Container */}
      <div
        id="task-list-card"
        className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111827] transition-colors"
      >
        {/* Filters Bar */}
        <TaskFilters
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          selectedPhase={selectedPhase}
          onPhaseChange={onPhaseChange}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          selectedStatus={selectedStatus}
          onStatusChange={onStatusChange}
          onResetFilters={onResetFilters}
          filteredCount={filteredTasks.length}
        />

        {/* Tasks Table / Card List */}
        <TaskTable tasks={filteredTasks} onToggleDone={onToggleTaskDone} />
      </div>
    </div>
  );
};
