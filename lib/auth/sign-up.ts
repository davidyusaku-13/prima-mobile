const DEFAULT_SIGN_UP_ERROR_MESSAGE =
  'Unable to sign up. Please check your details and try again.';

type ClerkErrorItem = {
  longMessage?: string;
  message?: string;
};

type ClerkErrorLike = {
  errors?: ClerkErrorItem[];
};

export function getSignUpStatusErrorMessage(status: string | null | undefined): string | null {
  if (status === 'complete') {
    return null;
  }

  if (status === 'missing_requirements') {
    return 'Sign-up needs additional account requirements in Clerk. Please contact support or try Google sign-up.';
  }

  return 'Sign-up cannot be completed right now. Please try again or use another sign-up method.';
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

export function getMessageFromUnknownSignUpError(error: unknown): string {
  if (!isClerkErrorLike(error)) {
    return DEFAULT_SIGN_UP_ERROR_MESSAGE;
  }

  return error.errors?.[0]?.longMessage ?? error.errors?.[0]?.message ?? DEFAULT_SIGN_UP_ERROR_MESSAGE;
}

export function validateSignUpFields(
  firstName: string,
  lastName: string,
  username: string,
  password: string
): string | null {
  if (firstName.trim().length === 0) {
    return 'First name is required.';
  }

  if (lastName.trim().length === 0) {
    return 'Last name is required.';
  }

  if (username.trim().length === 0) {
    return 'Username is required.';
  }

  if (password.trim().length === 0) {
    return 'Password is required.';
  }

  return null;
}
