import 'react-native-gesture-handler';   // должно быть первой строкой
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useStore } from './src/store/useStore';
import { useTheme } from './src/hooks/useTheme';

export default function App() {
  const { mode } = useTheme();
  const setTheme = useStore((s) => s.setTheme);

  useEffect(() => { setTheme(mode); }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((r) => {
      const taskId = r.notification.request.content.data?.taskId;
      console.log('Notification tapped for task', taskId);
    });
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}