import { useColorScheme } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/store';
import { getTheme, AppTheme } from '../theme/theme';
import { setThemeMode } from '../store/settingsSlice';
import { storageService } from '../storage/storage';

export const useTheme = (): {
  theme: AppTheme;
  themeMode: 'dark' | 'light' | 'system';
  isDark: boolean;
  toggleTheme: () => void;
  setMode: (mode: 'dark' | 'light' | 'system') => void;
} => {
  const dispatch = useAppDispatch();
  const systemColorScheme = useColorScheme();
  const themeMode = useAppSelector(state => state.settings.settings.themeMode);

  let isDark = true;
  if (themeMode === 'system') {
    isDark = systemColorScheme !== 'light';
  } else {
    isDark = themeMode === 'dark';
  }

  const theme = getTheme(isDark);

  const toggleTheme = () => {
    const nextMode = isDark ? 'light' : 'dark';
    dispatch(setThemeMode(nextMode));
    storageService.saveThemeMode(nextMode);
  };

  const setMode = (mode: 'dark' | 'light' | 'system') => {
    dispatch(setThemeMode(mode));
    storageService.saveThemeMode(mode);
  };

  return {
    theme,
    themeMode,
    isDark,
    toggleTheme,
    setMode,
  };
};
