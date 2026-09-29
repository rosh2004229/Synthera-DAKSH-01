import { DeviceSettings } from '../types/settings';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateDeviceSettings = (settings: DeviceSettings): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!settings.deviceName || settings.deviceName.trim().length === 0) {
    errors.deviceName = 'Device name cannot be empty';
  }

  if (isNaN(settings.minimumAngle) || settings.minimumAngle < 0) {
    errors.minimumAngle = 'Min angle must be ≥ 0°';
  }

  if (isNaN(settings.maximumAngle) || settings.maximumAngle > 90) {
    errors.maximumAngle = 'Max angle must be ≤ 90°';
  }

  if (settings.minimumAngle >= settings.maximumAngle) {
    errors.minimumAngle = 'Min angle must be strictly less than Max angle';
    errors.maximumAngle = 'Max angle must be strictly greater than Min angle';
  }

  if (isNaN(settings.emgThreshold) || settings.emgThreshold < 50 || settings.emgThreshold > 450) {
    errors.emgThreshold = 'EMG threshold must be between 50 µV and 450 µV';
  }

  if (
    isNaN(settings.batteryWarningThreshold) ||
    settings.batteryWarningThreshold < 5 ||
    settings.batteryWarningThreshold > 50
  ) {
    errors.batteryWarningThreshold = 'Warning threshold must be between 5% and 50%';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCalibration = (
  minAngle: number,
  maxAngle: number
): { isValid: boolean; error?: string } => {
  if (isNaN(minAngle) || minAngle < 0) {
    return { isValid: false, error: 'Open position angle must be ≥ 0°' };
  }
  if (isNaN(maxAngle) || maxAngle > 90) {
    return { isValid: false, error: 'Closed position angle must be ≤ 90°' };
  }
  if (minAngle >= maxAngle) {
    return {
      isValid: false,
      error: `Invalid calibration: Open angle (${minAngle}°) must be less than Closed angle (${maxAngle}°)`,
    };
  }
  if (maxAngle - minAngle < 15) {
    return {
      isValid: false,
      error: 'Calibration range too narrow: Minimum span of 15° required for safe grip mechanics',
    };
  }
  return { isValid: true };
};
