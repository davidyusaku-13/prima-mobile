import { useAuth } from '@clerk/clerk-expo';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { ErrorCard } from '@/components/error-card';
import { PanelCard } from '@/components/panel-card';
import { ScreenShell } from '@/components/screen-shell';
import { StatusPill } from '@/components/status-pill';
import { createAdminApi } from '@/lib/api/admin';
import { ApiClientError, type AdminUser } from '@/lib/api/types';
import { buildAdminUserIdentityKey, formatActiveState, formatRole } from '@/lib/admin/formatters';
import { PrimaPalette } from '@/lib/theme/tokens';

type UserListItem = {
  key: string;
  user: AdminUser;
};

export default function AdminUsersScreen() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latestRequestIdRef = useRef(0);

  const loadUsers = useCallback(async () => {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    setIsLoading(true);
    setError(null);

    const api = createAdminApi({ getToken });

    try {
      const result = await api.getUsers();

      if (latestRequestIdRef.current !== requestId) {
        return;
      }

      setUsers(Array.isArray(result) ? result : []);
    } catch (cause) {
      if (latestRequestIdRef.current !== requestId) {
        return;
      }

      setError(toUiError(cause));
    } finally {
      if (latestRequestIdRef.current !== requestId) {
        return;
      }

      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const listItems = useMemo<UserListItem[]>(() => {
    const occurrences = new Map<string, number>();

    return users.map((user) => {
      const identity = buildAdminUserIdentityKey(user);
      const baseKey = identity ?? 'unknown-user';
      const sequence = (occurrences.get(baseKey) ?? 0) + 1;
      occurrences.set(baseKey, sequence);

      const key = sequence === 1 ? baseKey : `${baseKey}#${sequence}`;
      return { key, user };
    });
  }, [users]);

  const renderUser = useCallback(({ item }: { item: UserListItem }) => {
    const role = formatRole(item.user.role);
    const active = formatActiveState(Boolean(item.user.is_active));
    const name = item.user.name || item.user.username || item.user.email || item.user.clerk_id || 'Tanpa identitas';
    const detail = item.user.email || item.user.username || item.user.clerk_id || '-';

    return (
      <PanelCard style={styles.userCard}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{name}</Text>
          <View style={styles.badges}>
            <StatusPill label={role.label} tone={role.tone} />
            <StatusPill label={active.label} tone={active.tone} />
          </View>
        </View>
        <Text style={styles.userMeta}>{detail}</Text>
      </PanelCard>
    );
  }, []);

  return (
    <ScreenShell contentStyle={styles.content}>
      <Text style={styles.title}>Pengguna admin</Text>

      {isLoading ? (
        <PanelCard style={styles.loadingCard}>
          <ActivityIndicator color={PrimaPalette.primaryEnd} />
          <Text style={styles.body}>Memuat daftar pengguna...</Text>
        </PanelCard>
      ) : null}

      {error ? <ErrorCard title="Gagal memuat pengguna" message={error} onRetry={loadUsers} /> : null}

      {!isLoading && !error ? (
        <FlatList
          data={listItems}
          keyExtractor={(item) => item.key}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <PanelCard>
              <Text style={styles.body}>Belum ada data pengguna yang dikembalikan endpoint.</Text>
            </PanelCard>
          }
        />
      ) : null}
    </ScreenShell>
  );
}

function toUiError(cause: unknown): string {
  if (cause instanceof ApiClientError) {
    return cause.message;
  }

  if (cause instanceof Error) {
    return cause.message;
  }

  return 'Terjadi kesalahan tak terduga saat memuat daftar pengguna.';
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  title: {
    color: PrimaPalette.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
  },
  loadingCard: {
    alignItems: 'center',
    gap: 10,
  },
  list: {
    gap: 10,
    paddingBottom: 80,
  },
  userCard: {
    gap: 8,
  },
  userHeader: {
    alignItems: 'flex-start',
    gap: 8,
  },
  userName: {
    color: PrimaPalette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  userMeta: {
    color: PrimaPalette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  body: {
    color: PrimaPalette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
