# Field Tasks — RN intern test task

**Candidate code: SA-RN-7431**

## Overview
Offline-first task manager for field technicians. Create / edit / track / sync tasks with
attachments, location, status history, and 30-min local reminders.

## Features
- CRUD tasks (title, description, due, address, optional coordinates, attachments)
- Status: New / In Progress / Completed / Cancelled — every change logged
- Sort by created / due / status; filter by status; search by text
- Attachments: images copied to app documents dir (persist across restarts)
- Map screen with pins (react-native-maps), tap → task detail
- Local notification 30 min before due; **debug button** schedules one in 30s
- History tab with timestamps and actions; persisted in AsyncStorage
- Offline-first: everything works without network; sync to json-server with `pending/synced/failed`
- Light/dark theme toggle (Settings)

## Requirements
- Node.js 18+
- JDK 17 (Expo SDK 57 / RN 0.86 requires Java 17, not 21+)
- Android SDK (for Android builds)

## Install & run
```bash
npm install
cp .env.example .env          # macOS / Linux
copy .env.example .env        # Windows
npx expo start
```

## Mock server
```bash
npx json-server --watch mock-server/db.json --port 3001 --host 0.0.0.0
```

## Build APK

### Option A — local build (Gradle, no EAS account needed)

Requirements: JDK 17, Android SDK, `ANDROID_HOME` set or `android/local.properties` with `sdk.dir`.

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleDebug        # Windows: gradlew.bat assembleDebug
```

APK is produced at `android/app/build/outputs/apk/debug/app-debug.apk`.
Install on a connected device:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Option B — EAS cloud build

```bash
npm i -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```


## Architecture
- **Storage**: Zustand `persist` + AsyncStorage. Single store slice for tasks, history, theme.
- **Sync** (`src/services/syncService.ts`): push pending → pull → merge. **Last-write-wins by `updatedAt`.**
- **Notifications** (`src/services/notificationService.ts`): schedules at `dueAt - 30min`.
  If due <30min away, we schedule in 5s and show an Alert so the user knows.
- **Attachments** (`src/services/attachmentService.ts`): picked image copied into
  `documentDirectory/attachments/` — original URI may vanish, copy stays.
- **Map**: react-native-maps; tasks without coordinates are not shown (map tab shows hint).
- **State**: Zustand — no Provider needed, subscribe per selector.

## Sync behavior
Sync runs on demand (tap "Sync" on the task list or in Settings).
It pushes all locally-pending tasks to `PUT /tasks/:id`, then pulls
the full list and merges by `updatedAt` (newer wins). Failed pushes
are marked `Sync Failed` and retried on next tap. Offline mode is
fully functional — the app never blocks on network.

## Notifications setup notes
- Android 13+ requires `POST_NOTIFICATIONS`. We request it lazily.
- Demo mode button on the Edit screen uses `{ seconds: 30 }` trigger.
- **Expo Go is not supported for notifications** (SDK 53+ removed
  `expo-notifications` from Expo Go on Android). Use a dev build
  (`npx expo run:android`) or the built APK to test notifications.

## Known limitations
- No real geocoding; user enters lat/lng manually.
- Conflict resolution = last-write-wins.
- Attachments: only images.
- Sync runs on button tap (not background task).

## AI disclosure

This project was built with significant assistance from an AI coding
assistant (DeepSeek), used for scaffolding, boilerplate, and iterating
on React Native / Expo specifics. All architectural decisions were
made by me, and I verified every module: I can walk through the sync
service, the Zustand store, the notification scheduler, the map
integration, and the Gradle/Java build configuration on request.

## Candidate code
`SA-RN-7431` — shown in Settings screen and in this README.