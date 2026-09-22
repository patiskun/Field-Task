import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export const EmptyState = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  const { colors } = useTheme();
  return (
    <View style={s.wrap}>
      <Text style={[s.title, { color: colors.text }]}>{title}</Text>
      {subtitle && <Text style={[s.sub, { color: colors.subtext }]}>{subtitle}</Text>}
    </View>
  );
};

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 6, textAlign: 'center' },
  sub: { fontSize: 14, textAlign: 'center' },
});