import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDevice } from '../../hooks/useDevice';
import { useTheme } from '../../hooks/useTheme';
import { StatusCard } from '../common/StatusCard';
import { BatteryIcon, ZapIcon } from '../common/SvgIcons';

export const BatteryCard: React.FC = React.memo(() => {
  const { theme } = useTheme();
  const { battery, isLowBattery, isCriticalBattery, isMoving } = useDevice();

  const getBatteryColor = () => {
    if (battery <= 20) return theme.colors.batteryLow;
    if (battery <= 50) return theme.colors.batteryMid;
    return theme.colors.batteryFull;
  };

  const color = getBatteryColor();
  // Estimate runtime: ~8 hours full runtime at typical duty cycle
  const hoursRemaining = Math.max(0.1, (battery / 100) * 8.2).toFixed(1);
  const voltage = (6.6 + (battery / 100) * 1.8).toFixed(2); // 2S Li-Po: 6.6V to 8.4V

  return (
    <StatusCard
      title="BATTERY STATUS"
      icon={<BatteryIcon size={16} color={color} />}
      highlightColor={isLowBattery ? theme.colors.batteryLow : undefined}
      rightAction={
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isCriticalBattery
                ? theme.colors.dangerDim
                : isLowBattery
                ? theme.colors.warningDim
                : theme.colors.successDim,
              borderColor: color,
            },
          ]}
        >
          <Text style={[styles.badgeText, { color }]}>
            {isCriticalBattery
              ? 'CRITICAL'
              : isLowBattery
              ? 'LOW'
              : isMoving
              ? 'ACTIVE DRAIN'
              : 'NORMAL'}
          </Text>
        </View>
      }
    >
      <View style={styles.container}>
        <View style={styles.mainRow}>
          <View style={styles.valueContainer}>
            <Text style={[styles.percentage, { color }]}>{battery}</Text>
            <Text style={[styles.unit, { color: theme.colors.textSecondary }]}>%</Text>
          </View>

          <View style={styles.metricsColumn}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>
                EST. RUNTIME
              </Text>
              <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>
                ~{hoursRemaining} hrs
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>
                VOLTAGE
              </Text>
              <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>
                {voltage} V
              </Text>
            </View>
          </View>
        </View>

        {/* Linear Progress Bar */}
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: theme.colors.surfaceHighlight },
          ]}
        >
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(100, Math.max(0, battery))}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={[styles.specText, { color: theme.colors.textMuted }]}>
            Dual Cell 2S 7.4V 1800mAh
          </Text>
          <View style={styles.healthRow}>
            <ZapIcon size={12} color={color} />
            <Text style={[styles.healthText, { color }]}>Health: 98%</Text>
          </View>
        </View>
      </View>
    </StatusCard>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  percentage: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  unit: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 4,
  },
  metricsColumn: {
    alignItems: 'flex-end',
    gap: 4,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specText: {
    fontSize: 11,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  healthText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
