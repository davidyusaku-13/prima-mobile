import { describe, expect, it } from 'bun:test';

import {
  buildAdminUserIdentityKey,
  formatActiveState,
  formatHealthState,
  formatRole,
  formatUptime,
} from './formatters';

describe('admin formatters', () => {
  it('formats uptime from seconds', () => {
    expect(formatUptime(3661)).toBe('1h 1m 1s');
    expect(formatUptime(59)).toBe('59s');
    expect(formatUptime(0)).toBe('0s');
  });

  it('maps health payload to status badge semantics', () => {
    expect(formatHealthState({ status: 'ok', db: 'up' })).toEqual({
      label: 'Healthy',
      tone: 'success',
    });
    expect(formatHealthState({ status: 'degraded', db: 'down' })).toEqual({
      label: 'Degraded',
      tone: 'warning',
    });
  });

  it('maps backend role to readable labels and tones', () => {
    expect(formatRole('superadmin')).toEqual({ label: 'Super Admin', tone: 'danger' });
    expect(formatRole('admin')).toEqual({ label: 'Admin', tone: 'primary' });
    expect(formatRole('user')).toEqual({ label: 'User', tone: 'neutral' });
    expect(formatRole('legacy-role')).toEqual({ label: 'Legacy-role', tone: 'warning' });
  });

  it('maps active flag to frontend badge semantics', () => {
    expect(formatActiveState(true)).toEqual({ label: 'Aktif', tone: 'success' });
    expect(formatActiveState(false)).toEqual({ label: 'Nonaktif', tone: 'danger' });
  });

  it('builds stable admin user identity keys from immutable identifiers', () => {
    expect(buildAdminUserIdentityKey({ clerk_id: 'user_123' })).toBe('clerk:user_123');
    expect(buildAdminUserIdentityKey({ id: 99 })).toBe('id:99');
    expect(buildAdminUserIdentityKey({ user_id: 'abc' })).toBe('user_id:abc');
    expect(buildAdminUserIdentityKey({ email: '  ADMIN@EXAMPLE.COM ' })).toBe('email:admin@example.com');
    expect(buildAdminUserIdentityKey({ username: '  superadmin ' })).toBe('username:superadmin');
    expect(buildAdminUserIdentityKey({ name: 'Mutable Display Name' })).toBe(null);
  });
});
