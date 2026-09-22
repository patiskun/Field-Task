export type TaskStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';
export type SyncStatus = 'pending' | 'synced' | 'failed';
export type ThemeMode = 'light' | 'dark';

export type HistoryAction =
  | 'created' | 'updated' | 'status_changed'
  | 'attachment_added' | 'attachment_removed'
  | 'deleted' | 'synced' | 'sync_failed';

export interface Attachment {
  id: string;
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

export interface TaskLocation {
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface HistoryEntry {
  id: string;
  taskId: string;
  timestamp: number;
  action: HistoryAction;
  description: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueAt: number;               // ms epoch
  location: TaskLocation;
  attachments: Attachment[];
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
  notificationId?: string;
}

export interface TaskDraft {
  title: string;
  description: string;
  dueAt: number;
  location: TaskLocation;
  attachments: Attachment[];
  status: TaskStatus;
}