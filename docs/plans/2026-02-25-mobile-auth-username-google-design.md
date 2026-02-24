# Mobile Username + Google Auth Design

Date: 2026-02-25
Owner: OpenCode + user
Scope: `mobile/` authentication routes and flows only.

## Goals

- Change credential sign-in from email+password to username+password.
- Add Google OAuth option for both sign-in and sign-up.
- Add a dedicated sign-up route reachable from sign-in.
- Require first name and last name on sign-up.
- Keep auth gating behavior consistent: signed-out users stay on auth routes, signed-in users go to `/(tabs)`.

## Non-goals

- Backend API changes.
- Profile editing after sign-up.
- Password reset flow and MFA UX expansions.

## Chosen approach

Selected: **Option 1: separate routes for sign-in and sign-up**.

Why:
- Meets the routing requirement directly (`/sign-in` and `/sign-up` both accessible).
- Keeps each form focused and easier to validate.
- Fits current Expo Router structure and existing root auth gate model.

## Route and auth architecture

- Keep `app/sign-in.tsx` as the sign-in screen.
- Add `app/sign-up.tsx` as the sign-up screen.
- Update root stack (`app/_layout.tsx`) to register `sign-up`.
- Update root auth gate logic to treat both `/sign-in` and `/sign-up` as signed-out-allowed routes.
- Signed-in users visiting either auth route are redirected to `/(tabs)`.

## Screen behavior

### Sign-in
- Field labels and validation use `username` and `password`.
- Primary action: username/password sign-in.
- Secondary action: Google OAuth sign-in.
- Link to `/sign-up`.

### Sign-up
- Fields: `firstName`, `lastName`, `username`, `password`.
- Primary action: username/password sign-up.
- Secondary action: Google OAuth sign-up.
- Link back to `/sign-in`.

## Error handling

- Continue using defensive Clerk error mapping for user-friendly messages.
- Show fallback messages when Clerk does not provide structured details.
- Keep submit buttons disabled during pending requests.

## Testing strategy

- Extend existing auth gate tests for `/sign-up` behavior.
- Add sign-up validation/error utility tests.
- Keep sign-in utility tests aligned with username naming and validation.
- Run `bun test` and `bun run lint` in `mobile/`.

## Acceptance criteria

- `expo start` opens signed-out users on `/sign-in` and provides a visible path to `/sign-up`.
- Sign-in supports username+password and Google OAuth.
- Sign-up supports first name, last name, username, password, and Google OAuth.
- Root auth gate correctly handles both auth routes for signed-out and signed-in states.
