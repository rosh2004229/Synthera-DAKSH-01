import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDevice } from '../../hooks/useDevice';
import { useTheme } from '../../hooks/useTheme';
import { ControlButton } from '../common/ControlButton';
import { RefreshCwIcon, StopCircleIcon } from '../common/SvgIcons';

export const AutoModePanel: React.FC = React.memo(() => {
  const { theme } = useTheme();
  const { handState, emergencyStop, isConnected } = useDevice();

  const isStopped = handState === 'STOPPED';

  const steps = [
    { key: 'OPEN', label: '1. OPEN', angle: '0°' },
    { key: 'HOLD_OPEN', label: '2. HOLD', angle: '1.8s' },
    { key: 'CLOSE', label: '3. CLOSE', angle: '63°' },
    { key: 'HOLD_CLOSED', label: '4. HOLD', angle: '1.8s' },
  ];

  const getActiveStep = () => {
    if (handState === 'OPENING') return 0;
    if (handState === 'OPEN') return 1;
    if (handState === 'CLOSING') return 2;
    if (handState === 'CLOSED') return 3;
    return -1;
  };

  const activeIndex = getActiveStep();

  return (
    <View style={styles.container}>
      {/* Active Notice */}
      <View
        style={[
          styles.statusBanner,
          {
            backgroundColor: isStopped ? theme.colors.dangerDim : theme.colors.primaryDim,
            borderColor: isStopped ? theme.colors.danger : theme.colors.primary,
          },
        ]}
      >
        <RefreshCwIcon
          size={18}
          color={isStopped ? theme.colors.danger : theme.colors.primary}
        />
        <View style={styles.bannerTextCol}>
          <Text
            style={[
              styles.bannerTitle,
              { color: isStopped ? theme.colors.danger : theme.colors.primary },
            ]}
          >
            {isStopped ? 'AUTO CYCLE INTERRUPTED' : 'AUTO MODE ACTIVE'}
          </Text>
          <Text style={[styles.bannerDesc, { color: theme.colors.textPrimary }]}>
            {isStopped
              ? 'Movement paused by STOP command. Select Manual or re-trigger mode.'
              : 'Executing autonomous cyclic extension and flexion routines.'}
          </Text>
        </View>
      </View>

      {/* Cyclic Stepper Visualizer */}
      <View
        style={[
          styles.stepperContainer,
          {
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.surfaceBorder,
          },
        ]}
      >
        <Text style={[styles.stepperTitle, { color: theme.colors.textMuted }]}>
          AUTONOMOUS SEQUENCE CYCLE
        </Text>

        <View style={styles.stepsRow}>
          {steps.map((s, idx) => {
            const isActive = activeIndex === idx && !isStopped;
            return (
              <View
                key={s.key}
                style={[
                  styles.stepCard,
                  {
                    backgroundColor: isActive
                      ? theme.colors.primaryDim
                      : theme.colors.surfaceHighlight,
                    borderColor: isActive
                      ? theme.colors.primary
                      : theme.colors.surfaceBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: isActive
                        ? theme.colors.primary
                        : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {s.label}
                </Text>
                <Text
                  style={[
                    styles.stepAngle,
                    {
                      color: isActive
                        ? theme.colors.textPrimary
                        : theme.colors.textMuted,
                    },
                  ]}
                >
                  {s.angle}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Emergency Stop Interrupt */}
      <ControlButton
        label="INTERRUPT / EMERGENCY STOP"
        sublabel="Halt Automatic Cycle Immediately"
        icon={<StopCircleIcon size={20} color="#FFFFFF" />}
        variant="danger"
        size="emergency"
        onPress={emergencyStop}
        disabled={!isConnected}
        accessibilityLabel="Emergency Stop in Auto Mode"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bannerDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  stepperContainer: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  stepperTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stepCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  stepAngle: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    fontFamily: 'monospace',
  },
});
