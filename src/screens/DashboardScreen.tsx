import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDevice } from '../hooks/useDevice';
import { useTheme } from '../hooks/useTheme';
import { Header } from '../components/common/Header';
import { WarningBanner } from '../components/common/WarningBanner';
import { PrimaryStatusSummaryCard } from '../components/dashboard/PrimaryStatusSummaryCard';
import { HandVisualization } from '../components/controls/HandVisualization';
import { HandPositionCard } from '../components/dashboard/HandPositionCard';
import { EMGCard } from '../components/dashboard/EMGCard';
import { BatteryCard } from '../components/dashboard/BatteryCard';
import { ManualControls } from '../components/controls/ManualControls';
import { StatusCard } from '../components/common/StatusCard';
import { ControlButton } from '../components/common/ControlButton';
import {
  ActivityIcon,
  CompassIcon,
  HandIcon,
  SettingsIcon,
  SlidersIcon,
  TerminalIcon,
} from '../components/common/SvgIcons';

export const DashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const {
    isConnected,
    isConnecting,
    isLowBattery,
    isCriticalBattery,
    battery,
    reconnect,
    handState,
    errorMessage,
    clearError,
  } = useDevice();

  // Close the app when back button is pressed on Home Screen (Dashboard)
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Quick Navigation Shortcuts Hub */}
        <View style={styles.quickNavHub}>
          <TouchableOpacity
            style={[
              styles.navShortcut,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.surfaceBorder,
              },
            ]}
            onPress={() => navigation.navigate('Controls')}
            activeOpacity={0.7}
          >
            <HandIcon size={18} color={theme.colors.primary} />
            <Text style={[styles.navShortcutLabel, { color: theme.colors.textPrimary }]}>
              CONTROLS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navShortcut,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.surfaceBorder,
              },
            ]}
            onPress={() => navigation.navigate('Calibration')}
            activeOpacity={0.7}
          >
            <CompassIcon size={18} color={theme.colors.secondary} />
            <Text style={[styles.navShortcutLabel, { color: theme.colors.textPrimary }]}>
              CALIBRATE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navShortcut,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.surfaceBorder,
              },
            ]}
            onPress={() => navigation.navigate('Logs')}
            activeOpacity={0.7}
          >
            <TerminalIcon size={18} color={theme.colors.info} />
            <Text style={[styles.navShortcutLabel, { color: theme.colors.textPrimary }]}>
              LOGS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navShortcut,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.surfaceBorder,
              },
            ]}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <SettingsIcon size={18} color={theme.colors.warning} />
            <Text style={[styles.navShortcutLabel, { color: theme.colors.textPrimary }]}>
              SETTINGS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Connection Alert Banner */}
        {!isConnected && (
          <WarningBanner
            variant="warning"
            title="Device Disconnected"
            message="Communication with DAKSH-01 lost. Tap to reconnect."
            actionLabel={isConnecting ? 'CONNECTING...' : 'RECONNECT'}
            onAction={reconnect}
            actionLoading={isConnecting}
          />
        )}

        {/* Low / Critical Battery Banner */}
        {isConnected && isCriticalBattery && (
          <WarningBanner
            variant="critical"
            title="CRITICAL BATTERY"
            message={`Battery: ${battery}% - Actuator safety cutoff engaged.`}
          />
        )}

        {isConnected && !isCriticalBattery && isLowBattery && (
          <WarningBanner
            variant="warning"
            title="LOW BATTERY"
            message={`Battery: ${battery}%`}
          />
        )}

        {/* Emergency Stop / Error Banner */}
        {handState === 'STOPPED' && (
          <WarningBanner
            variant="danger"
            title="EMERGENCY STOP ENGAGED"
            message="Actuation was halted immediately. Select a command to resume safe operation."
          />
        )}

        {errorMessage && (
          <WarningBanner
            variant="danger"
            title="COMMUNICATION ALERT"
            message={errorMessage}
            actionLabel="DISMISS"
            onAction={clearError}
          />
        )}

        {/* Primary Status Card (Exact layout specified in PDF Section 2) */}
        <PrimaryStatusSummaryCard />

        {/* Large Interactive Bionic Hand Kinematic Display */}
        <StatusCard
          title="DAKSH-01 KINEMATICS PREVIEW"
          subtitle="Real-time multi-articulated finger flexion"
          rightAction={
            <TouchableOpacity
              style={[
                styles.cardLinkBtn,
                { backgroundColor: theme.colors.primaryDim, borderColor: theme.colors.primary },
              ]}
              onPress={() => navigation.navigate('Controls')}
              activeOpacity={0.7}
            >
              <Text style={[styles.cardLinkText, { color: theme.colors.primary }]}>
                STUDIO →
              </Text>
            </TouchableOpacity>
          }
        >
          <HandVisualization size={230} showAngleOverlay />
        </StatusCard>

        {/* Actuator Angle & Range Card */}
        <HandPositionCard />

        {/* Live EMG Oscilloscope & Biopotential Card */}
        <EMGCard />

        {/* Dual-Cell Battery & Power Telemetry */}
        <BatteryCard />

        {/* Quick Actuation Controls */}
        <StatusCard
          title="PRIMARY ACTUATION COMMANDS"
          icon={<SlidersIcon size={16} color={theme.colors.primary} />}
        >
          <ManualControls />
        </StatusCard>

        {/* Bottom Screen Jump Hub */}
        <View style={styles.bottomNavSection}>
          <ControlButton
            label="FULL CONTROL STUDIO"
            sublabel="Grip Presets, Stepper & Mode Switcher"
            icon={<HandIcon size={18} color="#FFFFFF" />}
            variant="secondary"
            size="large"
            onPress={() => navigation.navigate('Controls')}
            style={styles.bottomNavBtn}
          />

          <ControlButton
            label="ACTUATOR CALIBRATION WIZARD"
            sublabel="Set 0° Open & 63° Closed Limits"
            icon={<CompassIcon size={18} color={theme.colors.textInverse} />}
            variant="primary"
            size="large"
            onPress={() => navigation.navigate('Calibration')}
            style={styles.bottomNavBtn}
          />

          <View style={styles.bottomRowLinks}>
            <TouchableOpacity
              style={[
                styles.splitLink,
                { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.surfaceBorder },
              ]}
              onPress={() => navigation.navigate('Logs')}
              activeOpacity={0.7}
            >
              <TerminalIcon size={16} color={theme.colors.info} />
              <Text style={[styles.splitLinkText, { color: theme.colors.textPrimary }]}>
                EVENT LOGS →
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.splitLink,
                { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.surfaceBorder },
              ]}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.7}
            >
              <SettingsIcon size={16} color={theme.colors.warning} />
              <Text style={[styles.splitLinkText, { color: theme.colors.textPrimary }]}>
                SETTINGS →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  quickNavHub: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  navShortcut: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navShortcutLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardLinkBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  cardLinkText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  bottomNavSection: {
    marginTop: 6,
    gap: 10,
  },
  bottomNavBtn: {
    width: '100%',
  },
  bottomRowLinks: {
    flexDirection: 'row',
    gap: 10,
  },
  splitLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  splitLinkText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
