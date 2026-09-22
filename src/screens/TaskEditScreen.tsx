import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable, StyleSheet,
  Image, Alert, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Crypto from 'expo-crypto';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { validateTask, hasErrors, ValidationErrors } from '../utils/validation';
import { pickImage } from '../services/attachmentService';
import { scheduleTaskReminder, scheduleDemoReminder, cancelReminder } from '../services/notificationService';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { Attachment, TaskStatus } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'TaskEdit'>;

const STATUS_OPTIONS: TaskStatus[] = ['new', 'in_progress', 'completed', 'cancelled'];

export const TaskEditScreen = () => {
  const nav = useNavigation<Nav>();
  const { taskId } = useRoute<Rt>().params ?? {};
  const existing = useStore((s) => s.tasks.find((t) => t.id === taskId));
  const { colors } = useTheme();
  const createTask = useStore((s) => s.createTask);
  const updateTask = useStore((s) => s.updateTask);
  const addAttachment = useStore((s) => s.addAttachment);
  const removeAttachment = useStore((s) => s.removeAttachment);
  const setNotificationId = useStore((s) => s.setNotificationId);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [dueAt, setDueAt] = useState<number>(existing?.dueAt ?? Date.now() + 60 * 60 * 1000);
  const [address, setAddress] = useState(existing?.location.address ?? '');
  const [lat, setLat] = useState<string>(existing?.location.latitude?.toString() ?? '');
  const [lng, setLng] = useState<string>(existing?.location.longitude?.toString() ?? '');
  const [status, setStatus] = useState<TaskStatus>(existing?.status ?? 'new');
  const [attachments, setAttachments] = useState<Attachment[]>(existing?.attachments ?? []);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const onPickImage = async () => {
    try {
      const a = await pickImage();
      if (a) setAttachments((prev) => [...prev, a]);
    } catch (e: any) {
      Alert.alert('Attachment error', e.message ?? 'Failed to pick image');
    }
  };

  const onSave = async () => {
    const payload = {
      title: title.trim(),
      description: description.trim(),
      dueAt,
      location: {
        address: address.trim(),
        latitude: lat ? parseFloat(lat) : undefined,
        longitude: lng ? parseFloat(lng) : undefined,
      },
      attachments,
      status,
    };
    const e = validateTask(payload);
    setErrors(e);
    if (hasErrors(e)) {
      Alert.alert('Fix the errors', 'Please correct the highlighted fields');
      return;
    }

    if (existing) {
      updateTask(existing.id, payload);
      await cancelReminder(existing.notificationId);
      const res = await scheduleTaskReminder({ id: existing.id, title: payload.title, dueAt });
      setNotificationId(existing.id, res.id);
      if (res.usedFallback) Alert.alert('Heads up', res.message);
    } else {
      const created = createTask(payload);
      for (const a of attachments) {
        // attachments already in payload on create; ensure store consistency
      }
      const res = await scheduleTaskReminder({ id: created.id, title: created.title, dueAt });
      setNotificationId(created.id, res.id);
      if (res.usedFallback) Alert.alert('Heads up', res.message);
    }
    nav.goBack();
  };

  const onDemoReminder = async () => {
    if (!existing && !title) { Alert.alert('Nothing to demo'); return; }
    await scheduleDemoReminder({ id: existing?.id ?? 'demo', title: title || 'Demo task' });
    Alert.alert('Demo reminder scheduled', 'You will get a push in ~30 seconds');
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Field label="Title *" error={errors.title} colors={colors}>
        <TextInput
          value={title} onChangeText={setTitle}
          placeholder="e.g. Install router at client site"
          placeholderTextColor={colors.subtext}
          style={[inputStyle(colors), { color: colors.text }]}
        />
      </Field>

      <Field label="Description *" error={errors.description} colors={colors}>
        <TextInput
          value={description} onChangeText={setDescription}
          placeholder="What exactly needs to be done"
          placeholderTextColor={colors.subtext}
          multiline numberOfLines={4}
          style={[inputStyle(colors), { color: colors.text, minHeight: 90, textAlignVertical: 'top' }]}
        />
      </Field>

      <Field label="Due date & time *" error={errors.dueAt} colors={colors}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={() => setShowDate(true)} style={[inputStyle(colors), { flex: 1 }]}>
            <Text style={{ color: colors.text }}>{new Date(dueAt).toLocaleDateString()}</Text>
          </Pressable>
          <Pressable onPress={() => setShowTime(true)} style={[inputStyle(colors), { flex: 1 }]}>
            <Text style={{ color: colors.text }}>{new Date(dueAt).toLocaleTimeString().slice(0, 5)}</Text>
          </Pressable>
        </View>
        {(showDate || showTime) && (
          <DateTimePicker
            value={new Date(dueAt)}
            mode={showDate ? 'date' : 'time'}
            onChange={(_, d) => {
              setShowDate(false); setShowTime(false);
              if (d) setDueAt(d.getTime());
            }}
          />
        )}
      </Field>

      <Field label="Location address *" error={errors.location} colors={colors}>
        <TextInput
          value={address} onChangeText={setAddress}
          placeholder="Street, city"
          placeholderTextColor={colors.subtext}
          style={[inputStyle(colors), { color: colors.text }]}
        />
      </Field>

      <Field label="Coordinates (optional)" colors={colors}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={lat} onChangeText={setLat} placeholder="Lat"
            placeholderTextColor={colors.subtext} keyboardType="numeric"
            style={[inputStyle(colors), { flex: 1, color: colors.text }]}
          />
          <TextInput
            value={lng} onChangeText={setLng} placeholder="Lng"
            placeholderTextColor={colors.subtext} keyboardType="numeric"
            style={[inputStyle(colors), { flex: 1, color: colors.text }]}
          />
        </View>
      </Field>

      <Field label="Status" colors={colors}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {STATUS_OPTIONS.map((s) => (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              style={[inputStyle(colors), {
                backgroundColor: status === s ? colors.primary : colors.card,
              }]}
            >
              <Text style={{ color: status === s ? '#fff' : colors.text }}>{s}</Text>
            </Pressable>
          ))}
        </View>
      </Field>

      <Field label="Attachments" colors={colors}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {attachments.map((a) => (
            <View key={a.id} style={{ position: 'relative' }}>
              <Image source={{ uri: a.uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
              <Pressable
                onPress={() => setAttachments((prev) => prev.filter((x) => x.id !== a.id))}
                style={{
                  position: 'absolute', top: -6, right: -6, backgroundColor: colors.danger,
                  width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 12 }}>✕</Text>
              </Pressable>
            </View>
          ))}
          <Pressable
            onPress={onPickImage}
            style={[inputStyle(colors), { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }]}
          >
            <Text style={{ color: colors.text, fontSize: 24 }}>＋</Text>
          </Pressable>
        </View>
      </Field>

      <Pressable onPress={onSave} style={{ backgroundColor: colors.primary, padding: 14, borderRadius: 12 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>
          {existing ? 'Save changes' : 'Create task'}
        </Text>
      </Pressable>

      <Pressable onPress={onDemoReminder} style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.subtext, textAlign: 'center' }}>
          🔔 Debug: schedule reminder in 30s
        </Text>
      </Pressable>
    </ScrollView>
  );
};

const Field = ({ label, error, children, colors }: any) => (
  <View style={{ gap: 6 }}>
    <Text style={{ color: colors.text, fontWeight: '600' }}>{label}</Text>
    {children}
    {error && <Text style={{ color: colors.danger, fontSize: 12 }}>{error}</Text>}
  </View>
);

const inputStyle = (c: any) => ({
  borderWidth: 1, borderColor: c.border, backgroundColor: c.card,
  borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
});