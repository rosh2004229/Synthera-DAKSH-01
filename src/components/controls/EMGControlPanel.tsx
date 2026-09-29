import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDevice } from '../../hooks/useDevice';
import { useEMGStream } from '../../hooks/useEMGStream';
import { useTheme } from '../../hooks/useTheme';
import { ControlButton } from '../common/ControlButton';
import { ActivityIcon, StopCircleIcon, ZapIcon } from '../common/SvgIcons';

export const EMGControlPanel: React.FC = React.memo(() => {
  const { theme } = useTheme();
  const { triggerContraction, emergencyStop, isConnected, isCriticalBattery } = useDevice();
  const { currentEMG, threshold, isContractionDetected } = useEMGStream();

  const isAbove = currentEMG >= threshold;
  const statusColor = isContractionDetected ? theme.colors.emgPeak : theme.colors.warning;

  return (
    <View style={styles.container}>
      {/* Active Mode Notice Banner */}
      <View
        style={[
          styles.statusBanner,
          {
            backgroundColor: theme.colors.warningDim,
            borderColor: theme.colors.warning,
          },
        ]}
      >
        <ActivityIcon size={18} color={theme.colors.warning} />
        <View style={styles.bannerTextCol}>
          <Text style={[styles.bannerTitle, { color: theme.colors.warning }]}>
            EMG CONTROL ACTIVE
          </Text>
          <Text style={[styles.bannerDesc, { color: theme.colors.textPrimary }]}>
            Hand actuation triggers when biopotential crosses threshold ({threshold} µV)
          </Text>
        </View>
      </View>

      {/* Live EMG Meter Box */}
      <View
        style={[
          styles.meterBox,
          {
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: isContractionDetected ? theme.colors.emgPeak : theme.colors.surfaceBorder,
          },
        ]}
      >
        <View style={styles.meterHeader}>
          <Text style={[styles.meterLabel, { color: theme.colors.textMuted }]}>
            LIVE SENSOR LEVEL
          </Text>
          <View
            style={[
              styles.stateTag,
              {
                backgroundColor: isContractionDetected
                  ? theme.colors.dangerDim
                  : theme.colors.surfaceHighlight,
                borderColor: statusColor,
              },
            ]}
          >
            <Text style={[styles.stateTagText, { color: statusColor }]}>
              {isContractionDetected ? 'BURST DETECTED' : isAbove ? 'ABOVE TRG' : 'IDLE / RESTING'}
            </Text>
          </View>
        </View>

        <View style={styles.meterReadout}>
          <Text style={[styles.meterVal, { color: statusColor }]}>
            {currentEMG}
          </Text>
          <Text style={[styles.meterUnit, { color: theme.colors.textSecondary }]}>
            / {threshold} µV
          </Text>
        </View>

        {/* Level indicator bar */}
        <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceHighlight }]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.min(100, (currentEMG / 350) * 100)}%`,
                backgroundColor: statusColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Contraction Simulation Trigger for Testing */}
      <ControlButton
        label="TRIGGER SIMULATED CONTRACTION"
        sublabel="Simulates 280µV Muscle Flex"
        icon={<ZapIcon size={18} color={theme.colors.textInverse} />}
        variant="primary"
        size="large"
        onPress={() => triggerContraction(280)}
        disabled={!isConnected || isCriticalBattery}
        accessibilityLabel="Trigger Simulated Muscle Contraction"
      />

      {/* Emergency Stop */}
      <ControlButton
        label="EMERGENCY STOP"
        icon={<StopCircleIcon size={20} color="#FFFFFF" />}
        variant="danger"
        size="medium"
        onPress={emergencyStop}
        disabled={!isConnected}
        accessibilityLabel="Emergency Stop in EMG Mode"
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
  meterBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  meterLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  stateTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  stateTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  meterReadout: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  meterVal: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  meterUnit: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
