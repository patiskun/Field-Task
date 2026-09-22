import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { EmptyState } from '../components/EmptyState';

export const HistoryScreen = () => {
  const history = useStore((s) => s.history);
  const tasks = useStore((s) => s.tasks);
  const { colors } = useTheme();

  const titleById = (id: string) => tasks.find((t) => t.id === id)?.title ?? '(deleted)';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {history.length === 0 ? (
        <EmptyState title="No history yet" subtitle="Actions on tasks will appear here" />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(h) => h.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <View style={[s.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{item.action}</Text>
              <Text style={{ color: colors.text }}>{item.description}</Text>
              <Text style={{ color: colors.subtext, fontSize: 12 }}>
                Task: {titleById(item.taskId)} · {new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const s = StyleSheet.create({
  row: { padding: 12, borderRadius: 10, borderWidth: 1, gap: 4 },
});