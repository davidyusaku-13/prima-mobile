import { describe, expect, it } from 'bun:test';

import {
  getMessageFromUnknownSignUpError,
  getSignUpStatusErrorMessage,
  validateSignUpFields,
} from './sign-up';

describe('getSignUpStatusErrorMessage', () => {
  it('returns null for complete status', () => {
    expect(getSignUpStatusErrorMessage('complete')).toBe(null);
  });

  it('returns explicit message for missing requirements status', () => {
    expect(getSignUpStatusErrorMessage('missing_requirements')).toBe(
      'Sign-up needs additional account requirements in Clerk. Please contact support or try Google sign-up.'
    );
  });

  it('returns fallback message for unknown statuses', () => {
    expect(getSignUpStatusErrorMessage('unknown_status')).toBe(
      'Sign-up cannot be completed right now. Please try again or use another sign-up method.'
    );
  });
});

describe('getMessageFromUnknownSignUpError', () => {
  it('prefers Clerk long message when present', () => {
    const error = {
      errors: [{ longMessage: 'Long Clerk error', message: 'Short Clerk error' }],
    };

    expect(getMessageFromUnknownSignUpError(error)).toBe('Long Clerk error');
  });

  it('falls back to Clerk message when long message is missing', () => {
    const error = {
      errors: [{ message: 'Short Clerk error' }],
    };

    expect(getMessageFromUnknownSignUpError(error)).toBe('Short Clerk error');
  });

  it('falls back to default message for unrecognized errors', () => {
    expect(getMessageFromUnknownSignUpError(new Error('native error'))).toBe(
      'Unable to sign up. Please check your details and try again.'
    );
  });
});

describe('validateSignUpFields', () => {
  it('requires first name', () => {
    expect(validateSignUpFields('   ', 'Doe', 'jdoe', 'valid-password')).toBe(
      'First name is required.'
    );
  });

  it('requires last name', () => {
    expect(validateSignUpFields('Jane', '   ', 'jdoe', 'valid-password')).toBe(
      'Last name is required.'
    );
  });

  it('requires username', () => {
    expect(validateSignUpFields('Jane', 'Doe', '   ', 'valid-password')).toBe(
      'Username is required.'
    );
  });

  it('requires password', () => {
    expect(validateSignUpFields('Jane', 'Doe', 'jdoe', '   ')).toBe('Password is required.');
  });

  it('returns null when required fields are present', () => {
    expect(validateSignUpFields('Jane', 'Doe', 'jdoe', 'valid-password')).toBe(null);
  });
});
