export type TaskCategory =
  | 'Job Search'
  | 'Freelance Dev'
  | 'Fitness Coaching'
  | 'Personal Fitness'
  | 'Admin & Outreach'
  | 'Rest & Review';

export type TaskPhase =
  | 'Foundation'
  | 'Outreach & First Clients'
  | 'Delivery & Scale'
  | 'Final Push & Collection';

export interface Task {
  id: string;
  date: string;
  day: string;
  week: number;
  phase: TaskPhase;
  category: TaskCategory;
  task: string;
  time: string;
  done: boolean;
}

export interface DriveSpreadsheet {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export type SyncState = 'idle' | 'syncing' | 'synced' | 'error';

export type AppPage = 'dashboard' | 'diagram' | 'list';
