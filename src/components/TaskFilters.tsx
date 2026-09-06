import { Search, RotateCcw, Lock } from 'lucide-react';
import { TaskCategory, TaskPhase } from '../types';

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedPhase: string;
  onPhaseChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  onResetFilters: () => void;
  filteredCount: number;
}

export const TaskFilters = ({
  searchQuery,
  onSearchChange,
  selectedPhase,
  onPhaseChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  onResetFilters,
  filteredCount,
}: TaskFiltersProps) => {
  return (
    <div
      id="task-filters-bar"
      className="space-y-4 border-b border-slate-100 p-6 dark:border-slate-800"
    >
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        {/* Search Input in Clean Minimalism rounded pill */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-full w-full lg:max-w-md dark:bg-slate-900/60 dark:border-slate-800 focus-within:border-slate-400 dark:focus-within:border-slate-600 transition-colors">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            id="searchInput"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search roadmap tasks..."
            className="w-full bg-transparent border-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-200"
          />
        </div>

        {/* Filters Dropdown & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Phase Filter */}
          <select
            id="phaseFilter"
            value={selectedPhase}
            onChange={(e) => onPhaseChange(e.target.value)}
            className="rounded-full border border-slate-200/80 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 transition-colors"
          >
            <option value="ALL">All Phases</option>
            <option value="Foundation">P1: Foundation</option>
            <option value="Outreach & First Clients">P2: Outreach</option>
            <option value="Delivery & Scale">P3: Scale</option>
            <option value="Final Push & Collection">P4: Final Push</option>
          </select>

          {/* Category Filter */}
          <select
            id="categoryFilter"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="rounded-full border border-slate-200/80 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 transition-colors"
          >
            <option value="ALL">All Categories</option>
            <option value="Job Search">Job Search</option>
            <option value="Freelance Dev">Freelance Dev</option>
            <option value="Fitness Coaching">Fitness Coaching</option>
            <option value="Personal Fitness">Personal Fitness</option>
            <option value="Admin & Outreach">Admin & Outreach</option>
            <option value="Rest & Review">Rest & Review</option>
          </select>

          {/* Status Filter */}
          <select
            id="statusFilter"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-full border border-slate-200/80 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 transition-colors"
          >
            <option value="ALL">All Status</option>
            <option value="UNDONE">Pending</option>
            <option value="DONE">Completed</option>
          </select>

          {/* Reset Filters */}
          <button
            id="resetFiltersBtn"
            title="Reset Filters"
            onClick={onResetFilters}
            className="rounded-full border border-slate-200/80 bg-white p-2 text-slate-400 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Showing count and Locked notification */}
      <div className="flex items-center justify-between pt-1 text-xs text-slate-400 dark:text-slate-500">
        <div className="font-medium">
          Showing{' '}
          <span id="filteredCount" className="font-bold text-slate-900 dark:text-white">
            {filteredCount}
          </span>{' '}
          of 117 tasks
        </div>
        <div className="flex items-center gap-1.5 font-medium text-slate-400 dark:text-slate-500">
          <Lock className="h-3 w-3" />
          <span className="text-[11px]">Tasks locked against edits</span>
        </div>
      </div>
    </div>
  );
};
