import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { TaskStatus } from '../types';
import { statusColor, statusLabel } from '../utils/format';

export const StatusBadge = ({ status }: { status: TaskStatus }) => (
  <View style={[s.badge, { backgroundColor: statusColor[status] + '22' }]}>
    <Text style={[s.text, { color: statusColor[status] }]}>{statusLabel[status]}</Text>
  </View>
);

const s = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '600' },
});