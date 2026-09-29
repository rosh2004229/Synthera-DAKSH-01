import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDevice } from '../hooks/useDevice';
import { useTheme } from '../hooks/useTheme';
import { deviceService } from '../services/DeviceService';
import { Header } from '../components/common/Header';
import { StatusCard } from '../components/common/StatusCard';
import { HandVisualization } from '../components/controls/HandVisualization';
import { KinematicArcGauge } from '../components/controls/KinematicArcGauge';
import { GripPresetsGrid } from '../components/controls/GripPresetsGrid';
import { ModeSelector } from '../components/controls/ModeSelector';
import { ManualControls } from '../components/controls/ManualControls';
import { EMGControlPanel } from '../components/controls/EMGControlPanel';
import { AutoModePanel } from '../components/controls/AutoModePanel';
import { WarningBanner } from '../components/common/WarningBanner';
import { CompassIcon, SlidersIcon } from '../components/common/SvgIcons';

export const ControlsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { mode, isConnected, isConnecting, reconnect, position, settings } = useDevice();

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

  const handleNudge = (delta: number) => {
    if (!isConnected) return;
    const nextAngle = Math.max(0, Math.min(settings.maximumAngle, position + delta));
    deviceService.setCalibrationAngle(nextAngle);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header subtitle="CONTROL STUDIO" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!isConnected && (
          <WarningBanner
            variant="warning"
            title="DEVICE OFFLINE"
            message="Connect to DAKSH-01 to transmit actuation commands."
            actionLabel={isConnecting ? 'CONNECTING...' : 'RECONNECT'}
            onAction={reconnect}
            actionLoading={isConnecting}
          />
        )}

        {/* Live Actuation Monitor with Kinematics Arc Gauge & Bionic Hand */}
        <StatusCard title="LIVE ACTUATION MONITOR" subtitle="Real-time joint flexion and angular gauge">
          <View style={styles.monitorRow}>
            <View style={styles.gaugeWrap}>
              <KinematicArcGauge
                angle={position}
                minAngle={settings.minimumAngle}
                maxAngle={settings.maximumAngle}
                size={180}
                label="Grip Force"
              />
            </View>
            <View style={styles.handWrap}>
              <HandVisualization size={180} showAngleOverlay={false} />
            </View>
          </View>
        </StatusCard>

        {/* Tactile Grip Presets */}
        <StatusCard title="TACTILE GRIP COMMANDS">
          <GripPresetsGrid />

          {/* Micro Nudge Stepper */}
          <View style={styles.nudgeContainer}>
            <Text style={[styles.nudgeLabel, { color: theme.colors.textMuted }]}>
              FINE ANGLE STEPPER:
            </Text>
            <View style={styles.nudgeButtons}>
              <TouchableOpacity
                style={[styles.nudgeBtn, { backgroundColor: theme.colors.surfaceHighlight }]}
                onPress={() => handleNudge(-5)}
                disabled={!isConnected}
              >
                <Text style={[styles.nudgeText, { color: theme.colors.textPrimary }]}>-5°</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nudgeBtn, { backgroundColor: theme.colors.surfaceHighlight }]}
                onPress={() => handleNudge(-1)}
                disabled={!isConnected}
              >
                <Text style={[styles.nudgeText, { color: theme.colors.textPrimary }]}>-1°</Text>
              </TouchableOpacity>

              <View
                style={[
                  styles.angleBadge,
                  { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.primary },
                ]}
              >
                <Text style={[styles.angleBadgeVal, { color: theme.colors.primary }]}>
                  {position.toFixed(1)}°
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.nudgeBtn, { backgroundColor: theme.colors.surfaceHighlight }]}
                onPress={() => handleNudge(1)}
                disabled={!isConnected}
              >
                <Text style={[styles.nudgeText, { color: theme.colors.textPrimary }]}>+1°</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nudgeBtn, { backgroundColor: theme.colors.surfaceHighlight }]}
                onPress={() => handleNudge(5)}
                disabled={!isConnected}
              >
                <Text style={[styles.nudgeText, { color: theme.colors.textPrimary }]}>+5°</Text>
              </TouchableOpacity>
            </View>
          </View>
        </StatusCard>

        {/* Operating Mode Deck */}
        <StatusCard
          title="OPERATING MODE SELECTOR"
          subtitle="Choose between Direct Manual, Myoelectric EMG, or Cyclic Auto"
          icon={<SlidersIcon size={16} color={theme.colors.primary} />}
        >
          <ModeSelector />

          {mode === 'MANUAL' && <ManualControls />}
          {mode === 'EMG' && <EMGControlPanel />}
          {mode === 'AUTO' && <AutoModePanel />}
        </StatusCard>

        {/* Quick Launch Calibration Wizard */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.calibBanner,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.secondary,
            },
          ]}
          onPress={() => navigation.navigate('Calibration')}
        >
          <View style={styles.calibLeft}>
            <View
              style={[
                styles.calibIconWrap,
                { backgroundColor: theme.colors.secondaryDim },
              ]}
            >
              <CompassIcon size={22} color={theme.colors.secondary} />
            </View>
            <View style={styles.calibTextGroup}>
              <Text style={[styles.calibTitle, { color: theme.colors.textPrimary }]}>
                ACTUATOR CALIBRATION WIZARD
              </Text>
              <Text style={[styles.calibSubtitle, { color: theme.colors.textMuted }]}>
                Configure Open (0°) & Closed (63°) physical mechanical limits
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.calibArrow,
              { backgroundColor: theme.colors.surfaceHighlight },
            ]}
          >
            <Text style={[styles.arrowText, { color: theme.colors.secondary }]}>
              START ▶
            </Text>
          </View>
        </TouchableOpacity>

        {/* Quick Screen Switcher Row */}
        <View style={styles.screenSwitchRow}>
          <TouchableOpacity
            style={[
              styles.switchBtn,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.surfaceBorder },
            ]}
            onPress={() => navigation.navigate('Dashboard')}
            activeOpacity={0.7}
          >
            <Text style={[styles.switchBtnText, { color: theme.colors.textPrimary }]}>
              ← DASHBOARD
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.switchBtn,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.surfaceBorder },
            ]}
            onPress={() => navigation.navigate('Logs')}
            activeOpacity={0.7}
          >
            <Text style={[styles.switchBtnText, { color: theme.colors.info }]}>
              LOGS →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.switchBtn,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.surfaceBorder },
            ]}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Text style={[styles.switchBtnText, { color: theme.colors.warning }]}>
              SETTINGS →
            </Text>
          </TouchableOpacity>
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
  monitorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  gaugeWrap: {
    flex: 1,
    alignItems: 'center',
  },
  handWrap: {
    flex: 1,
    alignItems: 'center',
  },
  nudgeContainer: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  nudgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  nudgeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  nudgeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  angleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  angleBadgeVal: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  calibBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 4,
  },
  calibLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  calibIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  calibTextGroup: {
    flex: 1,
  },
  calibTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  calibSubtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  calibArrow: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  arrowText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  screenSwitchRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchBtnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
