import { useState } from 'react';
import { Check, Clock, Calendar, LayoutList, Table as TableIcon } from 'lucide-react';
import { Task, TaskCategory } from '../types';

interface TaskTableProps {
  tasks: Task[];
  onToggleDone: (date: string) => void;
}

export const categoryPillStyles: Record<TaskCategory, string> = {
  'Job Search': 'bg-sky-50 text-sky-700 border border-sky-200/60 dark:bg-sky-950/40 dark:border-sky-800/60 dark:text-sky-300',
  'Freelance Dev': 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/40 dark:border-indigo-800/60 dark:text-indigo-300',
  'Fitness Coaching': 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300',
  'Personal Fitness': 'bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300',
  'Admin & Outreach': 'bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:border-rose-800/60 dark:text-rose-300',
  'Rest & Review': 'bg-slate-100 text-slate-700 border border-slate-200/60 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300',
};

export const TaskTable = ({ tasks, onToggleDone }: TaskTableProps) => {
  const [viewMode, setViewMode] = useState<'auto' | 'cards' | 'table'>('auto');

  if (tasks.length === 0) {
    return (
      <div id="no-tasks-state" className="py-16 text-center text-slate-400 dark:text-slate-500">
        <p className="text-xs font-medium">No tasks match your filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Mobile-Friendly View Toggle */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/60 text-xs text-slate-500">
        <span className="font-medium text-[11px] text-slate-400 dark:text-slate-500">
          Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-full p-0.5">
          <button
            id="toggle-view-cards-btn"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
              viewMode === 'cards' || (viewMode === 'auto')
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            } sm:${viewMode === 'cards' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500'}`}
            title="Card view (optimized for mobile)"
          >
            <LayoutList className="h-3 w-3" />
            <span>Cards</span>
          </button>
          <button
            id="toggle-view-table-btn"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
              viewMode === 'table'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Table view (full roadmap columns)"
          >
            <TableIcon className="h-3 w-3" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* MOBILE CARDS VIEW: Shown by default on mobile or when cards mode selected */}
      <div
        id="tasks-mobile-card-list"
        className={`${
          viewMode === 'table' ? 'hidden' : viewMode === 'cards' ? 'block' : 'block sm:hidden'
        } divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[640px] overflow-y-auto custom-scrollbar`}
      >
        {tasks.map((t) => {
          const pillStyle =
            categoryPillStyles[t.category] || 'bg-slate-100 text-slate-800 dark:bg-slate-800';

          return (
            <div
              key={`card-${t.id || t.date}`}
              className={`p-4 transition-colors ${
                t.done
                  ? 'bg-slate-50/40 dark:bg-slate-900/20'
                  : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* 44px Touch Target for Done Checkbox */}
                <button
                  type="button"
                  onClick={() => onToggleDone(t.date)}
                  aria-label={`Mark task on ${t.date} as ${t.done ? 'incomplete' : 'completed'}`}
                  className={`min-h-[44px] min-w-[44px] -m-2 flex items-center justify-center rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400`}
                >
                  <div
                    className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                      t.done
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {t.done && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </button>

                {/* Card Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {t.date}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      W{t.week}
                    </span>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${pillStyle}`}
                    >
                      {t.category}
                    </span>
                  </div>

                  <p
                    onClick={() => onToggleDone(t.date)}
                    className={`text-xs sm:text-sm leading-relaxed cursor-pointer transition ${
                      t.done
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-slate-100 font-medium'
                    }`}
                  >
                    {t.task}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t.time}
                    </span>
                    <span className="truncate max-w-[170px] text-[11px]">
                      {t.phase}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE VIEW: Shown on tablet/desktop or when table mode selected */}
      <div
        id="tasks-desktop-table-container"
        className={`${
          viewMode === 'cards' ? 'hidden' : viewMode === 'table' ? 'block' : 'hidden sm:block'
        } max-h-[600px] overflow-x-auto custom-scrollbar`}
      >
        <table id="tasks-table" className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/90 text-[11px] font-semibold uppercase tracking-wider text-slate-400 backdrop-blur dark:border-slate-800 dark:bg-[#111827]/90 dark:text-slate-400">
            <tr>
              <th className="w-12 px-5 py-3.5 text-center">Done</th>
              <th className="w-28 px-4 py-3.5">Date</th>
              <th className="w-16 px-4 py-3.5">Wk</th>
              <th className="w-36 px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5">Task Description</th>
              <th className="w-24 px-4 py-3.5">Time</th>
              <th className="w-36 px-5 py-3.5 text-right">Phase</th>
            </tr>
          </thead>
          <tbody id="taskTableBody" className="divide-y divide-slate-100 dark:divide-slate-800/60 font-normal">
            {tasks.map((t) => {
              const pillStyle =
                categoryPillStyles[t.category] || 'bg-slate-100 text-slate-800 dark:bg-slate-800';

              return (
                <tr
                  key={t.id || t.date}
                  className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                    t.done ? 'bg-slate-50/40 dark:bg-slate-900/20' : ''
                  }`}
                >
                  {/* Done Checkbox */}
                  <td className="px-5 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => onToggleDone(t.date)}
                      className="h-4 w-4 cursor-pointer rounded-md border-slate-300 text-slate-900 accent-slate-900 dark:accent-white focus:ring-0 dark:border-slate-700 dark:bg-slate-900"
                      title={`Mark "${t.date}" as ${t.done ? 'pending' : 'completed'}`}
                    />
                  </td>

                  {/* Date */}
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {t.date}
                  </td>

                  {/* Week */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                    W{t.week}
                  </td>

                  {/* Category Pill */}
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${pillStyle}`}>
                      {t.category}
                    </span>
                  </td>

                  {/* Task Description */}
                  <td
                    className={`px-4 py-3.5 leading-relaxed text-xs ${
                      t.done
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-200 font-medium'
                    }`}
                  >
                    {t.task}
                  </td>

                  {/* Estimated Time */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-400 dark:text-slate-500">
                    {t.time}
                  </td>

                  {/* Phase */}
                  <td
                    className="max-w-[150px] truncate whitespace-nowrap px-5 py-3.5 text-xs text-right text-slate-400 dark:text-slate-500"
                    title={t.phase}
                  >
                    {t.phase}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

