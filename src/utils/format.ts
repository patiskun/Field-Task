import { format } from 'date-fns'
import type { TaskStatus } from '../types'

export const fmtDateTime = (ms: number) => format(new Date(ms), 'dd MMM yyyy, HH:mm');

export const statusLabel: Record<TaskStatus, string> = {
  new: 'New',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const statusColor: Record<TaskStatus, string> = {
  new: '#3b82f6',
  in_progress: '#f59e0b',
  completed: '#10b981',
  cancelled: '#ef4444',
};