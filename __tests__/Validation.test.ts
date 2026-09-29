import { validateDeviceSettings, validateCalibration } from '../src/utils/validation';
import { DEFAULT_SETTINGS } from '../src/types/settings';

describe('Validation Utility Tests', () => {
  test('Valid default settings pass validation', () => {
    const res = validateDeviceSettings(DEFAULT_SETTINGS);
    expect(res.isValid).toBe(true);
    expect(Object.keys(res.errors).length).toBe(0);
  });

  test('Rejects empty device name', () => {
    const res = validateDeviceSettings({ ...DEFAULT_SETTINGS, deviceName: '   ' });
    expect(res.isValid).toBe(false);
    expect(res.errors.deviceName).toBeDefined();
  });

  test('Rejects invalid angle limits where min >= max', () => {
    const res = validateDeviceSettings({
      ...DEFAULT_SETTINGS,
      minimumAngle: 50,
      maximumAngle: 30,
    });
    expect(res.isValid).toBe(false);
    expect(res.errors.minimumAngle).toBeDefined();
  });

  test('Rejects out-of-bounds EMG threshold', () => {
    const res = validateDeviceSettings({
      ...DEFAULT_SETTINGS,
      emgThreshold: 600,
    });
    expect(res.isValid).toBe(false);
    expect(res.errors.emgThreshold).toBeDefined();
  });

  test('Calibration validation rejects spans narrower than 15°', () => {
    const res = validateCalibration(10, 15);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Calibration range too narrow');
  });

  test('Calibration validation accepts valid range (0° to 63°)', () => {
    const res = validateCalibration(0, 63);
    expect(res.isValid).toBe(true);
  });
});
