import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ErrorCard } from '@/components/error-card';
import { PanelCard } from '@/components/panel-card';
import { ScreenShell } from '@/components/screen-shell';
import { StatusPill } from '@/components/status-pill';
import { createAdminApi } from '@/lib/api/admin';
import { ApiClientError, type AdminHealthResponse, type AdminRootResponse, type AdminUsersResponse } from '@/lib/api/types';
import { formatHealthState } from '@/lib/admin/formatters';
import { PrimaPalette, PrimaRadius } from '@/lib/theme/tokens';

type OverviewData = {
  root: AdminRootResponse;
  health: AdminHealthResponse;
  users: AdminUsersResponse;
};

export default function AdminOverviewScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latestRequestIdRef = useRef(0);

  const loadOverview = useCallback(async () => {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    setIsLoading(true);
    setError(null);

    const api = createAdminApi({ getToken });

    try {
      const [root, health, users] = await Promise.all([api.getAdmin(), api.getHealth(), api.getUsers()]);

      if (latestRequestIdRef.current !== requestId) {
        return;
      }

      setData({ root, health, users });
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
    void loadOverview();
  }, [loadOverview]);

  const healthState = formatHealthState({
    status: data?.health.status,
    db: data?.health.db,
  });

  return (
    <ScreenShell contentStyle={styles.content}>
      <View style={styles.hero}>
        <StatusPill label="Admin" tone="primary" />
        <Text style={styles.title}>Ringkasan admin</Text>
        <Text style={styles.subtitle}>Akses tab ini tetap role-gated oleh backend melalui probe endpoint /admin.</Text>
      </View>

      {isLoading ? (
        <PanelCard style={styles.loadingCard}>
          <ActivityIndicator color={PrimaPalette.primaryEnd} />
          <Text style={styles.body}>Menghubungkan data admin...</Text>
        </PanelCard>
      ) : null}

      {error ? <ErrorCard title="Gagal memuat ringkasan admin" message={error} onRetry={loadOverview} /> : null}

      {!isLoading && !error && data ? (
        <PanelCard style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Status konektivitas</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.body}>Probe akses admin</Text>
            <StatusPill label={data.root.status === 'ok' ? 'Connected' : 'Unknown'} tone={data.root.status === 'ok' ? 'success' : 'neutral'} />
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.body}>Health endpoint</Text>
            <StatusPill label={healthState.label} tone={healthState.tone} />
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.body}>Users endpoint</Text>
            <StatusPill label={`${data.users.length} pengguna`} tone="primary" />
          </View>
        </PanelCard>
      ) : null}

      <View style={styles.actions}>
        <Pressable onPress={() => router.push('/(tabs)/admin/health')} style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}>
          <Text style={styles.linkLabel}>Buka health snapshot</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(tabs)/admin/users')} style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}>
          <Text style={styles.linkLabel}>Buka daftar pengguna</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

function toUiError(cause: unknown): string {
  if (cause instanceof ApiClientError) {
    if (cause.kind === 'http' && typeof cause.status === 'number') {
      return `Backend merespons status ${cause.status}.`;
    }

    return cause.message;
  }

  if (cause instanceof Error) {
    return cause.message;
  }

  return 'Terjadi kesalahan tak terduga saat memuat data admin.';
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  hero: {
    gap: 8,
  },
  title: {
    color: PrimaPalette.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
  },
  subtitle: {
    color: PrimaPalette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  loadingCard: {
    alignItems: 'center',
    gap: 10,
  },
  summaryCard: {
    gap: 10,
  },
  cardTitle: {
    color: PrimaPalette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  body: {
    color: PrimaPalette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 10,
  },
  linkButton: {
    borderColor: PrimaPalette.border,
    borderRadius: PrimaRadius.card,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: PrimaPalette.surface,
  },
  linkButtonPressed: {
    opacity: 0.75,
  },
  linkLabel: {
    color: PrimaPalette.primaryEnd,
    fontSize: 14,
    fontWeight: '700',
  },
});
