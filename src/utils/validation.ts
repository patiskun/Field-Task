import type { TaskDraft } from '../types';

export interface ValidationErrors {
  title?: string;
  description?: string;
  dueAt?: string;
  location?: string;
}

export function validateTask(d: Partial<TaskDraft>) : ValidationErrors {
  const e: ValidationErrors = {};
  if (!d.title?.trim()) e.title = 'Title is required';
  else if (d.title.trim().length < 3) e.title = 'Title must be at least 3 characters';

  if (!d.description?.trim()) e.description = 'Description is required';

  if (!d.dueAt) e.dueAt = 'Due date is required';
  else if (d.dueAt < Date.now() - 60_000) e.dueAt = 'Due date cannot be in the past';

  if (!d.location?.address?.trim()) e.location = 'Location address is required';

  return e;
}

export const hasErrors = (e: ValidationErrors) => Object.keys(e).length > 0;