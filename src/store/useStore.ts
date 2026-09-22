import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import type {
  Task, HistoryEntry, TaskStatus, Attachment, TaskDraft,
  HistoryAction, ThemeMode, SyncStatus,
} from '../types';

interface State {
  tasks: Task[];
  history: HistoryEntry[];
  theme: ThemeMode;
  lastSyncAt: number | null;

  createTask: (d: TaskDraft) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setStatus: (id: string, status: TaskStatus) => void;
  addAttachment: (taskId: string, a: Attachment) => void;
  removeAttachment: (taskId: string, attId: string) => void;
  setNotificationId: (id: string, notificationId: string | null) => void;
  setSyncStatus: (id: string, s: SyncStatus) => void;
  setLastSyncAt: (ms: number) => void;
  setTheme: (m: ThemeMode) => void;
  addLog: (taskId: string, action: HistoryAction, description: string) => void;
}

const log = (
  taskId: string, action: HistoryAction, description: string,
): HistoryEntry => ({
  id: Crypto.randomUUID(),
  taskId, action, description,
  timestamp: Date.now(),
});

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      tasks: [],
      history: [],
      theme: 'light',
      lastSyncAt: null,

      createTask: (d) => {
        const now = Date.now();
        const task: Task = {
          id: Crypto.randomUUID(),
          ...d,
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending',
        };
        set((s) => ({
          tasks: [task, ...s.tasks],
          history: [log(task.id, 'created', `Task created: "${task.title}"`), ...s.history],
        }));
        return task;
      },

      updateTask: (id, patch) => {
        set((s) => {
          const tasks = s.tasks.map((t) =>
            t.id === id
              ? { ...t, ...patch, updatedAt: Date.now(), syncStatus: 'pending' as SyncStatus }
              : t,
          );
          const changed = Object.keys(patch).join(', ');
          return {
            tasks,
            history: [log(id, 'updated', `Updated fields: ${changed}`), ...s.history],
          };
        });
      },

      deleteTask: (id) => {
        const t = get().tasks.find((x) => x.id === id);
        set((s) => ({
          tasks: s.tasks.filter((x) => x.id !== id),
          history: [
            log(id, 'deleted', `Deleted task: "${t?.title ?? id}"`),
            ...s.history,
          ],
        }));
      },

      setStatus: (id, status) => {
        const prev = get().tasks.find((t) => t.id === id)?.status;
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, status, updatedAt: Date.now(), syncStatus: 'pending' }
              : t,
          ),
          history: [
            log(id, 'status_changed', `Status: ${prev ?? '?'} → ${status}`),
            ...s.history,
          ],
        }));
      },

      addAttachment: (taskId, a) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, attachments: [...t.attachments, a], updatedAt: Date.now(), syncStatus: 'pending' }
              : t,
          ),
          history: [log(taskId, 'attachment_added', `Added attachment: ${a.name}`), ...s.history],
        })),

      removeAttachment: (taskId, attId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, attachments: t.attachments.filter((x) => x.id !== attId), updatedAt: Date.now(), syncStatus: 'pending' }
              : t,
          ),
          history: [log(taskId, 'attachment_removed', `Removed attachment ${attId}`), ...s.history],
        })),

      setNotificationId: (id, notificationId) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, notificationId: notificationId ?? undefined } : t)),
        })),

      setSyncStatus: (id, syncStatus) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, syncStatus } : t)) })),

      setLastSyncAt: (ms) => set({ lastSyncAt: ms }),
      setTheme: (m) => set({ theme: m }),

      addLog: (taskId, action, description) =>
        set((s) => ({ history: [log(taskId, action, description), ...s.history] })),
    }),
    {
      name: 'field-tasks-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);