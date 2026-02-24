import { describe, expect, it } from 'bun:test';

import {
  getMessageFromUnknownError,
  getSignInStatusErrorMessage,
  validateSignInFields,
} from './sign-in';

describe('getSignInStatusErrorMessage', () => {
  it('returns null for complete status', () => {
    expect(getSignInStatusErrorMessage('complete')).toBe(null);
  });

  it('returns explicit message for second factor status', () => {
    expect(getSignInStatusErrorMessage('needs_second_factor')).toBe(
      'Two-factor authentication is required to continue. Please complete your second factor sign-in step.'
    );
  });

  it('returns explicit message for new password status', () => {
    expect(getSignInStatusErrorMessage('needs_new_password')).toBe(
      'Your account requires a new password before you can sign in. Please reset your password and try again.'
    );
  });

  it('returns fallback message for unknown statuses', () => {
    expect(getSignInStatusErrorMessage('unknown_status')).toBe(
      'Sign-in cannot be completed right now. Please try again or use another sign-in method.'
    );
  });
});

describe('getMessageFromUnknownError', () => {
  it('prefers Clerk long message when present', () => {
    const error = {
      errors: [{ longMessage: 'Long Clerk error', message: 'Short Clerk error' }],
    };

    expect(getMessageFromUnknownError(error)).toBe('Long Clerk error');
  });

  it('falls back to Clerk message when long message is missing', () => {
    const error = {
      errors: [{ message: 'Short Clerk error' }],
    };

    expect(getMessageFromUnknownError(error)).toBe('Short Clerk error');
  });

  it('falls back to default message for unrecognized errors', () => {
    expect(getMessageFromUnknownError(new Error('native error'))).toBe(
      'Unable to sign in. Please check your credentials and try again.'
    );
  });
});

describe('validateSignInFields', () => {
  it('requires username', () => {
    expect(validateSignInFields('   ', 'valid-password')).toBe('Username is required.');
  });

  it('requires password', () => {
    expect(validateSignInFields('name@example.com', '   ')).toBe('Password is required.');
  });

  it('returns null when both fields are present', () => {
    expect(validateSignInFields('name@example.com', 'valid-password')).toBe(null);
  });
});
