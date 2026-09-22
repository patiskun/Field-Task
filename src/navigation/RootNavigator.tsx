import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import type { Task } from '../types';
import { TaskListScreen } from '../screens/TaskListScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { TaskEditScreen } from '../screens/TaskEditScreen';
import { MapScreen } from '../screens/MapScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useTheme } from '../hooks/useTheme';

export type RootStackParamList = {
  Tabs: undefined;
  TaskDetail: { taskId: string };
  TaskEdit: { taskId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const icon = (label: string) => ({ color }: { color: string }) => (
  <Text style={{ color, fontSize: 18 }}>{label}</Text>
);

function Tabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { color: colors.text },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
      }}
    >
      <Tab.Screen name="Tasks" component={TaskListScreen} options={{ tabBarIcon: icon('📋') }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ tabBarIcon: icon('🗺️') }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarIcon: icon('🕘') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon: icon('⚙️') }} />
    </Tab.Navigator>
  );
}

export const RootNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: true }}>
    <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
    <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task' }} />
    <Stack.Screen name="TaskEdit" component={TaskEditScreen} options={{ title: 'Edit task' }} />
  </Stack.Navigator>
);