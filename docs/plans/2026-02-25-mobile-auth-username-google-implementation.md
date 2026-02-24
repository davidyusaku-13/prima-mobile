# Mobile Username + Google Auth Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add separate sign-in and sign-up routes where credentials use username/password, both routes support Google OAuth, and sign-up requires first/last name.

**Architecture:** Keep Expo Router auth screens as top-level routes (`/sign-in`, `/sign-up`) and continue enforcing access through the existing root auth gate. Use shared auth utility modules for field validation and Clerk error mapping, and keep route files focused on UI + submit orchestration.

**Tech Stack:** Expo Router, React Native, TypeScript, Clerk Expo SDK (`useSignIn`, `useSignUp`, `useSSO`), Bun test runner.

---

### Task 1: Route access and root gate updates

**Files:**
- Modify: `app/_layout.tsx`
- Modify: `lib/auth/root-auth-gate.ts`
- Test: `lib/auth/root-auth-gate.test.ts`

**Step 1: Write failing tests for `/sign-up` auth-route behavior**

```ts
it('keeps signed-out users on sign-up', () => {
  expect(
    getRootAuthGateState({
      isLoaded: true,
      isSignedIn: false,
      pathname: '/sign-up',
    })
  ).toEqual({
    shouldRenderStack: true,
    redirectTo: null,
  });
});

it('redirects signed-in users away from sign-up', () => {
  expect(
    getRootAuthGateState({
      isLoaded: true,
      isSignedIn: true,
      pathname: '/sign-up',
    })
  ).toEqual({
    shouldRenderStack: true,
    redirectTo: '/(tabs)',
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test lib/auth/root-auth-gate.test.ts`
Expected: FAIL for `/sign-up` cases with redirect mismatch.

**Step 3: Implement minimal gate logic + stack route registration**

```ts
const AUTH_ROUTES = new Set(['/sign-in', '/sign-up']);

if (!isSignedIn && !AUTH_ROUTES.has(pathname)) {
  return { shouldRenderStack: true, redirectTo: '/sign-in' };
}

if (isSignedIn && AUTH_ROUTES.has(pathname)) {
  return { shouldRenderStack: true, redirectTo: '/(tabs)' };
}
```

Add stack screen:

```tsx
<Stack.Screen name="sign-up" options={{ headerShown: false }} />
```

**Step 4: Run test to verify it passes**

Run: `bun test lib/auth/root-auth-gate.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/_layout.tsx lib/auth/root-auth-gate.ts lib/auth/root-auth-gate.test.ts
git commit -m "feat(mobile): allow sign-up route in auth gate"
```

### Task 2: Convert sign-in validation to username/password

**Files:**
- Modify: `lib/auth/sign-in.ts`
- Modify: `lib/auth/sign-in.test.ts`

**Step 1: Write failing tests for username validation**

```ts
it('requires username', () => {
  expect(validateSignInFields('   ', 'valid-password')).toBe('Username is required.');
});
```

**Step 2: Run test to verify it fails**

Run: `bun test lib/auth/sign-in.test.ts`
Expected: FAIL due to existing "Email is required." behavior.

**Step 3: Implement minimal validation rename**

```ts
export function validateSignInFields(username: string, password: string): string | null {
  if (username.trim().length === 0) {
    return 'Username is required.';
  }

  if (password.trim().length === 0) {
    return 'Password is required.';
  }

  return null;
}
```

**Step 4: Run test to verify it passes**

Run: `bun test lib/auth/sign-in.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/auth/sign-in.ts lib/auth/sign-in.test.ts
git commit -m "refactor(mobile): use username validation for sign-in"
```

### Task 3: Add sign-up auth utility module with tests

**Files:**
- Create: `lib/auth/sign-up.ts`
- Create: `lib/auth/sign-up.test.ts`

**Step 1: Write failing tests for sign-up field validation + error mapping**

```ts
it('requires first name', () => {
  expect(validateSignUpFields('', 'Doe', 'jdoe', 'password123')).toBe('First name is required.');
});

it('requires last name', () => {
  expect(validateSignUpFields('Jane', '', 'jdoe', 'password123')).toBe('Last name is required.');
});

it('requires username', () => {
  expect(validateSignUpFields('Jane', 'Doe', '', 'password123')).toBe('Username is required.');
});
```

**Step 2: Run test to verify it fails**

Run: `bun test lib/auth/sign-up.test.ts`
Expected: FAIL because module does not exist yet.

**Step 3: Write minimal implementation**

```ts
export function validateSignUpFields(
  firstName: string,
  lastName: string,
  username: string,
  password: string
): string | null {
  if (firstName.trim().length === 0) return 'First name is required.';
  if (lastName.trim().length === 0) return 'Last name is required.';
  if (username.trim().length === 0) return 'Username is required.';
  if (password.trim().length === 0) return 'Password is required.';
  return null;
}
```

**Step 4: Run test to verify it passes**

Run: `bun test lib/auth/sign-up.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/auth/sign-up.ts lib/auth/sign-up.test.ts
git commit -m "feat(mobile): add sign-up field validation utilities"
```

### Task 4: Implement sign-up screen with username/password and Google OAuth

**Files:**
- Create: `app/sign-up.tsx`
- Modify: `app/_layout.tsx` (if not already updated in Task 1)

**Step 1: Add minimal navigation smoke test expectation (if route list tests exist)**

If no route unit test exists, skip this and rely on lint/type checks.

**Step 2: Implement screen structure and submit flow**

```tsx
const result = await signUp.create({
  firstName: firstName.trim(),
  lastName: lastName.trim(),
  username: username.trim(),
  password,
});

if (!result.createdSessionId) {
  setErrorMessage('Sign-up succeeded, but no session was created. Please try signing up again.');
  return;
}

await setActive({ session: result.createdSessionId });
router.replace('/(tabs)');
```

Google OAuth:

```tsx
const { startSSOFlow } = useSSO();

const { createdSessionId } = await startSSOFlow({ strategy: 'oauth_google' });
if (createdSessionId) {
  await setActive({ session: createdSessionId });
  router.replace('/(tabs)');
}
```

Add link back to sign-in:

```tsx
<Link href="/sign-in">Already have an account? Sign in</Link>
```

**Step 3: Run static checks**

Run: `bun run lint`
Expected: PASS or actionable lint failures in new file only.

**Step 4: Commit**

```bash
git add app/sign-up.tsx app/_layout.tsx
git commit -m "feat(mobile): add sign-up screen with Google OAuth"
```

### Task 5: Update sign-in screen for username and Google OAuth + sign-up link

**Files:**
- Modify: `app/sign-in.tsx`

**Step 1: Ensure current behavior is captured by existing tests**

Run: `bun test lib/auth/sign-in.test.ts`
Expected: PASS before route file edits.

**Step 2: Update sign-in screen fields and submit payload**

```tsx
const result = await signIn.create({
  identifier: username.trim(),
  password,
});
```

UI changes:
- Email label -> Username label
- Placeholder -> `your-username`
- Add Google OAuth button
- Add link to `/sign-up`

**Step 3: Run checks**

Run: `bun run lint`
Expected: PASS.

**Step 4: Commit**

```bash
git add app/sign-in.tsx
git commit -m "feat(mobile): support username and Google sign-in"
```

### Task 6: Full verification and docs alignment

**Files:**
- Modify: `README.md`
- Modify: `docs/plans/2026-02-25-mobile-auth-username-google-design.md` (status notes only, if needed)

**Step 1: Update docs for auth route behavior**

Add bullets:
- Signed-out users can access `/sign-in` and `/sign-up`
- Sign-in supports username/password and Google OAuth
- Sign-up requires first name, last name, username, password, and supports Google OAuth

**Step 2: Run full verification**

Run: `bun test && bun run lint`
Expected: all tests pass, lint passes.

**Step 3: Manual smoke check**

Run: `bun run start`
Expected:
- App lands on `/sign-in` when signed out.
- User can navigate to `/sign-up`.
- Username/password and Google actions are visible on both screens.

**Step 4: Commit**

```bash
git add README.md docs/plans/2026-02-25-mobile-auth-username-google-design.md
git commit -m "docs(mobile): document username and Google auth flows"
```
