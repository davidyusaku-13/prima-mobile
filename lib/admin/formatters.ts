type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

type BadgeState = {
  label: string;
  tone: BadgeTone;
};

type HealthInput = {
  status?: string;
  db?: string;
};

type AdminIdentityInput = {
  clerk_id?: unknown;
  email?: unknown;
  id?: unknown;
  user_id?: unknown;
  username?: unknown;
  [key: string]: unknown;
};

const UPTIME_SECONDS_IN_MINUTE = 60;
const UPTIME_SECONDS_IN_HOUR = 3_600;

export function formatUptime(seconds: number | null | undefined): string {
  const totalSeconds = sanitizeSeconds(seconds);
  const hours = Math.floor(totalSeconds / UPTIME_SECONDS_IN_HOUR);
  const minutes = Math.floor((totalSeconds % UPTIME_SECONDS_IN_HOUR) / UPTIME_SECONDS_IN_MINUTE);
  const remainingSeconds = totalSeconds % UPTIME_SECONDS_IN_MINUTE;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

export function formatHealthState(input: HealthInput): BadgeState {
  const status = (input.status ?? '').toLowerCase();
  const db = (input.db ?? '').toLowerCase();

  if (status === 'ok' && db === 'up') {
    return { label: 'Healthy', tone: 'success' };
  }

  if (status === 'degraded' || db === 'down') {
    return { label: 'Degraded', tone: 'warning' };
  }

  return { label: 'Unknown', tone: 'neutral' };
}

export function formatRole(role: string | null | undefined): BadgeState {
  const normalized = (role ?? '').trim().toLowerCase();

  if (normalized === 'superadmin') {
    return { label: 'Super Admin', tone: 'danger' };
  }

  if (normalized === 'admin') {
    return { label: 'Admin', tone: 'primary' };
  }

  if (normalized === 'user') {
    return { label: 'User', tone: 'neutral' };
  }

  if (!normalized) {
    return { label: 'Unknown', tone: 'warning' };
  }

  return {
    label: `${normalized.slice(0, 1).toUpperCase()}${normalized.slice(1)}`,
    tone: 'warning',
  };
}

export function formatActiveState(isActive: boolean | null | undefined): BadgeState {
  return isActive ? { label: 'Aktif', tone: 'success' } : { label: 'Nonaktif', tone: 'danger' };
}

export function formatTimestamp(value: string | null | undefined): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    hour12: false,
  });
}

export function buildAdminUserIdentityKey(user: AdminIdentityInput): string | null {
  const clerkId = normalizeIdentityValue(user.clerk_id);
  if (clerkId) {
    return `clerk:${clerkId}`;
  }

  const id = normalizeIdentityValue(user.id);
  if (id) {
    return `id:${id}`;
  }

  const userId = normalizeIdentityValue(user.user_id);
  if (userId) {
    return `user_id:${userId}`;
  }

  const email = normalizeIdentityValue(user.email)?.toLowerCase();
  if (email) {
    return `email:${email}`;
  }

  const username = normalizeIdentityValue(user.username)?.toLowerCase();
  if (username) {
    return `username:${username}`;
  }

  return null;
}

function sanitizeSeconds(seconds: number | null | undefined): number {
  if (typeof seconds !== 'number' || Number.isNaN(seconds) || !Number.isFinite(seconds)) {
    return 0;
  }

  return Math.max(0, Math.floor(seconds));
}

function normalizeIdentityValue(value: unknown): string | null {
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}
