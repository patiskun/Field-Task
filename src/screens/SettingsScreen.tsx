import React from 'react';
import { View, Text, Switch, Pressable, StyleSheet, Alert } from 'react-native';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { runSync } from '../services/syncService';

export const SettingsScreen = () => {
  const mode = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const tasks = useStore((s) => s.tasks);
  const history = useStore((s) => s.history);
  const lastSyncAt = useStore((s) => s.lastSyncAt);
  const { colors } = useTheme();

  const onSync = async () => {
    try {
      const r = await runSync();
      Alert.alert('Sync complete', `Pushed ${r.pushed}, pulled ${r.pulled}, failed ${r.failed}`);
    } catch (e: any) {
      Alert.alert('Sync failed', e.message ?? 'Network error');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16, gap: 16 }}>
      <Row label="Dark theme" colors={colors}>
        <Switch
          value={mode === 'dark'}
          onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
        />
      </Row>

      <Row label="Total tasks" colors={colors}>
        <Text style={{ color: colors.text }}>{tasks.length}</Text>
      </Row>
      <Row label="History entries" colors={colors}>
        <Text style={{ color: colors.text }}>{history.length}</Text>
      </Row>
      <Row label="Last sync" colors={colors}>
        <Text style={{ color: colors.text }}>
          {lastSyncAt ? new Date(lastSyncAt).toLocaleString() : 'never'}
        </Text>
      </Row>

      <Pressable
        onPress={onSync}
        style={{ backgroundColor: colors.primary, padding: 14, borderRadius: 12 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>Sync now</Text>
      </Pressable>

      <View style={{ flex: 1 }} />
      <Text style={{ color: colors.subtext, textAlign: 'center', fontSize: 12 }}>
        Candidate code: SA-RN-7431
      </Text>
    </View>
  );
};

const Row = ({ label, children, colors }: any) => (
  <View style={{
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, borderRadius: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  }}>
    <Text style={{ color: colors.text }}>{label}</Text>
    {children}
  </View>
);