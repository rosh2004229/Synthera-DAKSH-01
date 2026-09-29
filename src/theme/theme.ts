import { darkColors, lightColors, ThemeColors } from './colors';
import { spacing, borderRadius } from './spacing';
import { typography } from './typography';

export interface AppTheme {
  isDark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
}

export const getTheme = (isDark: boolean): AppTheme => ({
  isDark,
  colors: isDark ? darkColors : lightColors,
  spacing,
  borderRadius,
  typography,
});
