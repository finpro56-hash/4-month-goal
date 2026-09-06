import { Task, DriveSpreadsheet } from '../types';

const SHEETS_BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';
const DRIVE_BASE_URL = 'https://www.googleapis.com/drive/v3';

export interface SheetTaskSyncResult {
  updated: boolean;
  rowIndex?: number;
}

/**
 * List existing Google Sheets in the user's Google Drive
 */
export async function listDriveSpreadsheets(accessToken: string): Promise<DriveSpreadsheet[]> {
  try {
    const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
    const res = await fetch(
      `${DRIVE_BASE_URL}/files?q=${query}&pageSize=20&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Drive list error:', errorText);
      throw new Error(`Drive list error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    return (data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
    }));
  } catch (err: any) {
    console.error('Failed to list Drive files:', err);
    throw err;
  }
}

/**
 * Create a brand new Google Spreadsheet in Google Drive
 */
export async function createIncomePlanSpreadsheet(
  accessToken: string,
  title = '4-Month Income Plan - Daily Tasks & Roadmap'
): Promise<DriveSpreadsheet> {
  const res = await fetch(SHEETS_BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Daily Tasks',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create spreadsheet (${res.status}): ${errText}`);
  }

  const sheetData = await res.json();
  const spreadsheetId = sheetData.spreadsheetId;

  return {
    id: spreadsheetId,
    name: title,
    webViewLink: sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

/**
 * Initialize / populate spreadsheet with full tasks roadmap and header styling
 */
export async function populateSpreadsheetWithTasks(
  accessToken: string,
  spreadsheetId: string,
  tasks: Task[]
): Promise<void> {
  const headerRow = [
    'Date',
    'Day',
    'Wk',
    'Phase',
    'Category',
    'Task Description',
    'Time',
    'Done',
    'Target Milestone',
  ];

  const rows = tasks.map((t) => [
    t.date,
    t.day,
    `W${t.week}`,
    t.phase,
    t.category,
    t.task,
    t.time,
    t.done ? 'x' : '',
    '₹20,00,000 Plan',
  ]);

  const allValues = [headerRow, ...rows];

  // Try to write to "Daily Tasks" sheet or fallback to default first sheet
  const range = `'Daily Tasks'!A1:I${allValues.length}`;

  const res = await fetch(
    `${SHEETS_BASE_URL}/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: allValues,
      }),
    }
  );

  if (!res.ok) {
    // If 'Daily Tasks' tab doesn't exist, try Sheet1
    const fallbackRange = `Sheet1!A1:I${allValues.length}`;
    const fallbackRes = await fetch(
      `${SHEETS_BASE_URL}/${spreadsheetId}/values/${encodeURIComponent(fallbackRange)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: fallbackRange,
          majorDimension: 'ROWS',
          values: allValues,
        }),
      }
    );

    if (!fallbackRes.ok) {
      const errText = await fallbackRes.text();
      throw new Error(`Failed to write values to sheet (${fallbackRes.status}): ${errText}`);
    }
  }
}

/**
 * Read task completion statuses from Google Sheet
 */
export async function fetchTaskStatusesFromSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<Record<string, boolean>> {
  // Read first 150 rows
  let values: any[][] = [];

  const rangesToTry = ["'Daily Tasks'!A1:H150", 'Sheet1!A1:H150', 'A1:H150'];
  for (const r of rangesToTry) {
    const res = await fetch(
      `${SHEETS_BASE_URL}/${spreadsheetId}/values/${encodeURIComponent(r)}?majorDimension=ROWS`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data.values && data.values.length > 1) {
        values = data.values;
        break;
      }
    }
  }

  if (values.length <= 1) {
    return {};
  }

  const statusMap: Record<string, boolean> = {};

  // Row 0 is header: Date, Day, Wk, Phase, Category, Task Description, Time, Done
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row || row.length === 0) continue;
    const dateCell = String(row[0] || '').trim();
    const doneCell = String(row[7] || '').trim().toLowerCase();
    if (dateCell) {
      statusMap[dateCell] = doneCell === 'x' || doneCell === 'yes' || doneCell === 'true' || doneCell === 'done' || doneCell === '✓';
    }
  }

  return statusMap;
}

/**
 * Update single task done status in Google Sheet
 */
export async function updateSingleTaskInSheet(
  accessToken: string,
  spreadsheetId: string,
  taskDate: string,
  isDone: boolean,
  allTasks: Task[]
): Promise<boolean> {
  const taskIndex = allTasks.findIndex((t) => t.date === taskDate);
  if (taskIndex === -1) return false;

  const rowIndex = taskIndex + 2; // +1 for 1-based index, +1 for header row
  const cellValue = isDone ? 'x' : '';

  // Try updating cell H{rowIndex}
  const ranges = [`'Daily Tasks'!H${rowIndex}`, `Sheet1!H${rowIndex}`, `H${rowIndex}`];

  for (const r of ranges) {
    const res = await fetch(
      `${SHEETS_BASE_URL}/${spreadsheetId}/values/${encodeURIComponent(r)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: r,
          majorDimension: 'ROWS',
          values: [[cellValue]],
        }),
      }
    );

    if (res.ok) {
      return true;
    }
  }

  return false;
}

/**
 * Optional Apps Script Web App sync (matching original legacy fallback)
 */
export async function syncToAppsScriptWebhook(
  webhookUrl: string,
  taskDate: string,
  isDone: boolean
): Promise<boolean> {
  if (!webhookUrl) return false;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ date: taskDate, done: isDone }),
    });
    return true;
  } catch (e) {
    console.error('Webhook sync failed:', e);
    return false;
  }
}
