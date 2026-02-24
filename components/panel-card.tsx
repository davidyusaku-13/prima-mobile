import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { PrimaPalette, PrimaRadius, PrimaSemantic, PrimaSpacing } from '@/lib/theme/tokens';

type PanelCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function PanelCard({ children, style }: PanelCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PrimaPalette.surface,
    borderColor: PrimaPalette.border,
    borderRadius: PrimaRadius.card,
    borderWidth: 1,
    padding: PrimaSpacing.cardPadding,
    shadowColor: PrimaSemantic.panel.shadowColor,
    shadowOpacity: PrimaSemantic.panel.shadowOpacity,
    shadowRadius: PrimaSemantic.panel.shadowRadius,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
});
