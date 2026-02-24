# Mobile Route-Mirror Navigation + Backend Integration Design

Date: 2026-02-24
Owner: OpenCode + user
Scope: `mobile/` app refresh, bottom navigation parity with `frontend/` sidebar, Clerk-authenticated backend integration for admin routes.

## 1) Goals and non-goals

### Goals
- Clear out Expo starter template UI and replace it with product-oriented screens.
- Mirror frontend primary routes in mobile bottom navigation:
  - `Beranda`
  - `Pasien`
  - `Berita`
  - `Video Edukasi`
- Add a role-gated `Admin` tab in mobile when backend authorization confirms admin access.
- Connect mobile to backend with Clerk bearer token authentication.
- Keep mobile visual language aligned with frontend (palette, spacing rhythm, card treatment, status pills).

### Non-goals (v1)
- Building new backend APIs for `Pasien`, `Berita`, `Video Edukasi`.
- Offline cache/sync, background jobs, push notifications.
- Expanding backend authorization model beyond existing admin checks.

## 2) Chosen approach

Selected: **Route-mirror architecture**.

Why this approach:
- Matches frontend information architecture directly.
- Removes starter-template debt early.
- Creates stable primitives (route config + shell + API layer) for later feature expansion.

## 3) Navigation architecture

## Route parity target
- Frontend `/` -> Mobile `index` tab (`Beranda`)
- Frontend `/pasien` -> Mobile `pasien` tab
- Frontend `/berita` -> Mobile `berita` tab
- Frontend `/video-edukasi` -> Mobile `video-edukasi` tab
- Frontend admin group (`/admin`, `/admin/health`, `/admin/users`) -> Mobile `admin` tab + nested admin screens

## Tab composition
- Base tabs are always the 4 public routes.
- `Admin` tab is conditionally included after an admin access probe.
- Admin tab opens an admin stack/list with:
  - Overview
  - Health
  - Users

## Config-driven nav
- Centralize nav metadata (route key, label, icon, optional access rule) in one config module.
- Reuse config for tab rendering, quick links, and active screen labels.

## 4) Auth and backend data flow

## Auth model
- Entire mobile app is auth-required in v1.
- Root layout wraps app with Clerk provider.
- Signed-out users are directed to Clerk sign-in flow.

## Token and request flow
1. User signs in with Clerk.
2. Mobile obtains session token via Clerk SDK.
3. API client sends `Authorization: Bearer <token>` to backend.
4. Admin probe (`/admin`) determines admin-tab visibility.

## API client
- Create typed backend client under `mobile/`:
  - Base URL from `EXPO_PUBLIC_API_URL`
  - Shared request helper with timeout and normalized error surface
  - Typed admin calls:
    - `GET /admin`
    - `GET /admin/health`
    - `GET /admin/users`

## Admin behavior
- If `/admin` returns 200: show `Admin` tab.
- If `/admin` returns 401/403: hide `Admin` tab.
- Admin screens use real backend payloads; no mocks.

## Public-tab behavior
- `Pasien`, `Berita`, `Video Edukasi` ship as production-style UI shells with empty states until APIs exist.

## 5) Design language alignment

## Tokens and palette
- Mirror frontend blue system and neutral surfaces:
  - Primary gradient: `#2f76df` -> `#255fc2`
  - Background wash: `#f6f8fc` -> `#eef4ff`
  - Card: `#ffffff`
  - Border: `#dce6f7`

## Shared mobile primitives
- `ScreenShell` for layout scaffold and background treatment.
- `PanelCard` for card blocks matching frontend panel visual language.
- Reusable status pill/badge component for role and health states.

## Bottom nav styling
- Soft elevated nav container, rounded corners, subtle border.
- Active item gets blue-tinted chip and stronger icon/label emphasis.
- Keep motion subtle and intentional; honor reduced-motion preferences.

## Screen content plan (v1)
- `Beranda`: signed-in welcome and navigation shortcuts.
- `Pasien`: empty-state shell with future-data cue.
- `Berita`: empty-state shell with future-data cue.
- `Video Edukasi`: empty-state shell with future-data cue.
- `Admin`:
  - Overview: access status/summary
  - Health: backend health snapshot presentation
  - Users: role and active-state list

## 6) Error handling and resilience

- Clerk initializing: branded loading screen.
- Missing/invalid API URL: explicit config error card.
- Network/API failures: retryable inline error states (no crashes).
- Authorization drift (admin revoked): remove admin access affordances and show permission context.
- Add pull-to-refresh for admin data screens.

## 7) Testing and verification plan

## Automated checks
- Mobile: `bun run lint`
- If backend changes are introduced during implementation:
  - `go test ./...`
  - `go vet ./...`

## Manual checks
- Auth-required app launch and sign-in flow.
- Admin tab visibility for admin vs non-admin user.
- Admin health and users screens render live backend data.
- Public tabs render polished empty states.
- Visual parity with frontend language (color, cards, spacing, badges).

## 8) Risks and mitigations

- Risk: Clerk token retrieval differences across platforms.
  - Mitigation: centralize token retrieval in one auth utility and verify on iOS/Android/web.
- Risk: Dynamic tab add/remove causing router edge cases.
  - Mitigation: isolate access probe and guard admin routes defensively.
- Risk: Design drift from frontend over time.
  - Mitigation: keep token values in one module and reuse shared primitives.

## 9) Acceptance criteria

- Expo template screens/components are removed from active user flows.
- Mobile tabs mirror frontend route set and labels.
- Admin tab appears only for backend-authorized admin users.
- Mobile sends Clerk bearer token and successfully consumes `/admin`, `/admin/health`, `/admin/users`.
- Public route screens use aligned design language and meaningful empty states.
- Lint and agreed verification checks pass for changed areas.

## 10) Implementation status (2026-02-25)

- Final automated verification completed in `mobile/`:
  - `bun run lint` passed.
  - `bun test` passed (42 passed, 0 failed).
  - `bunx tsc --noEmit` passed.
- Manual validation disposition:
  - Signed-out users land on sign-in screen -> BLOCKED (not executed in this run; no simulator/device evidence captured).
  - Signed-in users reach tabs -> BLOCKED (not executed in this run; no simulator/device evidence captured).
  - Admin tab appears for admin users only -> BLOCKED (not executed in this run; admin/non-admin comparison not recorded).
  - Admin health/users render live backend data -> BLOCKED (not executed in this run; no live API walkthrough evidence captured).
  - Public tabs render polished empty states -> BLOCKED (not executed in this run; no UX walkthrough notes captured).
- Backend verification disposition -> N/A (backend was untouched for this follow-up, so `go test ./...` and `go vet ./...` were not run).
