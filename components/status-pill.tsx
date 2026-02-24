import { StyleSheet, Text, View } from 'react-native';

import { PrimaRadius, PrimaSemantic } from '@/lib/theme/tokens';

type StatusTone = keyof typeof PrimaSemantic.statusPill;

type StatusPillProps = {
  label: string;
  tone?: StatusTone;
};

const toneStyles = PrimaSemantic.statusPill;

export function StatusPill({ label, tone = 'neutral' }: StatusPillProps) {
  const palette = toneStyles[tone];

  return (
    <View style={[styles.pill, { backgroundColor: palette.backgroundColor, borderColor: palette.borderColor }]}>
      <Text style={[styles.text, { color: palette.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: PrimaRadius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
