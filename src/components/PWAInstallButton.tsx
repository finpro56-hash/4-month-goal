import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, CheckCircle2, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'mobile-bar';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        await install();
      } finally {
        setIsInstalling(false);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // If neither Chromium prompt ready nor iOS, but user is on mobile/desktop, we can still provide a helpful install trigger
  const canShow = isInstallable || isIOS;

  if (!canShow) {
    return null;
  }

  return (
    <>
      <button
        id="pwa-install-app-btn"
        onClick={handleInstallClick}
        disabled={isInstalling}
        title="Install Progressive Web App"
        className={`inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-semibold shadow-sm transition-all active:scale-95 ${
          variant === 'banner'
            ? 'w-full bg-slate-900 py-2.5 px-4 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
            : variant === 'mobile-bar'
            ? 'bg-slate-900 px-3.5 py-1.5 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900'
            : 'border border-slate-200 bg-white px-3 py-1.5 text-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-200 dark:hover:bg-slate-800'
        }`}
      >
        <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
        <span>{isInstalling ? 'Installing...' : 'Install App'}</span>
      </button>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div
          id="ios-pwa-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in"
        >
          <div
            id="ios-pwa-modal-card"
            className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#111827] transition-colors"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <Download className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Install on iPhone / iPad</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Save to your home screen</p>
                </div>
              </div>
              <button
                id="close-ios-guide-btn"
                onClick={() => setShowIOSGuide(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  <Share className="h-3.5 w-3.5" />
                </div>
                <p className="pt-0.5 leading-relaxed">
                  1. Tap the <strong className="text-slate-900 dark:text-white">Share</strong> button in your Safari navigation bar.
                </p>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <PlusSquare className="h-3.5 w-3.5" />
                </div>
                <p className="pt-0.5 leading-relaxed">
                  2. Scroll down the actions list and tap <strong className="text-slate-900 dark:text-white">Add to Home Screen</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <p className="pt-0.5 leading-relaxed">
                  3. Confirm by tapping <strong className="text-slate-900 dark:text-white">Add</strong> in the top-right corner.
                </p>
              </div>
            </div>

            <button
              id="dismiss-ios-guide-btn"
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-full bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
