import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/store';
import { useTheme } from '../hooks/useTheme';
import { useDevice } from '../hooks/useDevice';
import { updateSettings, resetToDefaults } from '../store/settingsSlice';
import { storageService } from '../storage/storage';
import { deviceService } from '../services/DeviceService';
import { validateDeviceSettings } from '../utils/validation';
import { Header } from '../components/common/Header';
import { StatusCard } from '../components/common/StatusCard';
import { SettingRow } from '../components/settings/SettingRow';
import { ControlButton } from '../components/common/ControlButton';
import {
  BluetoothIcon,
  BluetoothOffIcon,
  CheckCircleIcon,
  CompassIcon,
  HandIcon,
  MoonIcon,
  SlidersIcon,
  SunIcon,
  TerminalIcon,
  ZapIcon,
} from '../components/common/SvgIcons';
import { DEFAULT_SETTINGS, DeviceSettings } from '../types/settings';
import { addLog } from '../store/logsSlice';

export const SettingsScreen: React.FC = () => {
  const { theme, isDark, setMode } = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const {
    isConnected,
    disconnect,
    reconnect,
    resetDevice,
    triggerContraction,
    temperature,
    firmwareVersion,
    uptimeSeconds,
  } = useDevice();
  const currentSettings = useAppSelector(state => state.settings.settings);

  // Handle hardware phone back button -> move to previous screen or Home
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        }
        navigation.navigate('Dashboard');
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  const [form, setForm] = useState<DeviceSettings>({ ...currentSettings });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleFieldChange = (key: keyof DeviceSettings, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSave = async () => {
    const validation = validateDeviceSettings(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      Alert.alert('Validation Error', 'Please correct the highlighted parameter errors.');
      return;
    }

    dispatch(updateSettings(form));
    deviceService.syncSettings(form);
    await storageService.saveSettings(form);

    dispatch(
      addLog(
        'SYSTEM',
        'Settings Updated',
        `Device parameters saved: EMG Trg ${form.emgThreshold}µV, Span ${form.minimumAngle}°-${form.maximumAngle}°`
      )
    );

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Reset all device parameters back to factory defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setForm({ ...DEFAULT_SETTINGS });
            setErrors({});
            dispatch(resetToDefaults());
            deviceService.syncSettings(DEFAULT_SETTINGS);
            await storageService.saveSettings(DEFAULT_SETTINGS);
            dispatch(addLog('SYSTEM', 'Factory Reset', 'Device parameters restored to factory defaults'));
          },
        },
      ]
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header subtitle="DEVICE SETTINGS" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Device Parameters Form */}
        <StatusCard
          title="MECHANICAL & BIOPOTENTIAL PARAMETERS"
          icon={<SlidersIcon size={16} color={theme.colors.primary} />}
        >
          <SettingRow
            label="Device Identifier"
            description="Bionic prosthesis hardware broadcast name"
            value={form.deviceName}
            onChangeText={t => handleFieldChange('deviceName', t)}
            error={errors.deviceName}
          />

          <SettingRow
            label="Minimum Angle (Open)"
            description="Actuator angle at full finger extension (0° to 20°)"
            value={form.minimumAngle}
            unit="°"
            keyboardType="numeric"
            onChangeText={t => handleFieldChange('minimumAngle', parseFloat(t) || 0)}
            onIncrement={() => handleFieldChange('minimumAngle', Math.min(form.maximumAngle - 1, form.minimumAngle + 1))}
            onDecrement={() => handleFieldChange('minimumAngle', Math.max(0, form.minimumAngle - 1))}
            error={errors.minimumAngle}
          />

          <SettingRow
            label="Maximum Angle (Closed)"
            description="Actuator angle at maximum grip flexion (40° to 90°)"
            value={form.maximumAngle}
            unit="°"
            keyboardType="numeric"
            onChangeText={t => handleFieldChange('maximumAngle', parseFloat(t) || 0)}
            onIncrement={() => handleFieldChange('maximumAngle', Math.min(90, form.maximumAngle + 1))}
            onDecrement={() => handleFieldChange('maximumAngle', Math.max(form.minimumAngle + 1, form.maximumAngle - 1))}
            error={errors.maximumAngle}
          />

          <SettingRow
            label="EMG Trigger Threshold"
            description="Microvolt (µV) spike required to activate bionic grasp"
            value={form.emgThreshold}
            unit="µV"
            keyboardType="numeric"
            onChangeText={t => handleFieldChange('emgThreshold', parseInt(t, 10) || 0)}
            onIncrement={() => handleFieldChange('emgThreshold', Math.min(450, form.emgThreshold + 10))}
            onDecrement={() => handleFieldChange('emgThreshold', Math.max(50, form.emgThreshold - 10))}
            error={errors.emgThreshold}
          />

          <SettingRow
            label="Battery Low Alert Threshold"
            description="State-of-charge percentage to trigger warning banner"
            value={form.batteryWarningThreshold}
            unit="%"
            keyboardType="numeric"
            onChangeText={t => handleFieldChange('batteryWarningThreshold', parseInt(t, 10) || 0)}
            onIncrement={() => handleFieldChange('batteryWarningThreshold', Math.min(50, form.batteryWarningThreshold + 5))}
            onDecrement={() => handleFieldChange('batteryWarningThreshold', Math.max(5, form.batteryWarningThreshold - 5))}
            error={errors.batteryWarningThreshold}
          />

          <SettingRow
            label="Servo Actuator Velocity"
            description="Angular rotation speed in degrees per second"
            value={form.speedDegreesPerSecond}
            unit="°/s"
            keyboardType="numeric"
            onChangeText={t => handleFieldChange('speedDegreesPerSecond', parseInt(t, 10) || 45)}
            onIncrement={() => handleFieldChange('speedDegreesPerSecond', Math.min(90, form.speedDegreesPerSecond + 5))}
            onDecrement={() => handleFieldChange('speedDegreesPerSecond', Math.max(15, form.speedDegreesPerSecond - 5))}
          />

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <ControlButton
              label={saveSuccess ? 'SETTINGS SAVED ✓' : 'SAVE SETTINGS'}
              icon={saveSuccess ? <CheckCircleIcon size={18} color="#080C14" /> : undefined}
              variant={saveSuccess ? 'success' : 'primary'}
              size="large"
              onPress={handleSave}
              style={styles.flexBtn}
            />

            <ControlButton
              label="RESET DEFAULTS"
              variant="ghost"
              size="large"
              onPress={handleReset}
              style={styles.flexBtn}
            />
          </View>
        </StatusCard>

        {/* UI Theme Customization */}
        <StatusCard
          title="APPLICATION THEME"
          subtitle="Select visual appearance for high-contrast visibility"
        >
          <View style={styles.themeSelectorRow}>
            <TouchableOpacity
              style={[
                styles.themeCard,
                {
                  backgroundColor: theme.colors.surfaceElevated,
                  borderColor: isDark ? theme.colors.primary : theme.colors.surfaceBorder,
                },
              ]}
              onPress={() => setMode('dark')}
            >
              <MoonIcon size={20} color={isDark ? theme.colors.primary : theme.colors.textMuted} />
              <Text
                style={[
                  styles.themeCardLabel,
                  { color: isDark ? theme.colors.textPrimary : theme.colors.textSecondary },
                ]}
              >
                Dark Cyber (Default)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeCard,
                {
                  backgroundColor: theme.colors.surfaceElevated,
                  borderColor: !isDark ? theme.colors.primary : theme.colors.surfaceBorder,
                },
              ]}
              onPress={() => setMode('light')}
            >
              <SunIcon size={20} color={!isDark ? theme.colors.primary : theme.colors.textMuted} />
              <Text
                style={[
                  styles.themeCardLabel,
                  { color: !isDark ? theme.colors.textPrimary : theme.colors.textSecondary },
                ]}
              >
                Light Clean
              </Text>
            </TouchableOpacity>
          </View>
        </StatusCard>

        {/* Diagnostic Simulator Controls */}
        <StatusCard
          title="SIMULATED HARDWARE TEST BENCH"
          subtitle="Test corner cases, disconnects, power resets, and signal spikes"
          icon={<TerminalIcon size={16} color={theme.colors.secondary} />}
        >
          <View style={styles.diagGrid}>
            <ControlButton
              label={isConnected ? 'SIMULATE DISCONNECT' : 'SIMULATE RECONNECT'}
              icon={
                isConnected ? (
                  <BluetoothOffIcon size={16} color="#FFFFFF" />
                ) : (
                  <BluetoothIcon size={16} color="#FFFFFF" />
                )
              }
              variant={isConnected ? 'danger' : 'success'}
              size="medium"
              onPress={isConnected ? disconnect : reconnect}
            />

            <ControlButton
              label="RESET BATTERY (100%)"
              icon={<ZapIcon size={16} color="#FFFFFF" />}
              variant="secondary"
              size="medium"
              onPress={resetDevice}
            />

            <ControlButton
              label="TRIGGER EMG BURST (350µV)"
              icon={<ZapIcon size={16} color={theme.colors.textInverse} />}
              variant="primary"
              size="medium"
              onPress={() => triggerContraction(350)}
              disabled={!isConnected}
            />
          </View>
        </StatusCard>

        {/* Firmware & Hardware System Information */}
        <StatusCard title="HARDWARE & FIRMWARE METADATA">
          <View style={styles.metaList}>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
                MANUFACTURER:
              </Text>
              <Text style={[styles.metaVal, { color: theme.colors.textPrimary }]}>
                Synthera Robotics Pvt. Ltd.
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
                PROSTHESIS MODEL:
              </Text>
              <Text style={[styles.metaVal, { color: theme.colors.primary }]}>
                DAKSH-01 (Bionic Hand)
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
                CORE MCU:
              </Text>
              <Text style={[styles.metaVal, { color: theme.colors.textPrimary }]}>
                Espressif ESP32-WROOM-32E (Simulated)
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
                FIRMWARE VERSION:
              </Text>
              <Text style={[styles.metaVal, { color: theme.colors.textPrimary }]}>
                {firmwareVersion}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
                INTERNAL TEMP:
              </Text>
              <Text style={[styles.metaVal, { color: theme.colors.textPrimary }]}>
                {temperature}°C
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
                SIMULATOR UPTIME:
              </Text>
              <Text style={[styles.metaVal, { color: theme.colors.textPrimary }]}>
                {Math.floor(uptimeSeconds / 60)}m {uptimeSeconds % 60}s
              </Text>
            </View>
          </View>
        </StatusCard>

        {/* Quick Screen Navigation Hub */}
        <StatusCard
          title="QUICK NAVIGATION HUB"
          subtitle="Direct links to prosthesis features"
        >
          <View style={styles.navGrid}>
            <ControlButton
              label="CALIBRATION WIZARD"
              sublabel="Calibrate Open/Close Angles"
              icon={<CompassIcon size={16} color={theme.colors.textInverse} />}
              variant="primary"
              size="medium"
              onPress={() => navigation.navigate('Calibration')}
            />

            <ControlButton
              label="CONTROL STUDIO"
              sublabel="Direct Motor Actuation"
              icon={<HandIcon size={16} color="#FFFFFF" />}
              variant="secondary"
              size="medium"
              onPress={() => navigation.navigate('Controls')}
            />

            <ControlButton
              label="EVENT LOGS"
              sublabel="Telemetry & Sensor Events"
              icon={<TerminalIcon size={16} color={theme.colors.info} />}
              variant="ghost"
              size="medium"
              onPress={() => navigation.navigate('Logs')}
            />

            <ControlButton
              label="DASHBOARD OVERVIEW"
              sublabel="Main Status & Readouts"
              variant="ghost"
              size="medium"
              onPress={() => navigation.navigate('Dashboard')}
            />
          </View>
        </StatusCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  flexBtn: {
    flex: 1,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  themeCardLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  diagGrid: {
    gap: 8,
  },
  metaList: {
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  navGrid: {
    gap: 10,
  },
});
