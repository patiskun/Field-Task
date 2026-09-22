import React, { useMemo, useState } from 'react';
import { View, FlatList, TextInput, Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { TaskCard } from '../components/TaskCard';
import { EmptyState } from '../components/EmptyState';
import { useTheme } from '../hooks/useTheme';
import { runSync } from '../services/syncService';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { TaskStatus } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type SortKey = 'created' | 'due' | 'status';

export const TaskListScreen = () => {
  const nav = useNavigation<Nav>();
  const tasks = useStore((s) => s.tasks);
  const lastSyncAt = useStore((s) => s.lastSyncAt);
  const { colors } = useTheme();

  const [sort, setSort] = useState<SortKey>('created');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [syncing, setSyncing] = useState(false);

  const visible = useMemo(() => {
    let list = [...tasks];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') list = list.filter((t) => t.status === statusFilter);
    list.sort((a, b) => {
      if (sort === 'due') return a.dueAt - b.dueAt;
      if (sort === 'status') return a.status.localeCompare(b.status);
      return b.createdAt - a.createdAt;
    });
    return list;
  }, [tasks, sort, query, statusFilter]);

  const onSync = async () => {
    setSyncing(true);
    try { await runSync(); } finally { setSyncing(false); }
  };

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={s.toolbar}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search title / description"
          placeholderTextColor={colors.subtext}
          style={[s.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
        />
        <Pressable
          onPress={onSync}
          disabled={syncing}
          style={[s.syncBtn, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
        >
          {syncing ? <ActivityIndicator color="#fff" /> : <Text style={s.syncTxt}>Sync</Text>}
        </Pressable>
      </View>

      <View style={s.chipsRow}>
        {(['created', 'due', 'status'] as SortKey[]).map((k) => (
          <Chip key={k} label={`Sort: ${k}`} active={sort === k} onPress={() => setSort(k)} />
        ))}
      </View>
      <View style={s.chipsRow}>
        {(['all', 'new', 'in_progress', 'completed', 'cancelled'] as const).map((k) => (
          <Chip key={k} label={k} active={statusFilter === k} onPress={() => setStatusFilter(k)} />
        ))}
      </View>

      <FlatList
        data={visible}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <EmptyState
            title="No tasks yet"
            subtitle="Tap + to create your first task"
          />
        }
        renderItem={({ item }) => (
          <TaskCard task={item} onPress={() => nav.navigate('TaskDetail', { taskId: item.id })} />
        )}
      />

      <Pressable
        onPress={() => nav.navigate('TaskEdit', {})}
        style={[s.fab, { backgroundColor: colors.primary }]}
        accessibilityRole="button"
        accessibilityLabel="Create task"
      >
        <Text style={s.fabTxt}>+</Text>
      </Pressable>

      {lastSyncAt && (
        <Text style={[s.lastSync, { color: colors.subtext }]}>
          Last sync: {new Date(lastSyncAt).toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
};

const Chip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, {
        backgroundColor: active ? colors.primary : colors.card,
        borderColor: colors.border,
      }]}
    >
      <Text style={{ color: active ? '#fff' : colors.text, fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
};

const s = StyleSheet.create({
  root: { flex: 1 },
  toolbar: { flexDirection: 'row', gap: 8, padding: 12 },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  syncBtn: { paddingHorizontal: 14, justifyContent: 'center', borderRadius: 10 },
  syncTxt: { color: '#fff', fontWeight: '600' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 12, marginBottom: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  fab: {
    position: 'absolute', right: 20, bottom: 28,
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
  },
  fabTxt: { color: '#fff', fontSize: 28, lineHeight: 30 },
  lastSync: { position: 'absolute', left: 0, right: 0, bottom: 4, textAlign: 'center', fontSize: 11 },
});