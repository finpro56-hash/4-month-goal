import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-badge"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/95 px-4 py-2 text-xs font-medium text-amber-900 shadow-lg backdrop-blur-sm dark:border-amber-900/60 dark:bg-amber-950/90 dark:text-amber-200 animate-fade-in"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
      </span>
      <WifiOff className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
      <span>Offline Mode — Running from cached PWA storage</span>
    </div>
  );
};
