import { StyleSheet, Text } from 'react-native';

import { EmptyStateCard } from '@/components/empty-state-card';
import { ScreenShell } from '@/components/screen-shell';
import { PUBLIC_EMPTY_STATES } from '@/lib/navigation/routes';
import { PrimaPalette } from '@/lib/theme/tokens';

export default function PasienScreen() {
  const state = PUBLIC_EMPTY_STATES.pasien;

  return (
    <ScreenShell contentStyle={styles.content}>
      <Text style={styles.heading}>Pasien</Text>
      <EmptyStateCard {...state} icon="person.2.fill" />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  heading: {
    color: PrimaPalette.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
  },
});
