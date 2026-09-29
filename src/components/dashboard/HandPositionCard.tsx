import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDevice } from '../../hooks/useDevice';
import { useTheme } from '../../hooks/useTheme';
import { StatusCard } from '../common/StatusCard';
import { HandIcon } from '../common/SvgIcons';
import { HandState } from '../../types/device';

export const HandPositionCard: React.FC = React.memo(() => {
  const { theme } = useTheme();
  const { position, handState, settings, isMoving, movementDirection } = useDevice();

  const minAngle = settings.minimumAngle;
  const maxAngle = settings.maximumAngle;
  const angleRange = Math.max(1, maxAngle - minAngle);
  const normalizedPercent = Math.min(100, Math.max(0, ((position - minAngle) / angleRange) * 100));

  const getStateBadgeConfig = (state: HandState) => {
    switch (state) {
      case 'OPEN':
        return { color: theme.colors.servoOpen, bg: theme.colors.successDim, label: 'OPEN (0°)' };
      case 'CLOSED':
        return { color: theme.colors.secondary, bg: theme.colors.secondaryDim, label: 'CLOSED (63°)' };
      case 'OPENING':
        return { color: theme.colors.servoOpen, bg: theme.colors.successDim, label: 'OPENING ◀' };
      case 'CLOSING':
        return { color: theme.colors.secondary, bg: theme.colors.secondaryDim, label: 'CLOSING ▶' };
      case 'HOLDING':
        return { color: theme.colors.primary, bg: theme.colors.primaryDim, label: 'HOLDING' };
      case 'STOPPED':
        return { color: theme.colors.danger, bg: theme.colors.dangerDim, label: 'HALTED (STOP)' };
      case 'CALIBRATING':
        return { color: theme.colors.warning, bg: theme.colors.warningDim, label: 'CALIBRATING' };
      case 'ERROR':
      default:
        return { color: theme.colors.danger, bg: theme.colors.dangerDim, label: 'ERROR' };
    }
  };

  const badgeConfig = getStateBadgeConfig(handState);

  return (
    <StatusCard
      title="ACTUATOR POSITION"
      icon={<HandIcon size={16} color={theme.colors.primary} />}
      rightAction={
        <View
          style={[
            styles.badge,
            {
              backgroundColor: badgeConfig.bg,
              borderColor: badgeConfig.color,
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: badgeConfig.color }]}>
            {badgeConfig.label}
          </Text>
        </View>
      }
    >
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.angleContainer}>
            <Text style={[styles.angleValue, { color: theme.colors.textPrimary }]}>
              {position.toFixed(1)}
            </Text>
            <Text style={[styles.unit, { color: theme.colors.primary }]}>°</Text>
          </View>

          <View style={styles.statsCol}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                RANGE:
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                {minAngle}° - {maxAngle}°
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                SERVO:
              </Text>
              <Text
                style={[
                  styles.statValue,
                  { color: isMoving ? theme.colors.primary : theme.colors.textSecondary },
                ]}
              >
                {isMoving ? `MOVING (${movementDirection})` : 'IDLE'}
              </Text>
            </View>
          </View>
        </View>

        {/* Articulated Position Range Track */}
        <View
          style={[
            styles.trackContainer,
            { backgroundColor: theme.colors.surfaceHighlight },
          ]}
        >
          <View
            style={[
              styles.fillBar,
              {
                width: `${normalizedPercent}%`,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
          {/* Thumb marker */}
          <View
            style={[
              styles.cursorMarker,
              {
                left: `${Math.min(96, Math.max(0, normalizedPercent))}%`,
                borderColor: theme.colors.primary,
                backgroundColor: theme.colors.surfaceElevated,
              },
            ]}
          />
        </View>

        <View style={styles.labelsRow}>
          <Text style={[styles.rangeLimit, { color: theme.colors.servoOpen }]}>
            {minAngle}° (FULLY OPEN)
          </Text>
          <Text style={[styles.rangeLimit, { color: theme.colors.secondary }]}>
            {maxAngle}° (FULLY CLOSED)
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
    marginBottom: 12,
  },
  angleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  angleValue: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  unit: {
    fontSize: 24,
    fontWeight: '800',
    marginLeft: 2,
  },
  statsCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  trackContainer: {
    height: 10,
    borderRadius: 5,
    position: 'relative',
    width: '100%',
    marginBottom: 8,
    justifyContent: 'center',
  },
  fillBar: {
    height: '100%',
    borderRadius: 5,
  },
  cursorMarker: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    top: -2,
    marginLeft: -7,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeLimit: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
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
});
