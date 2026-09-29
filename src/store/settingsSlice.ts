import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CalibrationData, DEFAULT_CALIBRATION, DEFAULT_SETTINGS, DeviceSettings } from '../types/settings';

export interface SettingsState {
  settings: DeviceSettings;
  calibration: CalibrationData;
  isLoaded: boolean;
}

const initialState: SettingsState = {
  settings: DEFAULT_SETTINGS,
  calibration: DEFAULT_CALIBRATION,
  isLoaded: false,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLoadedSettings: (
      state,
      action: PayloadAction<{ settings: DeviceSettings; calibration: CalibrationData }>
    ) => {
      state.settings = action.payload.settings;
      state.calibration = action.payload.calibration;
      state.isLoaded = true;
    },

    updateSettings: (state, action: PayloadAction<Partial<DeviceSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    updateCalibration: (state, action: PayloadAction<CalibrationData>) => {
      state.calibration = action.payload;
      state.settings.minimumAngle = action.payload.minimumAngle;
      state.settings.maximumAngle = action.payload.maximumAngle;
    },

    setThemeMode: (state, action: PayloadAction<'dark' | 'light' | 'system'>) => {
      state.settings.themeMode = action.payload;
    },

    resetToDefaults: state => {
      state.settings = DEFAULT_SETTINGS;
      state.calibration = DEFAULT_CALIBRATION;
    },
  },
});

export const {
  setLoadedSettings,
  updateSettings,
  updateCalibration,
  setThemeMode,
  resetToDefaults,
} = settingsSlice.actions;

export default settingsSlice.reducer;
