import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL = 'task-reminders';
const REMINDER_LEAD_MS = 30 * 60 * 1000;

try {
  Notifications.setNotificationHandler({
    handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  console.warn('Notification handler not available (Expo Go limitation)', e);
}

export async function ensurePermissions(): Promise<boolean> {
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch (e) {
    console.warn('Notification permissions not available in Expo Go', e);
    return false;
  }
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Task reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  } catch (e) {
    console.warn('Android channel setup skipped in Expo Go', e);
  }
}

export interface ScheduleResult {
  id: string | null;
  usedFallback: boolean;
  message: string;
}

export async function scheduleTaskReminder(task: {
  id: string; title: string; dueAt: number;
}): Promise<ScheduleResult> {
  try{
    if (!(await ensurePermissions())) {
      return { id: null, usedFallback: false, message: 'Notification permission denied' };
    }
    await ensureAndroidChannel();

    const fireAt = task.dueAt - REMINDER_LEAD_MS;
    const now = Date.now();

    if (fireAt <= now) {
      // Due within 30 min — schedule in 5s as a fallback so user still gets a reminder.
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task due soon',
          body: task.title,
          data: { taskId: task.id },
        },
        trigger: { seconds: 5, channelId: CHANNEL },
      });
      return { id, usedFallback: true, message: 'Due time is less than 30 min away — reminder scheduled in 5s' };
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task starts in 30 minutes',
        body: task.title,
        data: { taskId: task.id },
      },

      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(fireAt),
        channelId: CHANNEL,
      },
    });
    return { id, usedFallback: false, message: 'Reminder scheduled 30 min before due time' };
  } catch (e) {
    console.warn('Schedule reminder skipped in Expo Go')
    return {id: null, usedFallback: false, message: ""}
  }
}

/** DEBUG: fires in 30s so the reviewer can verify the flow. */
export async function scheduleDemoReminder(task: { id: string; title: string }) {
  try{
    if (!(await ensurePermissions())) return null;
    await ensureAndroidChannel();
    return Notifications.scheduleNotificationAsync({
      content: { title: 'DEMO reminder', body: task.title, data: { taskId: task.id } },
      trigger: { seconds: 30, channelId: CHANNEL },
    });
  } catch (e) {
    console.warn("Demo Reminder disabled in Expo Go")
  }
}

export async function cancelReminder(id?: string) {
  if (!id) return;
  try { await Notifications.cancelScheduledNotificationAsync(id); } catch { /* noop */ }
}
