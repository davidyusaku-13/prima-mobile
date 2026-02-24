import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PanelCard } from '@/components/panel-card';
import { PrimaPalette, PrimaRadius } from '@/lib/theme/tokens';

type ErrorCardProps = {
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorCard({ title, message, onRetry, retryLabel = 'Coba lagi' }: ErrorCardProps) {
  return (
    <PanelCard style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <View style={styles.footer}>
          <Pressable onPress={onRetry} style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}>
            <Text style={styles.retryLabel}>{retryLabel}</Text>
          </Pressable>
        </View>
      ) : null}
    </PanelCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
  },
  title: {
    color: PrimaPalette.danger,
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    color: PrimaPalette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 6,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: PrimaPalette.statusPrimarySurface,
    borderColor: PrimaPalette.statusPrimaryBorder,
    borderRadius: PrimaRadius.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryButtonPressed: {
    opacity: 0.75,
  },
  retryLabel: {
    color: PrimaPalette.primaryEnd,
    fontSize: 13,
    fontWeight: '700',
  },
});
