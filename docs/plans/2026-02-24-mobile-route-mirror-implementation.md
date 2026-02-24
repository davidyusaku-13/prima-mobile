# Mobile Route-Mirror Navigation + Backend Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Expo template app with a Clerk-authenticated mobile app that mirrors frontend sidebar routes in bottom navigation and consumes backend admin APIs.

**Architecture:** Keep Expo Router tabs as the navigation shell, drive routes from centralized config, and gate admin tab visibility through a Clerk-authenticated `/admin` probe. Use shared design tokens and reusable screen/card primitives so mobile visual language stays aligned with frontend panels and nav style. Keep public tabs as polished empty-state shells in v1, while admin screens read live backend data.

**Tech Stack:** Expo Router 6, React Native 0.81, TypeScript strict, `@clerk/clerk-expo`, Bun test runner (`bun test`) for pure TS modules, `expo lint` for code quality.

---

### Task 1: Establish route contract and tab metadata

**Files:**
- Create: `mobile/lib/navigation/routes.ts`
- Create: `mobile/lib/navigation/routes.test.ts`
- Modify: `mobile/app/(tabs)/_layout.tsx`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "bun:test";
import { APP_TABS, getVisibleTabs } from "./routes";

describe("navigation routes", () => {
  it("keeps public route order matching frontend", () => {
    expect(APP_TABS.filter((t) => t.public).map((t) => t.key)).toEqual([
      "index",
      "pasien",
      "berita",
      "video-edukasi",
    ]);
  });

  it("hides admin when not authorized", () => {
    expect(getVisibleTabs(false).some((t) => t.key === "admin")).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test lib/navigation/routes.test.ts`
Expected: FAIL with module/function-not-found errors.

**Step 3: Write minimal implementation**

```ts
export type AppTabKey = "index" | "pasien" | "berita" | "video-edukasi" | "admin";

export const APP_TABS = [
  { key: "index", label: "Beranda", icon: "house.fill", public: true },
  { key: "pasien", label: "Pasien", icon: "person.2.fill", public: true },
  { key: "berita", label: "Berita", icon: "newspaper.fill", public: true },
  { key: "video-edukasi", label: "Video Edukasi", icon: "play.square.fill", public: true },
  { key: "admin", label: "Admin", icon: "lock.shield.fill", public: false },
] as const;

export function getVisibleTabs(isAdmin: boolean) {
  return APP_TABS.filter((tab) => tab.public || isAdmin);
}
```

**Step 4: Run test to verify it passes**

Run: `bun test lib/navigation/routes.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add lib/navigation/routes.ts lib/navigation/routes.test.ts app/(tabs)/_layout.tsx
git commit -m "feat(mobile): define route mirror tab contract"
```

### Task 2: Add frontend-aligned design tokens and core UI primitives

**Files:**
- Create: `mobile/lib/theme/tokens.ts`
- Create: `mobile/lib/theme/tokens.test.ts`
- Create: `mobile/components/screen-shell.tsx`
- Create: `mobile/components/panel-card.tsx`
- Create: `mobile/components/status-pill.tsx`
- Modify: `mobile/constants/theme.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "bun:test";
import { PrimaPalette } from "./tokens";

describe("prima palette", () => {
  it("matches frontend primary colors", () => {
    expect(PrimaPalette.primaryStart).toBe("#2f76df");
    expect(PrimaPalette.primaryEnd).toBe("#255fc2");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test lib/theme/tokens.test.ts`
Expected: FAIL because token module does not exist.

**Step 3: Write minimal implementation**

```ts
export const PrimaPalette = {
  primaryStart: "#2f76df",
  primaryEnd: "#255fc2",
  bgStart: "#f6f8fc",
  bgEnd: "#eef4ff",
  surface: "#ffffff",
  border: "#dce6f7",
};
```

Then implement `ScreenShell`, `PanelCard`, and `StatusPill` using these tokens.

**Step 4: Run test and lint to verify it passes**

Run: `bun test lib/theme/tokens.test.ts && bun run lint`
Expected: PASS

**Step 5: Commit**

```bash
git add lib/theme/tokens.ts lib/theme/tokens.test.ts components/screen-shell.tsx components/panel-card.tsx components/status-pill.tsx constants/theme.ts
git commit -m "feat(mobile): add frontend-aligned visual token system"
```

### Task 3: Implement Clerk provider and auth-required app shell

**Files:**
- Modify: `mobile/app/_layout.tsx`
- Create: `mobile/app/sign-in.tsx`
- Create: `mobile/lib/auth/session.ts`
- Create: `mobile/lib/auth/session.test.ts`
- Modify: `mobile/.env` (only if missing required Clerk key or API URL)

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "bun:test";
import { requireEnv } from "./session";

describe("requireEnv", () => {
  it("throws on missing publishable key", () => {
    expect(() => requireEnv("", "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY")).toThrow();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test lib/auth/session.test.ts`
Expected: FAIL because session utility does not exist.

**Step 3: Write minimal implementation**

```ts
export function requireEnv(value: string | undefined, name: string): string {
  if (!value) throw new Error(`${name} is not set`);
  return value;
}
```

Then wire Clerk in `app/_layout.tsx`:
- `ClerkProvider` with `publishableKey` and `tokenCache`
- `SignedIn` renders tabs stack
- `SignedOut` redirects to `sign-in`

Create `app/sign-in.tsx` using `useSignIn` + email/password form.

**Step 4: Run verification**

Run: `bun test lib/auth/session.test.ts && bun run lint`
Expected: PASS

**Step 5: Commit**

```bash
git add app/_layout.tsx app/sign-in.tsx lib/auth/session.ts lib/auth/session.test.ts .env
git commit -m "feat(mobile): require clerk authentication for app access"
```

### Task 4: Build backend API client and admin contracts

**Files:**
- Create: `mobile/lib/api/client.ts`
- Create: `mobile/lib/api/admin.ts`
- Create: `mobile/lib/api/admin.test.ts`
- Create: `mobile/lib/api/types.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "bun:test";
import { mapAdminUnauthorized } from "./admin";

describe("admin api mapping", () => {
  it("treats 401 and 403 as unauthorized", () => {
    expect(mapAdminUnauthorized(401)).toBe(true);
    expect(mapAdminUnauthorized(403)).toBe(true);
    expect(mapAdminUnauthorized(500)).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test lib/api/admin.test.ts`
Expected: FAIL because API module does not exist.

**Step 3: Write minimal implementation**

```ts
export function mapAdminUnauthorized(status: number): boolean {
  return status === 401 || status === 403;
}
```

Then implement:
- `createApiClient({ baseUrl, getToken })`
- request helper with timeout + JSON parsing
- typed calls for `/admin`, `/admin/health`, `/admin/users`

**Step 4: Run test and lint**

Run: `bun test lib/api/admin.test.ts && bun run lint`
Expected: PASS

**Step 5: Commit**

```bash
git add lib/api/client.ts lib/api/admin.ts lib/api/admin.test.ts lib/api/types.ts
git commit -m "feat(mobile): add clerk-authenticated backend client"
```

### Task 5: Wire conditional admin tab visibility and tab styling

**Files:**
- Modify: `mobile/app/(tabs)/_layout.tsx`
- Create: `mobile/hooks/use-admin-access.ts`
- Create: `mobile/hooks/use-admin-access.test.ts`
- Modify: `mobile/components/haptic-tab.tsx`
- Modify: `mobile/components/ui/icon-symbol.tsx`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "bun:test";
import { shouldShowAdminTab } from "./use-admin-access";

describe("admin tab visibility", () => {
  it("shows admin only when probe is true", () => {
    expect(shouldShowAdminTab(true)).toBe(true);
    expect(shouldShowAdminTab(false)).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test hooks/use-admin-access.test.ts`
Expected: FAIL (helper missing).

**Step 3: Write minimal implementation**

```ts
export const shouldShowAdminTab = (isAdmin: boolean) => isAdmin;
```

Then implement hook + tab layout behavior:
- probe `/admin` after auth load
- hide admin tab when unauthorized
- apply rounded/elevated tab bar styles and active blue chip treatment

**Step 4: Run verification**

Run: `bun test hooks/use-admin-access.test.ts && bun run lint`
Expected: PASS

**Step 5: Commit**

```bash
git add app/(tabs)/_layout.tsx hooks/use-admin-access.ts hooks/use-admin-access.test.ts components/haptic-tab.tsx components/ui/icon-symbol.tsx
git commit -m "feat(mobile): add role-gated admin tab with custom nav styling"
```

### Task 6: Replace template tabs with route-mirror public screens

**Files:**
- Modify: `mobile/app/(tabs)/index.tsx`
- Create: `mobile/app/(tabs)/pasien.tsx`
- Create: `mobile/app/(tabs)/berita.tsx`
- Create: `mobile/app/(tabs)/video-edukasi.tsx`
- Create: `mobile/components/empty-state-card.tsx`
- Delete: `mobile/app/(tabs)/explore.tsx`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "bun:test";
import { PUBLIC_EMPTY_STATES } from "@/lib/navigation/routes";

describe("public screen placeholders", () => {
  it("has copy for pasien, berita, and video edukasi", () => {
    expect(PUBLIC_EMPTY_STATES.pasien).toBeTruthy();
    expect(PUBLIC_EMPTY_STATES.berita).toBeTruthy();
    expect(PUBLIC_EMPTY_STATES["video-edukasi"]).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test lib/navigation/routes.test.ts`
Expected: FAIL for missing placeholder metadata.

**Step 3: Write minimal implementation**

Add `PUBLIC_EMPTY_STATES` in route metadata and build the three public tab screens using `ScreenShell` + `PanelCard` + `EmptyStateCard`.

**Step 4: Run verification**

Run: `bun test lib/navigation/routes.test.ts && bun run lint`
Expected: PASS

**Step 5: Commit**

```bash
git add app/(tabs)/index.tsx app/(tabs)/pasien.tsx app/(tabs)/berita.tsx app/(tabs)/video-edukasi.tsx components/empty-state-card.tsx lib/navigation/routes.ts lib/navigation/routes.test.ts
git rm app/(tabs)/explore.tsx
git commit -m "feat(mobile): implement frontend-matched public tab screens"
```

### Task 7: Implement admin overview, health, and users screens with live backend data

**Files:**
- Create: `mobile/app/(tabs)/admin/index.tsx`
- Create: `mobile/app/(tabs)/admin/health.tsx`
- Create: `mobile/app/(tabs)/admin/users.tsx`
- Create: `mobile/lib/admin/formatters.ts`
- Create: `mobile/lib/admin/formatters.test.ts`
- Create: `mobile/components/error-card.tsx`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "bun:test";
import { formatUptime } from "./formatters";

describe("admin formatters", () => {
  it("formats uptime from seconds", () => {
    expect(formatUptime(3661)).toBe("1h 1m 1s");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test lib/admin/formatters.test.ts`
Expected: FAIL because formatter module does not exist.

**Step 3: Write minimal implementation**

```ts
export function formatUptime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}h ${m}m ${r}s`;
  if (m > 0) return `${m}m ${r}s`;
  return `${r}s`;
}
```

Then build admin screens using real calls to `/admin`, `/admin/health`, `/admin/users`, with loading/error/retry UI.

**Step 4: Run verification**

Run: `bun test lib/admin/formatters.test.ts && bun run lint`
Expected: PASS

**Step 5: Commit**

```bash
git add app/(tabs)/admin/index.tsx app/(tabs)/admin/health.tsx app/(tabs)/admin/users.tsx lib/admin/formatters.ts lib/admin/formatters.test.ts components/error-card.tsx
git commit -m "feat(mobile): add admin screens backed by live api data"
```

### Task 8: Remove unused template artifacts and tighten project docs/config

**Files:**
- Delete: `mobile/components/hello-wave.tsx`
- Delete: `mobile/components/parallax-scroll-view.tsx`
- Delete: `mobile/components/themed-text.tsx`
- Delete: `mobile/components/themed-view.tsx`
- Delete: `mobile/components/ui/collapsible.tsx`
- Delete: `mobile/components/external-link.tsx`
- Modify: `mobile/README.md`
- Modify: `mobile/tailwind.config.js` (if Nativewind classes are used outside current globs)

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "bun:test";
import { APP_TABS } from "@/lib/navigation/routes";

describe("starter cleanup smoke", () => {
  it("still exposes expected tab count", () => {
    expect(APP_TABS.length).toBeGreaterThanOrEqual(4);
  });
});
```

**Step 2: Run test before cleanup**

Run: `bun test lib/navigation/routes.test.ts`
Expected: PASS (baseline before deletion).

**Step 3: Remove template artifacts and update docs**

Keep only reusable components used by current screens and update README with:
- env vars
- auth-required behavior
- admin API integration notes

**Step 4: Run verification**

Run: `bun run lint && bun test`
Expected: PASS

**Step 5: Commit**

```bash
git add README.md tailwind.config.js
git rm components/hello-wave.tsx components/parallax-scroll-view.tsx components/themed-text.tsx components/themed-view.tsx components/ui/collapsible.tsx components/external-link.tsx
git commit -m "chore(mobile): remove expo starter artifacts and update docs"
```

### Task 9: End-to-end verification and finish checklist

**Files:**
- Modify: `mobile/docs/plans/2026-02-24-mobile-navigation-backend-design.md` (append implementation notes only if needed)
- Modify: `mobile/docs/plans/2026-02-24-mobile-route-mirror-implementation.md` (check off results)

**Step 1: Run final automated checks**

Run: `bun run lint && bun test`
Expected: PASS

**Step 2: Run manual validation flow**

Run: `bun run start`
Expected manual results:
- signed-out users land on sign-in screen
- signed-in users reach tabs
- admin tab appears for admin users only
- admin health/users load from backend
- non-admin tabs show polished empty states

**Step 3: Capture validation notes**

Document any deviations and fixes in implementation plan notes.

**Step 4: Optional backend checks (only if backend touched)**

Run from `backend/`: `go test ./... && go vet ./...`
Expected: PASS

**Step 5: Commit verification notes**

```bash
git add docs/plans/2026-02-24-mobile-route-mirror-implementation.md docs/plans/2026-02-24-mobile-navigation-backend-design.md
git commit -m "docs(mobile): record verification outcomes"
```

### Verification outcomes (2026-02-25)

- `bun run lint` -> PASS (`expo lint`; no lint errors reported)
- `bun test` -> PASS (42 passed, 0 failed, 109 assertions, 9 files)
- `bunx tsc --noEmit` -> PASS (no TypeScript errors reported)
- Manual flow: signed-out users land on sign-in screen -> BLOCKED (not executed in this run; no simulator/device validation evidence recorded)
- Manual flow: signed-in users reach tabs -> BLOCKED (not executed in this run; no simulator/device validation evidence recorded)
- Manual flow: admin tab appears for admin users only -> BLOCKED (not executed in this run; admin/non-admin account comparison not recorded)
- Manual flow: admin health/users load from backend -> BLOCKED (not executed in this run; no live API screen walkthrough captured)
- Manual flow: non-admin tabs show polished empty states -> BLOCKED (not executed in this run; no UX walkthrough notes captured)
- Backend verification disposition -> N/A (backend code untouched in Task 9 docs follow-up, so `go test ./... && go vet ./...` was not required)

## Execution notes

- Follow DRY/YAGNI: do not create backend endpoints for public tabs in this plan.
- Keep auth and API concerns centralized under `lib/auth` and `lib/api`.
- Use `@/` imports consistently.
- Before saying a task is done, run `superpowers:verification-before-completion` checks.
