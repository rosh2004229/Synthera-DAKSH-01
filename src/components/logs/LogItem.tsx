import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DeviceLog, LogType } from '../../types/logs';
import { useTheme } from '../../hooks/useTheme';
import {
  ActivityIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  CompassIcon,
  TerminalIcon,
} from '../common/SvgIcons';

interface LogItemProps {
  log: DeviceLog;
}

export const LogItem: React.FC<LogItemProps> = ({ log }) => {
  const { theme } = useTheme();

  const getTypeConfig = (type: LogType) => {
    switch (type) {
      case 'COMMAND':
        return {
          color: theme.colors.primary,
          bg: theme.colors.primaryDim,
          icon: <TerminalIcon size={14} color={theme.colors.primary} />,
        };
      case 'SENSOR':
        return {
          color: theme.colors.info,
          bg: theme.colors.infoDim,
          icon: <ActivityIcon size={14} color={theme.colors.info} />,
        };
      case 'WARNING':
        return {
          color: theme.colors.warning,
          bg: theme.colors.warningDim,
          icon: <AlertTriangleIcon size={14} color={theme.colors.warning} />,
        };
      case 'ERROR':
        return {
          color: theme.colors.danger,
          bg: theme.colors.dangerDim,
          icon: <AlertTriangleIcon size={14} color={theme.colors.danger} />,
        };
      case 'CALIBRATION':
        return {
          color: theme.colors.secondary,
          bg: theme.colors.secondaryDim,
          icon: <CompassIcon size={14} color={theme.colors.secondary} />,
        };
      case 'SYSTEM':
      default:
        return {
          color: theme.colors.success,
          bg: theme.colors.successDim,
          icon: <CheckCircleIcon size={14} color={theme.colors.success} />,
        };
    }
  };

  const config = getTypeConfig(log.type);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.surfaceBorder,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: config.bg, borderColor: config.color },
            ]}
          >
            {config.icon}
            <Text style={[styles.typeText, { color: config.color }]}>
              {log.type}
            </Text>
          </View>
          <Text style={[styles.titleText, { color: theme.colors.textPrimary }]}>
            {log.title}
          </Text>
        </View>

        <Text style={[styles.timeText, { color: theme.colors.textMuted }]}>
          {log.timestamp}
        </Text>
      </View>

      <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
        {log.description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  descText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
