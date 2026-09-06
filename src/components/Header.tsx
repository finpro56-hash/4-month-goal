import { Target, Sheet, Moon, Sun, Check, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';
import { SyncState } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  user: User | null;
  syncState: SyncState;
  sheetName?: string;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenSyncModal: () => void;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
}

export const Header = ({
  user,
  syncState,
  sheetName,
  isDarkMode,
  onToggleTheme,
  onOpenSyncModal,
  onGoogleSignIn,
  onSignOut,
}: HeaderProps) => {
  return (
    <header
      id="main-header"
      className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0B0F17]/95 transition-colors duration-200"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-3">
          {/* Logo & Income Target */}
          <div id="brand-header-section" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900 transition-colors">
              <Target className="h-5 w-5" />
            </div>
            <div className="hidden sm:block min-w-0">
              <h1 className="text-sm sm:text-base lg:text-lg font-semibold tracking-tight text-slate-900 dark:text-white truncate">
                4-Month Income Plan
              </h1>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                ₹20L Goal by Dec 31
              </p>
            </div>
          </div>

          {/* Sync Status, PWA Install, Google Auth & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Sync Badge */}
            <span
              id="sync-status-indicator"
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                syncState === 'syncing'
                  ? 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                  : syncState === 'synced'
                  ? 'bg-emerald-50 border-emerald-200/70 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300'
                  : syncState === 'error'
                  ? 'bg-rose-50 border-rose-200/70 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800/60 dark:text-rose-300'
                  : 'bg-slate-50 border-slate-200/80 text-slate-600 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400'
              }`}
            >
              {syncState === 'syncing' && (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin text-slate-500" />
                  <span>Syncing...</span>
                </>
              )}
              {syncState === 'synced' && (
                <>
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Synced</span>
                </>
              )}
              {syncState === 'error' && (
                <>
                  <AlertCircle className="h-3 w-3 text-rose-600" />
                  <span>Sync Error</span>
                </>
              )}
              {syncState === 'idle' && (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>Sync Ready</span>
                </>
              )}
            </span>

            {/* In-App PWA Install Button */}
            <PWAInstallButton variant="header" />

            {/* Google Sheets / Drive Sync Button */}
            <button
              id="open-sheet-modal-btn"
              onClick={onOpenSyncModal}
              className="flex min-h-[38px] items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 bg-white px-3 sm:px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-200 dark:hover:bg-slate-800 shadow-sm transition"
              title={sheetName ? `Linked: ${sheetName}` : 'Configure Google Drive & Sheet sync'}
            >
              <Sheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="hidden sm:inline font-medium">
                {sheetName ? 'Sheet Active' : 'Sheets Sync'}
              </span>
            </button>

            {/* Google Authentication Control */}
            {user ? (
              <div id="user-profile-badge" className="flex items-center gap-1.5 sm:gap-2 pl-0.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google Account'}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 font-medium text-xs text-white dark:bg-white dark:text-slate-900">
                    {user.displayName ? user.displayName[0].toUpperCase() : 'G'}
                  </div>
                )}
                <button
                  id="signout-button"
                  onClick={onSignOut}
                  title={`Signed in as ${user.email}. Click to sign out.`}
                  className="rounded-full p-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                id="google-signin-btn"
                onClick={onGoogleSignIn}
                className="flex min-h-[38px] items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 bg-white px-3 sm:px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-200 dark:hover:bg-slate-800 transition"
                title="Sign in with Google to enable direct Drive & Sheet sync"
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span className="hidden sm:inline">Google Sign In</span>
              </button>
            )}

            {/* Dark / Light Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              className="rounded-full p-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
