import { describe, expect, it } from 'bun:test';

import { requireEnv } from './session';

function expectMissingEnvThrow(value: string | undefined) {
  try {
    requireEnv(value, 'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
    throw new Error('Expected requireEnv to throw for missing env');
  } catch (error) {
    expect((error as Error).message).toBe(
      'Missing required environment variable: EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY'
    );
  }
}

describe('requireEnv', () => {
  it('returns the value when present', () => {
    expect(requireEnv('pk_test_123', 'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY')).toBe('pk_test_123');
  });

  it('throws when variable is undefined', () => {
    expectMissingEnvThrow(undefined);
  });

  it('throws when variable is empty', () => {
    expectMissingEnvThrow('   ');
  });
});
