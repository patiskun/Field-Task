import React from 'react';
import { Text, StyleSheet } from 'react-native';
import type { SyncStatus } from '../types';

const map: Record<SyncStatus, { label: string; color: string }> = {
  pending: { label: '⏳ Pending sync', color: '#f59e0b' },
  synced:  { label: '✅ Synced',        color: '#10b981' },
  failed:  { label: '⚠️ Sync failed',   color: '#ef4444' },
};

export const SyncBadge = ({ status }: { status: SyncStatus }) => {
  const { label, color } = map[status];
  return <Text style={[s.t, { color }]}>{label}</Text>;
};

const s = StyleSheet.create({ t: { fontSize: 12, fontWeight: '600' } });