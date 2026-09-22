import { useStore } from '../store/useStore';
import type { Task } from '../types';

/**
 * Mock REST server (json-server).
 * Endpoint: PUT /tasks/:id  -> upsert (id provided by client)
 * Conflict strategy: LAST-WRITE-WINS on `updatedAt`.
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3001';
console.log('[sync] BASE_URL =', BASE_URL);

async function pushTask(task: Task): Promise<void> {
  const url = `${BASE_URL}/tasks/${task.id}`;
  console.log('[sync] PUT', url);
  let res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });

  // json-server 0.17.x doesn't upsert on PUT — create via POST if missing
  if (res.status === 404) {
    console.log('[sync] 404, creating via POST');
    res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
  }

  console.log('[sync] response', res.status, res.statusText);
  if (!res.ok) {
    const text = await res.text();
    console.log('[sync] error body', text);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
}

async function pullAll(): Promise<Task[]> {
  console.log('[sync] GET', `${BASE_URL}/tasks`);
  const res = await fetch(`${BASE_URL}/tasks`);
  console.log('[sync] GET response', res.status);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export interface SyncReport {
  pushed: number;
  pulled: number;
  failed: number;
}

export async function runSync(): Promise<SyncReport> {
  const store = useStore.getState();
  const report: SyncReport = { pushed: 0, pulled: 0, failed: 0 };

  // 1) push local pending changes (last-write-wins)
  for (const task of store.tasks) {
    if (task.syncStatus === 'synced') continue;
    try {
      await pushTask(task);
      store.setSyncStatus(task.id, 'synced');
      store.addLog(task.id, 'synced', `Synced to server`);
      report.pushed++;
    } catch (e: any) {
      store.setSyncStatus(task.id, 'failed');
      store.addLog(task.id, 'sync_failed', `Sync failed: ${e.message}`);
      report.failed++;
    }
  }

  // 2) pull remote, merge by updatedAt
  try {
    const remote = await pullAll();
    for (const rTask of remote) {
      const local = useStore.getState().tasks.find((t) => t.id === rTask.id);
      if (!local) {
        // New remote task — adopt as synced
        useStore.setState((s) => ({
          tasks: [{ ...rTask, syncStatus: 'synced' }, ...s.tasks],
        }));
        report.pulled++;
      } else if ((rTask.updatedAt ?? 0) > local.updatedAt) {
        useStore.setState((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === rTask.id ? { ...rTask, syncStatus: 'synced' } : t,
          ),
        }));
        report.pulled++;
      }
    }
  } catch {
    // offline: fine, we'll retry later
  }

  store.setLastSyncAt(Date.now());
  return report;
}