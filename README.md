# Prima Mobile App

Expo Router mobile client for Prima, with Clerk authentication and admin endpoint integration.

## Prerequisites

- Bun installed (`bun --version`)
- Expo tooling (`bunx expo --version`)
- A running backend API reachable from your device/emulator
- Clerk app credentials

## Environment variables

Create a `.env` file in `mobile/` with:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_API_URL=http://localhost:8080
```

Notes:

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is required at startup. The app fails fast if missing.
- `EXPO_PUBLIC_API_URL` is required for admin API probes and admin tab data (`/admin`, `/admin/health`, `/admin/users`).
- For physical devices, use a LAN-accessible backend URL (not `localhost`).

## Install and run

```bash
bun install
bun run start
```

Useful scripts:

- `bun run android`
- `bun run ios`
- `bun run web`
- `bun run lint`
- `bun test`
- `bunx tsc --noEmit`

## Auth and routing behavior

- Signed-out users are redirected to `/sign-in`, and can navigate between `/sign-in` and `/sign-up`.
- Signed-in users are routed to `/(tabs)`.
- Sign-in supports `username + password` or Google OAuth.
- Sign-up requires first name, last name, username, and password, and also supports Google OAuth.
- Admin tab visibility is role-gated by probing `/admin` with the Clerk bearer token.
- Non-admin responses (`401`/`403`) hide admin tabs gracefully; other failures surface as retryable errors on admin screens.

## Project structure

- `app/` - Expo Router routes (tabs, sign-in)
- `components/` - shared UI components used by current screens
- `hooks/` - auth and admin-access hooks
- `lib/api/` - typed API client and admin endpoint adapters
