import { Platform } from 'react-native';

import { PrimaPalette } from '@/lib/theme/tokens';

const tintColorLight = PrimaPalette.primaryStart;
const tintColorDark = '#fff';

type ThemeColorName =
  | 'text'
  | 'background'
  | 'tint'
  | 'icon'
  | 'tabIconDefault'
  | 'tabIconSelected'
  | 'surface'
  | 'border'
  | 'primary'
  | 'primaryStrong'
  | 'backgroundWashEnd';

type ThemeColorMap = Record<ThemeColorName, string>;

const lightColors: ThemeColorMap = {
  text: PrimaPalette.textPrimary,
  background: PrimaPalette.backgroundWashStart,
  tint: tintColorLight,
  icon: PrimaPalette.textMuted,
  tabIconDefault: PrimaPalette.textMuted,
  tabIconSelected: tintColorLight,
  surface: PrimaPalette.surface,
  border: PrimaPalette.border,
  primary: PrimaPalette.primaryStart,
  primaryStrong: PrimaPalette.primaryEnd,
  backgroundWashEnd: PrimaPalette.backgroundWashEnd,
};

const darkColors: ThemeColorMap = {
  text: '#ECEDEE',
  background: '#151718',
  tint: tintColorDark,
  icon: '#9BA1A6',
  tabIconDefault: '#9BA1A6',
  tabIconSelected: tintColorDark,
  surface: '#1d2125',
  border: '#2e3846',
  primary: PrimaPalette.primaryStart,
  primaryStrong: PrimaPalette.primaryEnd,
  backgroundWashEnd: '#1b1f24',
};

export const Colors = {
  light: lightColors,
  dark: darkColors,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
