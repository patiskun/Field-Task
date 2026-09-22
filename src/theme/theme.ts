import type { ThemeMode } from '../types';

export interface AppTheme {
  mode: ThemeMode,
  colors: {
    bg: string; card: string; text: string; subtext: string;
    border: string; primary: string; danger: string; 
  }
}

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    bg: '#f4f5f7', card: '#ffffff', text: '#111827', subtext: '#6b7280',
    border: '#e5e7eb', primary: '#2563eb', danger: '#dc2626',
  },
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    bg: '#0f172a', card: '#1e293b', text: '#f1f5f9', subtext: '#94a3b8',
    border: '#334155', primary: '#60a5fa', danger: '#f87171',
  },
};

export const getTheme = (m: ThemeMode) => (m === 'dark' ? darkTheme : lightTheme);