import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import type { Task } from '../types';
import { StatusBadge } from './StatusBadge';
import { SyncBadge } from './SyncBadge';
import { fmtDateTime } from '../utils/format';
import { useTheme } from '../hooks/useTheme';

export const TaskCard = ({ task, onPress }: { task: Task; onPress: () => void }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={s.row}>
        <Text style={[s.title, { color: colors.text }]} numberOfLines={1}>{task.title}</Text>
        <StatusBadge status={task.status} />
      </View>
      <Text style={[s.meta, { color: colors.subtext }]} numberOfLines={1}>
        📍 {task.location.address}
      </Text>
      <Text style={[s.meta, { color: colors.subtext }]}>🕒 {fmtDateTime(task.dueAt)}</Text>
      <View style={s.row}>
        <SyncBadge status={task.syncStatus} />
        {task.attachments.length > 0 && (
          <Text style={[s.meta, { color: colors.subtext }]}>📎 {task.attachments.length}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  card: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10, gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  meta: { fontSize: 13 },
});