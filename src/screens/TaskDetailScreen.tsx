import React, { useMemo } from 'react';
import { ScrollView, View, Text, Image, Pressable, StyleSheet, Alert, Linking } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { StatusBadge } from '../components/StatusBadge';
import { SyncBadge } from '../components/SyncBadge';
import { fmtDateTime, statusLabel } from '../utils/format';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { TaskStatus } from '../types';
import { cancelReminder } from '../services/notificationService';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'TaskDetail'>;

export const TaskDetailScreen = () => {
  const nav = useNavigation<Nav>();
  const { taskId } = useRoute<Rt>().params;
  const task = useStore((s) => s.tasks.find((t) => t.id === taskId));
  const allHistory = useStore((s) => s.history);   // стабильная ссылка на массив
  const history = useMemo(
    () => allHistory.filter((h) => h.taskId === taskId),
    [allHistory, taskId],
  );
  const setStatus = useStore((s) => s.setStatus);
  const deleteTask = useStore((s) => s.deleteTask);
  const { colors } = useTheme();

  if (!task) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <Text style={{ color: colors.text }}>Task not found (deleted?)</Text>
      </View>
    );
  }

  const onDelete = () => {
    Alert.alert('Delete task?', 'This cannot be undone', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await cancelReminder(task.notificationId);
          deleteTask(task.id);
          nav.goBack();
        },
      },
    ]);
  };

  const change = (s: TaskStatus) => setStatus(task.id, s);

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700' }}>{task.title}</Text>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <StatusBadge status={task.status} />
        <SyncBadge status={task.syncStatus} />
      </View>
      <Text style={{ color: colors.text }}>{task.description}</Text>

      <InfoRow label="Due" value={fmtDateTime(task.dueAt)} colors={colors} />
      <InfoRow label="Address" value={task.location.address} colors={colors} />
      {(task.location.latitude != null && task.location.longitude != null) && (
        <InfoRow
          label="Coordinates"
          value={`${task.location.latitude}, ${task.location.longitude}`}
          colors={colors}
        />
      )}

      <Text style={{ color: colors.text, fontWeight: '700', marginTop: 8 }}>Status</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {(['in_progress', 'completed', 'cancelled', 'new'] as TaskStatus[]).map((s) => (
          <Pressable
            key={s}
            onPress={() => change(s)}
            style={{
              paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
              backgroundColor: task.status === s ? colors.primary : colors.card,
              borderColor: colors.border, borderWidth: 1,
            }}
          >
            <Text style={{ color: task.status === s ? '#fff' : colors.text }}>{statusLabel[s]}</Text>
          </Pressable>
        ))}
      </View>

      {task.attachments.length > 0 && (
        <>
          <Text style={{ color: colors.text, fontWeight: '700', marginTop: 8 }}>Attachments</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {task.attachments.map((a) => (
              <Pressable
                key={a.id}
                onLongPress={() => Linking.openURL(a.uri).catch(() => {})}
                style={{
                  width: 100, height: 100, borderRadius: 10,
                  borderWidth: 1, borderColor: colors.border,
                  alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}
              >
                <Image
                  source={{ uri: a.uri }}
                  style={{ width: '100%', height: '100%' }}
                  onError={() => {}}
                />
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Text style={{ color: colors.text, fontWeight: '700', marginTop: 12 }}>History</Text>
      {history.length === 0 && <Text style={{ color: colors.subtext }}>No history yet</Text>}
      {history.map((h) => (
        <View key={h.id} style={{ borderLeftWidth: 2, borderLeftColor: colors.border, paddingLeft: 10 }}>
          <Text style={{ color: colors.text, fontSize: 13 }}>{h.description}</Text>
          <Text style={{ color: colors.subtext, fontSize: 11 }}>{new Date(h.timestamp).toLocaleString()}</Text>
        </View>
      ))}

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
        <Pressable
          onPress={() => nav.navigate('TaskEdit', { taskId: task.id })}
          style={{ flex: 1, backgroundColor: colors.primary, padding: 14, borderRadius: 12 }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>Edit</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={{ flex: 1, backgroundColor: colors.danger, padding: 14, borderRadius: 12 }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>Delete</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ label, value, colors }: any) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
    <Text style={{ color: colors.subtext }}>{label}</Text>
    <Text style={{ color: colors.text, flexShrink: 1, textAlign: 'right' }}>{value}</Text>
  </View>
);