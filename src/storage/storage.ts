import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceSettings, CalibrationData, DEFAULT_SETTINGS, DEFAULT_CALIBRATION } from '../types/settings';
import { DeviceLog } from '../types/logs';

const STORAGE_KEYS = {
  SETTINGS: '@synthera_settings_v1',
  CALIBRATION: '@synthera_calibration_v1',
  LOGS: '@synthera_logs_v1',
  THEME_MODE: '@synthera_theme_mode_v1',
};

export const storageService = {
  /**
   * Save device settings to persistent storage
   */
  async saveSettings(settings: DeviceSettings): Promise<boolean> {
    try {
      const json = JSON.stringify(settings);
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, json);
      return true;
    } catch (e) {
      console.warn('Failed to save settings to AsyncStorage', e);
      return false;
    }
  },

  /**
   * Load device settings from persistent storage
   */
  async loadSettings(): Promise<DeviceSettings> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (json) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
      }
    } catch (e) {
      console.warn('Failed to load settings from AsyncStorage', e);
    }
    return DEFAULT_SETTINGS;
  },

  /**
   * Save calibration data
   */
  async saveCalibration(calibration: CalibrationData): Promise<boolean> {
    try {
      const json = JSON.stringify(calibration);
      await AsyncStorage.setItem(STORAGE_KEYS.CALIBRATION, json);
      return true;
    } catch (e) {
      console.warn('Failed to save calibration to AsyncStorage', e);
      return false;
    }
  },

  /**
   * Load calibration data
   */
  async loadCalibration(): Promise<CalibrationData> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.CALIBRATION);
      if (json) {
        return { ...DEFAULT_CALIBRATION, ...JSON.parse(json) };
      }
    } catch (e) {
      console.warn('Failed to load calibration from AsyncStorage', e);
    }
    return DEFAULT_CALIBRATION;
  },

  /**
   * Save logs
   */
  async saveLogs(logs: DeviceLog[]): Promise<boolean> {
    try {
      // Keep at most 100 recent logs in local storage
      const capped = logs.slice(0, 100);
      await AsyncStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(capped));
      return true;
    } catch (e) {
      console.warn('Failed to save logs to AsyncStorage', e);
      return false;
    }
  },

  /**
   * Load logs
   */
  async loadLogs(): Promise<DeviceLog[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.LOGS);
      if (json) {
        return JSON.parse(json);
      }
    } catch (e) {
      console.warn('Failed to load logs from AsyncStorage', e);
    }
    return [];
  },

  /**
   * Clear saved logs
   */
  async clearLogs(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.LOGS);
      return true;
    } catch (e) {
      console.warn('Failed to clear logs from AsyncStorage', e);
      return false;
    }
  },

  /**
   * Save theme mode preference
   */
  async saveThemeMode(mode: 'dark' | 'light' | 'system'): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    } catch (e) {
      console.warn('Failed to save theme mode', e);
    }
  },

  /**
   * Load theme mode preference
   */
  async loadThemeMode(): Promise<'dark' | 'light' | 'system'> {
    try {
      const mode = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
      if (mode === 'light' || mode === 'dark' || mode === 'system') {
        return mode;
      }
    } catch (e) {
      console.warn('Failed to load theme mode', e);
    }
    return 'dark';
  },
};
