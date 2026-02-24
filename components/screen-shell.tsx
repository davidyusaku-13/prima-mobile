import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaPalette, PrimaSpacing } from '@/lib/theme/tokens';

type ScreenShellProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function ScreenShell({ children, style, contentStyle }: ScreenShellProps) {
  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={['top', 'left', 'right']}>
      <View pointerEvents="none" style={styles.washAccent} />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PrimaPalette.backgroundWashStart,
  },
  washAccent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 220,
    backgroundColor: PrimaPalette.backgroundWashEnd,
  },
  content: {
    flex: 1,
    gap: 12,
    paddingHorizontal: PrimaSpacing.screenHorizontal,
    paddingVertical: PrimaSpacing.screenVertical,
  },
});
