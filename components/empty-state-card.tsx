import { StyleSheet, Text, View } from 'react-native';

import { PanelCard } from '@/components/panel-card';
import { StatusPill } from '@/components/status-pill';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { PublicEmptyStateIcon } from '@/lib/navigation/routes';
import { PrimaPalette, PrimaRadius, PrimaSpacing } from '@/lib/theme/tokens';

type EmptyStateCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  note: string;
  icon: PublicEmptyStateIcon;
};

export function EmptyStateCard({ eyebrow, title, description, note, icon }: EmptyStateCardProps) {
  return (
    <PanelCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <IconSymbol name={icon} size={20} color={PrimaPalette.primaryEnd} />
        </View>
        <StatusPill label="Belum tersedia" tone="primary" />
      </View>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.noteWrap}>
        <Text style={styles.note}>{note}</Text>
      </View>
    </PanelCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: PrimaPalette.statusPrimarySurface,
    borderColor: PrimaPalette.statusPrimaryBorder,
    borderRadius: PrimaRadius.pill,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  eyebrow: {
    color: PrimaPalette.primaryEnd,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    color: PrimaPalette.textPrimary,
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 28,
  },
  description: {
    color: PrimaPalette.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  noteWrap: {
    backgroundColor: PrimaPalette.backgroundWashStart,
    borderColor: PrimaPalette.border,
    borderRadius: PrimaSpacing.cardPadding - 4,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  note: {
    color: PrimaPalette.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
