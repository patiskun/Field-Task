import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { EmptyState } from '../components/EmptyState';
import { statusColor } from '../utils/format';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const MapScreen = () => {
  const nav = useNavigation<Nav>();
  const tasks = useStore((s) => s.tasks).filter(
    (t) => t.location.latitude != null && t.location.longitude != null,
  );
  const { colors } = useTheme();

  if (tasks.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <EmptyState
          title="No tasks with coordinates"
          subtitle="Add latitude/longitude on a task to see it on the map"
        />
      </View>
    );
  }

  const initial = {
    latitude: tasks[0].location.latitude!,
    longitude: tasks[0].location.longitude!,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={StyleSheet.absoluteFill} initialRegion={initial}>
        {tasks.map((t) => (
          <Marker
            key={t.id}
            coordinate={{ latitude: t.location.latitude!, longitude: t.location.longitude! }}
            title={t.title}
            description={t.location.address}
            pinColor={statusColor[t.status]}
            onCalloutPress={() => nav.navigate('TaskDetail', { taskId: t.id })}
          />
        ))}
      </MapView>
      <View style={{
        position: 'absolute', top: 12, left: 12, right: 12,
        padding: 10, borderRadius: 10, backgroundColor: colors.card,
      }}>
        <Text style={{ color: colors.text, fontSize: 12 }}>
          {Platform.OS === 'android'
            ? 'Tap a marker then the callout to open the task'
            : 'Tap a pin to open the task'}
        </Text>
      </View>
    </View>
  );
};