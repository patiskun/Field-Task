Candidate code: SA-RN-7431

### Стек и почему
Слой | Выбор | Почему
-----|-------|-------
Framework|Expo (SDK 51)|Быстрый APK через eas build, всё из коробки (notifications, image-picker, file-system)
Язык|TypeScript strict|Требование ТЗ
Стейт|Zustand + persist|Меньше бойлерплейта, чем Redux; persist через AsyncStorage — сразу закрывает офлайн
Хранилище|AsyncStorage|Хватает под объём; SQLite был бы overkill
Навигация|React Navigation (stack + bottom-tabs)|Стандарт
Карта|react-native-maps|Работает в Expo Go
Уведомления|expo-notifications|Единственный адекватный вариант
Mock API|json-server|Требование ТЗ
Даты|date-fns|Лёгкий


npx json-server --watch mock-server/db.json --port 3001 --host 0.0.0.0
 На Android-emulator localhost — это сам эмулятор; используйте http://10.0.2.2:3001. На физике — IP машины. Прописать через EXPO_PUBLIC_API_URL в .env.

тесты?
Google Maps API key?
Иконка/сплэш
Видео 2-5 мин — по чек-листу из ТЗ. Обязательно покажи код SA-RN-7431 в кадре (в Settings) и озвучь его.

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

## Install & run
```bash
npm install
cp .env.example .env   # set EXPO_PUBLIC_API_URL=http://<your-ip>:3001
npx expo start
```

## Mock server
```bash
npx json-server --watch mock-server/db.json --port 3001 --host 0.0.0.0
```

## Build APK (EAS)
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

## Notifications setup notes
- Android 13+ requires `POST_NOTIFICATIONS`. We request it lazily.
- Demo mode button on the Edit screen uses `{ seconds: 30 }` trigger.

## Known limitations
- No real geocoding; user enters lat/lng manually.
- Conflict resolution = last-write-wins.
- Attachments: only images. PDF would be a small extension in `attachmentService`.
- Sync runs on button tap (not background task).

## AI disclosure
Used ChatGPT to scaffold boilerplate (screens structure, README) and review types.
All architectural decisions and integration logic were made/verified by me.

## Candidate code
`SA-RN-7431` — shown in Settings screen and in this README.