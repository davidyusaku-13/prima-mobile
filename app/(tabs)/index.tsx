import { StyleSheet, Text, View } from 'react-native';

import { PanelCard } from '@/components/panel-card';
import { ScreenShell } from '@/components/screen-shell';
import { StatusPill } from '@/components/status-pill';
import { PrimaPalette } from '@/lib/theme/tokens';

export default function HomeScreen() {
  return (
    <ScreenShell contentStyle={styles.content}>
      <View style={styles.hero}>
        <StatusPill label="Aplikasi mobile" tone="primary" />
        <Text style={styles.title}>Beranda Prima</Text>
        <Text style={styles.subtitle}>
          Navigasi publik kini selaras dengan frontend: Pasien, Berita, dan Video Edukasi siap
          menampilkan konten setelah integrasi data selesai.
        </Text>
      </View>

      <PanelCard style={styles.card}>
        <Text style={styles.cardTitle}>Status rilis awal</Text>
        <Text style={styles.cardBody}>- Auth dan gating admin aktif sesuai peran.</Text>
        <Text style={styles.cardBody}>- Tiga tab publik menampilkan empty state resmi.</Text>
        <Text style={styles.cardBody}>- Data nyata akan diaktifkan bertahap di iterasi berikutnya.</Text>
      </PanelCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  hero: {
    gap: 8,
    marginTop: 4,
  },
  title: {
    color: PrimaPalette.textPrimary,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
  },
  subtitle: {
    color: PrimaPalette.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    gap: 8,
  },
  cardTitle: {
    color: PrimaPalette.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  cardBody: {
    color: PrimaPalette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
