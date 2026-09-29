import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useEMGStream } from '../../hooks/useEMGStream';
import { useTheme } from '../../hooks/useTheme';
import { StatusCard } from '../common/StatusCard';
import { ActivityIcon } from '../common/SvgIcons';
import { EMGChart } from './EMGChart';

export const EMGCard: React.FC = React.memo(() => {
  const { theme } = useTheme();
  const { currentEMG, emgHistory, threshold, isContractionDetected, stats } = useEMGStream();

  const isAboveThreshold = currentEMG >= threshold;
  const emgColor = isContractionDetected || isAboveThreshold ? theme.colors.emgPeak : theme.colors.emgLine;

  return (
    <StatusCard
      title="MYOELECTRIC BIOPOTENTIAL (EMG)"
      icon={<ActivityIcon size={16} color={emgColor} />}
      highlightColor={isContractionDetected ? theme.colors.emgPeak : undefined}
      rightAction={
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isContractionDetected
                ? theme.colors.dangerDim
                : isAboveThreshold
                ? theme.colors.warningDim
                : theme.colors.primaryDim,
              borderColor: emgColor,
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: emgColor }]}>
            {isContractionDetected
              ? 'CONTRACTION SPIKE'
              : isAboveThreshold
              ? 'ABOVE THRESHOLD'
              : 'RESTING NOISE'}
          </Text>
        </View>
      }
    >
      <View style={styles.container}>
        {/* Top metrics row */}
        <View style={styles.topRow}>
          <View style={styles.valueGroup}>
            <Text style={[styles.emgValue, { color: emgColor }]}>
              {currentEMG}
            </Text>
            <Text style={[styles.emgUnit, { color: theme.colors.textSecondary }]}>
              µV
            </Text>
          </View>

          <View style={styles.statsGroup}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                THRESHOLD:
              </Text>
              <Text style={[styles.statNum, { color: theme.colors.emgThreshold }]}>
                {threshold} µV
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                PEAK (WINDOW):
              </Text>
              <Text style={[styles.statNum, { color: theme.colors.textPrimary }]}>
                {stats.peak} µV
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                SAMPLING:
              </Text>
              <Text style={[styles.statNum, { color: theme.colors.primary }]}>
                20 Hz (ESP32 ADC)
              </Text>
            </View>
          </View>
        </View>

        {/* Real-time Oscilloscope Chart */}
        <View
          style={[
            styles.chartWrapper,
            { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
          ]}
        >
          <EMGChart
            data={emgHistory}
            threshold={threshold}
            height={95}
            isContraction={isContractionDetected}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={[styles.footerNote, { color: theme.colors.textMuted }]}>
            Single-channel differential Ag/AgCl surface electrodes
          </Text>
        </View>
      </View>
    </StatusCard>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  valueGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  emgValue: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
  },
  emgUnit: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 4,
  },
  statsGroup: {
    alignItems: 'flex-end',
    gap: 3,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statNum: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  chartWrapper: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  footerNote: {
    fontSize: 10,
    fontStyle: 'italic',
  },
});
