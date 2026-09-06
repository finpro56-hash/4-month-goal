import { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import { rawTasks } from './data/initialTasks';
import { Task, DriveSpreadsheet, SyncState, AppPage } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardPage } from './components/pages/DashboardPage';
import { DiagramPage } from './components/pages/DiagramPage';
import { ListPage } from './components/pages/ListPage';
import { GoogleSyncModal } from './components/GoogleSyncModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  logout,
} from './lib/firebase';
import {
  listDriveSpreadsheets,
  createIncomePlanSpreadsheet,
  populateSpreadsheetWithTasks,
  fetchTaskStatusesFromSheet,
  updateSingleTaskInSheet,
  syncToAppsScriptWebhook,
} from './lib/googleWorkspace';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Active Page View state ('dashboard' | 'diagram' | 'list')
  const [activePage, setActivePage] = useState<AppPage>('dashboard');

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('task_done_map');
      const doneMap: Record<string, boolean> = saved ? JSON.parse(saved) : {};
      return rawTasks.map((t) => ({
        ...t,
        done: doneMap[t.date] !== undefined ? doneMap[t.date] : t.done,
      }));
    } catch (e) {
      console.error('Failed to load tasks from localStorage', e);
      return rawTasks;
    }
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Google OAuth & Sync state
  const [user, setUser] = useState<User | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(
    () => localStorage.getItem('google_script_url') || ''
  );

  const [activeSpreadsheet, setActiveSpreadsheet] = useState<DriveSpreadsheet | null>(() => {
    try {
      const saved = localStorage.getItem('active_spreadsheet');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [driveSpreadsheets, setDriveSpreadsheets] = useState<DriveSpreadsheet[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);

  // User Confirmation Modal State (Mandated for mutating Google Workspace data)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Notification Banner
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
      },
      () => {
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch Drive spreadsheets when user is authenticated
  const loadDriveSheets = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      setIsLoadingDrive(true);
      const sheets = await listDriveSpreadsheets(token);
      setDriveSpreadsheets(sheets);
    } catch (err) {
      console.error('Failed to load drive files:', err);
    } finally {
      setIsLoadingDrive(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadDriveSheets();
    }
  }, [user, loadDriveSheets]);

  // Sign In with Google
  const handleGoogleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        showNotification(`Welcome, ${res.user.displayName || 'User'}! Connected to Google Workspace.`);
        loadDriveSheets();
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      showNotification('Google Sign In was cancelled or failed.', 'error');
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    showNotification('Signed out from Google Account.', 'info');
  };

  // Toggle Task Done Status
  const toggleTaskDone = async (date: string) => {
    const updatedTasks = tasks.map((t) => (t.date === date ? { ...t, done: !t.done } : t));
    const targetTask = updatedTasks.find((t) => t.date === date);
    if (!targetTask) return;

    setTasks(updatedTasks);

    // Save to localStorage
    const savedMap = JSON.parse(localStorage.getItem('task_done_map') || '{}');
    savedMap[date] = targetTask.done;
    localStorage.setItem('task_done_map', JSON.stringify(savedMap));

    // Trigger Sheet & Webhook sync in background
    if (activeSpreadsheet || appsScriptUrl) {
      setSyncState('syncing');
      let sheetSuccess = false;
      let webhookSuccess = false;

      try {
        const token = await getAccessToken();
        if (activeSpreadsheet && token) {
          sheetSuccess = await updateSingleTaskInSheet(
            token,
            activeSpreadsheet.id,
            targetTask.date,
            targetTask.done,
            updatedTasks
          );
        }

        if (appsScriptUrl) {
          webhookSuccess = await syncToAppsScriptWebhook(
            appsScriptUrl,
            targetTask.date,
            targetTask.done
          );
        }

        if (sheetSuccess || webhookSuccess) {
          setSyncState('synced');
          setTimeout(() => setSyncState('idle'), 3000);
        } else {
          setSyncState('idle');
        }
      } catch (err) {
        console.error('Background sync failed:', err);
        setSyncState('error');
        setTimeout(() => setSyncState('idle'), 4000);
      }
    }
  };

  // Create New Sheet in Google Drive with User Confirmation
  const handleCreateNewSheet = () => {
    if (!user) {
      handleGoogleSignIn();
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Create New Spreadsheet in Google Drive?',
      description:
        'This will create a new Google Spreadsheet named "4-Month Income Plan - Daily Tasks & Roadmap" in your Google Drive and populate all 117 roadmap tasks with formatted columns.',
      confirmText: 'Create & Populate',
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          const token = await getAccessToken();
          if (!token) throw new Error('Authentication token required');

          const newSheet = await createIncomePlanSpreadsheet(token);
          await populateSpreadsheetWithTasks(token, newSheet.id, tasks);

          setActiveSpreadsheet(newSheet);
          localStorage.setItem('active_spreadsheet', JSON.stringify(newSheet));
          loadDriveSheets();

          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showNotification(`Created and linked "${newSheet.name}" in Google Drive!`);
        } catch (err: any) {
          console.error('Create sheet failed:', err);
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showNotification(`Failed to create spreadsheet: ${err.message}`, 'error');
        }
      },
    });
  };

  // Sync All Tasks to Sheet with User Confirmation
  const handleExportAllToSheet = () => {
    if (!activeSpreadsheet) return;
    if (!user) {
      handleGoogleSignIn();
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Sync All Tasks to Google Sheet?',
      description: `This will update the "Daily Tasks" tab in "${activeSpreadsheet.name}" with all 117 tasks and your current completion statuses. Existing data in this worksheet will be updated.`,
      confirmText: 'Sync to Sheet',
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          const token = await getAccessToken();
          if (!token) throw new Error('Authentication token required');

          await populateSpreadsheetWithTasks(token, activeSpreadsheet.id, tasks);
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showNotification(`Successfully synchronized all 117 tasks to "${activeSpreadsheet.name}"!`);
          setSyncState('synced');
          setTimeout(() => setSyncState('idle'), 3000);
        } catch (err: any) {
          console.error('Sync all failed:', err);
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showNotification(`Failed to sync to Google Sheet: ${err.message}`, 'error');
          setSyncState('error');
        }
      },
    });
  };

  // Pull Completed Statuses from Sheet with User Confirmation
  const handleImportFromSheet = () => {
    if (!activeSpreadsheet) return;
    if (!user) {
      handleGoogleSignIn();
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Pull Task Statuses from Google Sheet?',
      description: `This will read the task completion statuses (Column H) from "${activeSpreadsheet.name}" and update your local dashboard checkboxes to match.`,
      confirmText: 'Pull & Update',
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          const token = await getAccessToken();
          if (!token) throw new Error('Authentication token required');

          const statusMap = await fetchTaskStatusesFromSheet(token, activeSpreadsheet.id);
          const updated = tasks.map((t) => ({
            ...t,
            done: statusMap[t.date] !== undefined ? statusMap[t.date] : t.done,
          }));

          setTasks(updated);

          // Update localStorage
          const savedMap: Record<string, boolean> = {};
          updated.forEach((t) => {
            savedMap[t.date] = t.done;
          });
          localStorage.setItem('task_done_map', JSON.stringify(savedMap));

          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showNotification(`Updated tasks from "${activeSpreadsheet.name}"!`);
        } catch (err: any) {
          console.error('Pull status failed:', err);
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showNotification(`Failed to pull statuses: ${err.message}`, 'error');
        }
      },
    });
  };

  const handleSelectDriveSheet = (sheet: DriveSpreadsheet) => {
    setActiveSpreadsheet(sheet);
    localStorage.setItem('active_spreadsheet', JSON.stringify(sheet));
    showNotification(`Linked to "${sheet.name}".`);
  };

  const handleSaveAppsScriptUrl = (url: string) => {
    setAppsScriptUrl(url);
    localStorage.setItem('google_script_url', url);
    showNotification(url ? 'Google Apps Script Web App URL saved!' : 'Webhook URL cleared.');
  };

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    const search = searchQuery.toLowerCase().trim();
    return tasks.filter((t) => {
      const matchesSearch =
        !search ||
        t.task.toLowerCase().includes(search) ||
        t.date.toLowerCase().includes(search) ||
        t.category.toLowerCase().includes(search) ||
        t.day.toLowerCase().includes(search);

      const matchesPhase = selectedPhase === 'ALL' || t.phase.includes(selectedPhase);
      const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
      const matchesStatus =
        selectedStatus === 'ALL' || (selectedStatus === 'DONE' ? t.done : !t.done);

      return matchesSearch && matchesPhase && matchesCategory && matchesStatus;
    });
  }, [tasks, searchQuery, selectedPhase, selectedCategory, selectedStatus]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedPhase('ALL');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 transition-colors duration-200 dark:bg-[#0B0F17] dark:text-slate-100">
      {/* Toast Notification */}
      {notification && (
        <div
          id="toast-notification"
          className={`fixed bottom-20 right-5 sm:bottom-22 z-50 flex items-center gap-2.5 rounded-full px-4 py-2.5 text-xs font-medium shadow-md border animate-fade-in ${
            notification.type === 'error'
              ? 'border-rose-200 bg-white text-rose-700 dark:border-rose-900/60 dark:bg-slate-900 dark:text-rose-300'
              : notification.type === 'info'
              ? 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              : 'border-emerald-200 bg-white text-emerald-700 dark:border-emerald-900/60 dark:bg-slate-900 dark:text-emerald-300'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-current"></span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <Header
        user={user}
        syncState={syncState}
        sheetName={activeSpreadsheet?.name}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Main Content: 3 Separated Pages */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-28 sm:pb-32">
        {activePage === 'dashboard' && (
          <DashboardPage
            tasks={tasks}
            onNavigate={setActivePage}
            onToggleTaskDone={toggleTaskDone}
          />
        )}

        {activePage === 'diagram' && (
          <DiagramPage tasks={tasks} />
        )}

        {activePage === 'list' && (
          <ListPage
            tasks={tasks}
            filteredTasks={filteredTasks}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedPhase={selectedPhase}
            onPhaseChange={setSelectedPhase}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onResetFilters={handleResetFilters}
            onToggleTaskDone={toggleTaskDone}
          />
        )}
      </main>

      {/* Mobile App Style Bottom Navigation Bar */}
      <BottomNav
        activePage={activePage}
        onSelectPage={setActivePage}
        pendingTasksCount={tasks.filter((t) => !t.done).length}
      />

      {/* Google Sheets Sync Configuration Modal */}
      <GoogleSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        user={user}
        onGoogleSignIn={handleGoogleSignIn}
        activeSpreadsheet={activeSpreadsheet}
        driveSpreadsheets={driveSpreadsheets}
        isLoadingDrive={isLoadingDrive}
        onRefreshDriveSheets={loadDriveSheets}
        onSelectDriveSheet={handleSelectDriveSheet}
        onCreateNewSheet={handleCreateNewSheet}
        onExportAllToSheet={handleExportAllToSheet}
        onImportFromSheet={handleImportFromSheet}
        appsScriptUrl={appsScriptUrl}
        onSaveAppsScriptUrl={handleSaveAppsScriptUrl}
      />

      {/* Mandatory User Confirmation Modal for Workspace Updates */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        isDestructive={confirmModal.isDestructive}
        isLoading={confirmModal.isLoading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* PWA Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
