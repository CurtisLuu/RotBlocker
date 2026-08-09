# RotBlocker

Open-source, free Instagram without Reels.

RotBlocker loads Instagram’s mobile site in an in-app browser and hides Reels (and optionally Explore) while keeping feed, stories, and DMs usable. A **development / production build** can also shield native Instagram with Apple Screen Time so users don’t need manual Shortcuts.

## How it works

1. Keep **native Instagram** installed for DM/story notifications.
2. **Block the Instagram app** in RotBlocker (Screen Time) — pick Instagram once.
3. Browse Instagram inside **RotBlocker**, where Reels are filtered.

Apple does **not** allow apps to create Shortcuts automations for you. Native shielding replaces that redirect. Shortcuts remain an optional manual backup.

## Requirements

### Expo Go (filters only)

- Node 20+
- iPhone with [Expo Go](https://apps.apple.com/app/expo-go/id982107779)
- Same Wi‑Fi (or tunnel)

```bash
npm install --legacy-peer-deps
npm start
```

Scan the QR with Expo Go. That tests filters, tutorial, setup UI, and home.

**You cannot test native Instagram blocking inside Expo Go** — Screen Time APIs need a custom native binary. **Block the Instagram app** will say so on purpose.

`expo-app-blocker` is disabled for normal `npm start` so it doesn’t break Expo. EAS builds turn it on automatically.

### Native Instagram blocking (Screen Time)

Needs a real iOS build (not Expo Go):

1. Set `APPLE_TEAM_ID` when building (see `app.config.js`).
2. In Apple Developer: create App Group `group.org.rotblocker.blocker`, enable Family Controls + App Groups on:
   - `org.rotblocker.app`
   - `org.rotblocker.app.DeviceActivityMonitor`
   - `org.rotblocker.app.ShieldAction`
   - `org.rotblocker.app.ShieldConfiguration`
3. Request [Family Controls distribution](https://developer.apple.com/contact/request/family-controls-distribution) for App Store/TestFlight (dev builds can use Family Controls Development meanwhile).
4. Build:

```bash
npm run build:dev:ios
```

Install on a **physical iPhone**, open **Block the Instagram app**, allow Screen Time, pick Instagram.

## Project layout

```
App.tsx
screens/HomeScreen.tsx
screens/TutorialScreen.tsx
screens/SetupGuideScreen.tsx
screens/NativeBlockScreen.tsx   # Screen Time shield UI
screens/InstagramScreen.tsx
filters/instagram.ts
lib/nativeBlock.ts
lib/settings.ts
theme.ts
```

## Filters

| Toggle | Default |
|--------|---------|
| Hide Reels tab | on |
| Hide Reels in feed | on |
| Block `/reels` URLs | on |
| Hide Explore | off |

## Limits

- Filtered browsing uses Instagram **mobile web**.
- Native blocking requires EAS/dev client + Apple Family Controls setup.
- TikTok / YouTube Shorts not included yet.

## License

MIT — free forever. Contributions welcome.
