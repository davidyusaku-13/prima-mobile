import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { StyleSheet, View } from 'react-native';

import { PrimaPalette } from '@/lib/theme/tokens';

export function HapticTab(props: BottomTabBarButtonProps) {
  const isActive = Boolean(props.accessibilityState?.selected);

  return (
    <PlatformPressable
      {...props}
      style={[styles.button, props.style]}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}>
      <View style={[styles.chip, isActive && styles.chipActive]}>{props.children}</View>
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: 16,
    marginHorizontal: 6,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginVertical: 4,
  },
  chipActive: {
    backgroundColor: PrimaPalette.statusPrimarySurface,
    borderWidth: 1,
    borderColor: PrimaPalette.statusPrimaryBorder,
  },
});
