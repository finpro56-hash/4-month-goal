import { useState } from 'react';
import {
  X,
  Sheet,
  Copy,
  Check,
  ExternalLink,
  PlusCircle,
  FolderOpen,
  UploadCloud,
  DownloadCloud,
  Code,
  ShieldCheck,
  AlertCircle,
  HardDrive,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { DriveSpreadsheet } from '../types';

interface GoogleSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onGoogleSignIn: () => void;
  // Direct Sheets State & Actions
  activeSpreadsheet: DriveSpreadsheet | null;
  driveSpreadsheets: DriveSpreadsheet[];
  isLoadingDrive: boolean;
  onRefreshDriveSheets: () => void;
  onSelectDriveSheet: (sheet: DriveSpreadsheet) => void;
  onCreateNewSheet: () => void;
  onExportAllToSheet: () => void;
  onImportFromSheet: () => void;
  // Apps Script Webhook State & Actions
  appsScriptUrl: string;
  onSaveAppsScriptUrl: (url: string) => void;
}

export const GoogleSyncModal = ({
  isOpen,
  onClose,
  user,
  onGoogleSignIn,
  activeSpreadsheet,
  driveSpreadsheets,
  isLoadingDrive,
  onRefreshDriveSheets,
  onSelectDriveSheet,
  onCreateNewSheet,
  onExportAllToSheet,
  onImportFromSheet,
  appsScriptUrl,
  onSaveAppsScriptUrl,
}: GoogleSyncModalProps) => {
  const [activeTab, setActiveTab] = useState<'drive' | 'webhook'>('drive');
  const [scriptUrlInput, setScriptUrlInput] = useState(appsScriptUrl);
  const [copied, setCopied] = useState(false);
  const [customSheetId, setCustomSheetId] = useState('');
  const [showDrivePicker, setShowDrivePicker] = useState(false);

  if (!isOpen) return null;

  const scriptSnippet = `function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : "";
    var data = contents ? JSON.parse(contents) : e.parameter;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Daily Tasks") || ss.getSheets()[0];
    
    // getDisplayValues gets formatted cell text instead of Date objects
    var rows = sheet.getDataRange().getDisplayValues();
    var updated = false;
    
    for (var i = 1; i < rows.length; i++) {
      var dateInSheet = String(rows[i][0]).trim();
      var targetDate = String(data.date).trim();
      
      if (dateInSheet && targetDate && (dateInSheet === targetDate || dateInSheet.indexOf(targetDate) !== -1 || targetDate.indexOf(dateInSheet) !== -1)) {
        sheet.getRange(i + 1, 8).setValue(data.done ? "x" : ""); // Column H (8) = Done
        updated = true;
        break;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: updated ? "success" : "not_found" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Google Apps Script Web App is active.");
}`;

  const handleCopyScript = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(scriptSnippet).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = scriptSnippet;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Copy fallback failed', err);
      }
      document.body.removeChild(textarea);
    }
  };

  const handleSaveWebhook = () => {
    onSaveAppsScriptUrl(scriptUrlInput.trim());
  };

  const handleLinkCustomSheet = () => {
    if (!customSheetId.trim()) return;
    // Extract ID if full URL pasted
    let id = customSheetId.trim();
    const match = id.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      id = match[1];
    }
    onSelectDriveSheet({
      id,
      name: 'Custom Linked Google Sheet',
      webViewLink: `https://docs.google.com/spreadsheets/d/${id}/edit`,
    });
    setCustomSheetId('');
  };

  return (
    <div
      id="sheetsModal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-[#111827] custom-scrollbar transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm transition-colors">
              <Sheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                Google Sheets &amp; Drive Sync
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Keep your roadmap, progress, and tasks in sync with Google Workspace
              </p>
            </div>
          </div>
          <button
            id="closeSheetModalBtn"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-100 bg-[#F8FAFC]/80 px-6 dark:border-slate-800 dark:bg-slate-900/50 text-xs font-medium">
          <button
            onClick={() => setActiveTab('drive')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition ${
              activeTab === 'drive'
                ? 'border-slate-900 text-slate-900 font-semibold dark:border-white dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <HardDrive className="h-4 w-4" />
            <span>Google Drive Direct Integration (OAuth)</span>
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition ${
              activeTab === 'webhook'
                ? 'border-slate-900 text-slate-900 font-semibold dark:border-white dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Code className="h-4 w-4" />
            <span>Apps Script Webhook</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === 'drive' ? (
            /* Direct Google Drive & Sheets Integration */
            <div className="space-y-5">
              {/* Account Status */}
              {!user ? (
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
                  <div className="flex items-start gap-3.5">
                    <div className="rounded-xl bg-slate-200 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <ShieldCheck className="h-5 w-5 shrink-0" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Sign in to access Google Drive &amp; Sheets
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Connect with your Google account to create, read, and update your Income Plan
                        spreadsheets directly in Google Drive without writing scripts.
                      </p>
                      <button
                        onClick={onGoogleSignIn}
                        className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition"
                      >
                        Sign in with Google
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                  <div className="flex items-center gap-3">
                    {user.photoURL && (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                      />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        Connected: {user.displayName || user.email}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Google Drive &amp; Sheets permissions granted
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300">
                    Active
                  </span>
                </div>
              )}

              {/* Active Linked Sheet Card */}
              <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC]/80 p-5 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                    Linked Google Spreadsheet
                  </span>
                  {activeSpreadsheet?.webViewLink && (
                    <a
                      href={activeSpreadsheet.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                      <span>Open in Sheets</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                {activeSpreadsheet ? (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      {activeSpreadsheet.name}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                      ID: {activeSpreadsheet.id}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    No spreadsheet connected yet. Create a new one in Drive or select an existing one below.
                  </p>
                )}

                {/* Direct Actions: Push and Pull */}
                {activeSpreadsheet && (
                  <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                    <button
                      onClick={onExportAllToSheet}
                      disabled={!user}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 disabled:opacity-50 transition"
                    >
                      <UploadCloud className="h-3.5 w-3.5" />
                      <span>Sync All 117 Tasks to Sheet</span>
                    </button>

                    <button
                      onClick={onImportFromSheet}
                      disabled={!user}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50 transition"
                    >
                      <DownloadCloud className="h-3.5 w-3.5" />
                      <span>Pull Statuses from Sheet</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Drive Actions: Create new sheet or pick from Google Drive */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  Google Drive Actions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={onCreateNewSheet}
                    disabled={!user}
                    className="flex flex-col items-start gap-1 rounded-2xl border border-slate-100 bg-white p-4 text-left hover:border-slate-300 dark:border-slate-800 dark:bg-[#111827] dark:hover:border-slate-700 disabled:opacity-50 transition shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                      <PlusCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Create New Sheet in Drive</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Generates "4-Month Income Plan - Daily Tasks &amp; Roadmap" in your Drive with formatted columns.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setShowDrivePicker(!showDrivePicker);
                      if (!showDrivePicker) onRefreshDriveSheets();
                    }}
                    disabled={!user}
                    className="flex flex-col items-start gap-1 rounded-2xl border border-slate-100 bg-white p-4 text-left hover:border-slate-300 dark:border-slate-800 dark:bg-[#111827] dark:hover:border-slate-700 disabled:opacity-50 transition shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                      <FolderOpen className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                      <span>Choose Existing from Drive</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Browse and link spreadsheets already in your Google Drive.
                    </p>
                  </button>
                </div>

                {/* Drive File Picker List */}
                {showDrivePicker && (
                  <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 dark:border-slate-800 dark:bg-slate-900/60 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-slate-800">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Spreadsheets in your Google Drive:
                      </span>
                      <button
                        onClick={onRefreshDriveSheets}
                        disabled={isLoadingDrive}
                        className="text-[11px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium transition"
                      >
                        {isLoadingDrive ? 'Loading...' : 'Refresh list'}
                      </button>
                    </div>

                    {driveSpreadsheets.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3 text-center">
                        {isLoadingDrive
                          ? 'Fetching spreadsheets from Google Drive...'
                          : 'No spreadsheets found in Drive. Create a new one above!'}
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {driveSpreadsheets.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between rounded-xl bg-white p-2.5 text-xs hover:bg-slate-50 dark:bg-[#111827] dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition"
                          >
                            <div className="truncate pr-2">
                              <p className="font-medium text-slate-900 dark:text-white truncate">
                                {s.name}
                              </p>
                              <p className="font-mono text-[10px] text-slate-400">ID: {s.id}</p>
                            </div>
                            <button
                              onClick={() => {
                                onSelectDriveSheet(s);
                                setShowDrivePicker(false);
                              }}
                              className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition"
                            >
                              Select
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Or paste Spreadsheet ID / URL */}
                <div className="pt-2">
                  <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Or paste Spreadsheet URL or ID directly:
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      type="text"
                      placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                      value={customSheetId}
                      onChange={(e) => setCustomSheetId(e.target.value)}
                      className="flex-1 rounded-full border border-slate-200/80 bg-white px-4 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-none focus:border-slate-400 transition"
                    />
                    <button
                      onClick={handleLinkCustomSheet}
                      className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition"
                    >
                      Link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Webhook / Apps Script Mode */
            <div className="space-y-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                If you prefer using a Google Apps Script Webhook URL to update your sheet automatically whenever you check off a task, enter your deployed Web App URL below:
              </p>

              {/* Web App URL Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Google Apps Script Web App URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="scriptUrlInput"
                    value={scriptUrlInput}
                    onChange={(e) => setScriptUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 rounded-full border border-slate-200/80 bg-white px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition"
                  />
                  <button
                    onClick={handleSaveWebhook}
                    className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition"
                  >
                    Save URL
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Enter your deployed Google Apps Script URL here to sync on checkbox toggles.
                </p>
              </div>

              {/* Instructions */}
              <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                  <Code className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                  How to get your Web App URL (3 easy steps):
                </h4>
                <ol className="list-decimal space-y-1.5 pl-5 text-xs text-slate-500 dark:text-slate-400">
                  <li>
                    Open your Google Sheet <strong className="text-slate-800 dark:text-slate-200">"4-Month-Income-Plan"</strong> and click <strong>Extensions &gt; Apps Script</strong>.
                  </li>
                  <li>Replace all existing code in Apps Script with the code below and save:</li>
                </ol>

                <div className="relative rounded-xl bg-slate-900 p-4 text-xs font-mono text-slate-200 overflow-x-auto border border-slate-800">
                  <button
                    id="copyScriptBtn"
                    onClick={handleCopyScript}
                    className="absolute top-2.5 right-2.5 rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
                  >
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                  <pre id="scriptCode" className="text-[11px] leading-relaxed">
                    {scriptSnippet}
                  </pre>
                </div>

                <ol start={3} className="list-decimal space-y-1 pl-5 text-xs text-slate-500 dark:text-slate-400">
                  <li>
                    Click <strong>Deploy &gt; New deployment</strong> &rarr; Select type <strong>Web app</strong>.
                  </li>
                  <li>
                    Set <strong>"Execute as"</strong> to <strong>Me</strong> and <strong>"Who has access"</strong> to <strong>Anyone</strong>.
                  </li>
                  <li>Click <strong>Deploy</strong>, grant permissions if prompted, copy the Web app URL, and paste it above.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-[#F8FAFC]/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/40 rounded-b-2xl">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            {activeSpreadsheet
              ? `Currently syncing with: ${activeSpreadsheet.name}`
              : appsScriptUrl
              ? 'Webhook configured'
              : 'Local storage active'}
          </span>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
