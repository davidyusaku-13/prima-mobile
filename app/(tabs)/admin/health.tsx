import { useAuth } from '@clerk/clerk-expo';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ErrorCard } from '@/components/error-card';
import { PanelCard } from '@/components/panel-card';
import { ScreenShell } from '@/components/screen-shell';
import { StatusPill } from '@/components/status-pill';
import { createAdminApi } from '@/lib/api/admin';
import { ApiClientError, type AdminHealthResponse } from '@/lib/api/types';
import { formatHealthState, formatTimestamp, formatUptime } from '@/lib/admin/formatters';
import { PrimaPalette } from '@/lib/theme/tokens';

export default function AdminHealthScreen() {
  const { getToken } = useAuth();
  const [health, setHealth] = useState<AdminHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latestRequestIdRef = useRef(0);
  const getTokenRef = useRef(getToken);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const loadHealth = useCallback(async () => {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    setIsLoading(true);
    setError(null);

    const api = createAdminApi({
      getToken: () => getTokenRef.current(),
    });

    try {
      const snapshot = await api.getHealth();

      if (latestRequestIdRef.current !== requestId) {
        return;
      }

      setHealth(snapshot);
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
  }, []);

  useEffect(() => {
    void loadHealth();
  }, [loadHealth]);

  const healthState = formatHealthState({ status: health?.status, db: health?.db });

  return (
    <ScreenShell contentStyle={styles.content}>
      <Text style={styles.title}>Backend health</Text>

      {isLoading ? (
        <PanelCard style={styles.loadingCard}>
          <ActivityIndicator color={PrimaPalette.primaryEnd} />
          <Text style={styles.body}>Memuat snapshot kesehatan backend...</Text>
        </PanelCard>
      ) : null}

      {error ? <ErrorCard title="Gagal memuat health" message={error} onRetry={loadHealth} /> : null}

      {!isLoading && !error && health ? (
        <PanelCard style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.label}>Status layanan</Text>
            <StatusPill label={healthState.label} tone={healthState.tone} />
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.label}>Database</Text>
            <StatusPill label={health.db === 'up' ? 'Up' : health.db === 'down' ? 'Down' : 'Unknown'} tone={health.db === 'up' ? 'success' : health.db === 'down' ? 'danger' : 'neutral'} />
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.label}>Uptime</Text>
            <Text style={styles.value}>{formatUptime(health.uptime_seconds)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.label}>Started at</Text>
            <Text style={styles.value}>{formatTimestamp(health.started_at)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.label}>Checked at</Text>
            <Text style={styles.value}>{formatTimestamp(health.checked_at)}</Text>
          </View>
        </PanelCard>
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

  return 'Terjadi kesalahan tak terduga saat memuat health backend.';
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
  card: {
    gap: 10,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaRow: {
    gap: 4,
  },
  label: {
    color: PrimaPalette.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  value: {
    color: PrimaPalette.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  body: {
    color: PrimaPalette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
