import { OperatingMode } from './device';

export interface DeviceSettings {
  deviceName: string;
  minimumAngle: number; // Default 0
  maximumAngle: number; // Default 63
  emgThreshold: number; // Default 120
  batteryWarningThreshold: number; // Default 20
  operatingMode: OperatingMode;
  speedDegreesPerSecond: number; // Default 45 deg/sec
  themeMode: 'dark' | 'light' | 'system';
}

export interface CalibrationData {
  minimumAngle: number;
  maximumAngle: number;
  calibratedAt: string | null;
  isValid: boolean;
}

export const DEFAULT_SETTINGS: DeviceSettings = {
  deviceName: 'DAKSH-01',
  minimumAngle: 0,
  maximumAngle: 63,
  emgThreshold: 120,
  batteryWarningThreshold: 20,
  operatingMode: 'MANUAL',
  speedDegreesPerSecond: 45,
  themeMode: 'dark',
};

export const DEFAULT_CALIBRATION: CalibrationData = {
  minimumAngle: 0,
  maximumAngle: 63,
  calibratedAt: null,
  isValid: true,
};
