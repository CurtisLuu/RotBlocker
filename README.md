# RotBlocker

Open-source, free. Instagram without Reels, YouTube without Shorts, TikTok blocked.

RotBlocker loads a site’s mobile web in an in-app browser and hides the short-form surface while leaving the rest working:

- **Instagram** — hides Reels (and optionally Explore); feed, stories and DMs stay usable.
- **YouTube** — hides the Shorts tab, the Shorts shelves, and Shorts in search; normal videos, subscriptions and search stay usable.
- **TikTok** — not browsable here. It is short video the whole way through, so there is no long-form side to keep and an in-app TikTok would be the thing this app exists to stop. TikTok is block-only.

A **development / production build** can also shield the native apps with Apple Screen Time so users don’t need manual Shortcuts. The iOS picker is the system one, so any app can be chosen — Instagram, TikTok, YouTube, or anything else.

## How it works

1. Keep the **native apps** installed for DM/story notifications.
2. **Block apps on your phone** in RotBlocker (Screen Time) — pick them once.
3. Browse Instagram and YouTube inside **RotBlocker**, where the short-form surfaces are filtered. TikTok stays blocked.

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

**You cannot test native app blocking inside Expo Go** — Screen Time APIs need a custom native binary. **Block apps on your phone** will say so on purpose.

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

Install on a **physical iPhone**, open **Block apps on your phone**, allow Screen Time, then pick Instagram, TikTok and YouTube.

## Project layout

```
App.tsx
screens/HomeScreen.tsx
screens/TutorialScreen.tsx
screens/SetupGuideScreen.tsx
screens/NativeBlockScreen.tsx    # Screen Time shield UI
screens/FilteredBrowserScreen.tsx # in-app browser, one site at a time
filters/common.ts                # shared injected-script scaffolding
filters/instagram.ts
filters/youtube.ts
lib/sites.ts                     # site list: URL, script, toggles, persistence
lib/nativeBlock.ts
lib/settings.ts
theme.ts
```

Adding a site means writing a filter manifest under `filters/` and adding an
entry to `lib/sites.ts`. The browser screen, the toggles on the home screen
and the AsyncStorage keys all follow from that entry.

## Filters

### Instagram

| Toggle | Default |
|--------|---------|
| Hide Reels tab | on |
| Hide Reels in feed | on |
| Block `/reels` URLs | on |
| Hide Explore | off |

### YouTube

| Toggle | Default |
|--------|---------|
| Hide Shorts tab | on |
| Hide Shorts shelves on the home feed | on |
| Hide Shorts in search results | on |
| Redirect `/shorts` URLs | on |

A `/shorts/<id>` URL is rewritten to `/watch?v=<id>`, so a Short someone sent
you still plays — as a normal video, without the swipe feed. The `/shorts`
feed itself goes to the home page.

Selectors target **m.youtube.com** markup (`ytm-…` elements, `tab-identifier`,
`href^="/shorts"`), with the desktop `ytd-…` equivalents as a fallback. Each
one is commented with what it is for; repair from `href^="/shorts"` outwards
when YouTube redesigns.

## Limits

- Filtered browsing uses **mobile web**, not the native apps.
- Native blocking requires EAS/dev client + Apple Family Controls setup.
- TikTok is block-only by design — there is no filtered TikTok to browse.
- Android has no app picker, so its block list is fixed (Instagram, TikTok, YouTube).

## License

MIT — free forever. Contributions welcome.
