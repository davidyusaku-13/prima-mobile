const DEFAULT_SIGN_IN_ERROR_MESSAGE =
  'Unable to sign in. Please check your credentials and try again.';

type ClerkErrorItem = {
  longMessage?: string;
  message?: string;
};

type ClerkErrorLike = {
  errors?: ClerkErrorItem[];
};

export function getSignInStatusErrorMessage(status: string | null | undefined): string | null {
  if (status === 'complete') {
    return null;
  }

  if (status === 'needs_second_factor') {
    return 'Two-factor authentication is required to continue. Please complete your second factor sign-in step.';
  }

  if (status === 'needs_new_password') {
    return 'Your account requires a new password before you can sign in. Please reset your password and try again.';
  }

  return 'Sign-in cannot be completed right now. Please try again or use another sign-in method.';
}

function isClerkErrorLike(error: unknown): error is ClerkErrorLike {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeErrors = (error as { errors?: unknown }).errors;
  if (!Array.isArray(maybeErrors)) {
    return false;
  }

  return maybeErrors.every(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      ('longMessage' in entry || 'message' in entry)
  );
}

export function getMessageFromUnknownError(error: unknown): string {
  if (!isClerkErrorLike(error)) {
    return DEFAULT_SIGN_IN_ERROR_MESSAGE;
  }

  return error.errors?.[0]?.longMessage ?? error.errors?.[0]?.message ?? DEFAULT_SIGN_IN_ERROR_MESSAGE;
}

export function validateSignInFields(emailAddress: string, password: string): string | null {
  if (emailAddress.trim().length === 0) {
    return 'Email is required.';
  }

  if (password.trim().length === 0) {
    return 'Password is required.';
  }

  return null;
}
