import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDevice } from '../../hooks/useDevice';
import { useTheme } from '../../hooks/useTheme';
import { StopCircleIcon } from '../common/SvgIcons';

export const PrimaryStatusSummaryCard: React.FC = React.memo(() => {
  const { theme } = useTheme();
  const {
    deviceName,
    connectionStatus,
    battery,
    position,
    handState,
    emg,
    mode,
    openHand,
    closeHand,
    emergencyStop,
    isConnected,
    isCriticalBattery,
  } = useDevice();

  const isOpening = handState === 'OPENING';
  const isClosing = handState === 'CLOSING';
  const isOpen = handState === 'OPEN';
  const isClosed = handState === 'CLOSED';
  const isDisabled = !isConnected || isCriticalBattery;

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'CONNECTED':
        return theme.colors.success;
      case 'CONNECTING':
      case 'RECONNECTING':
        return theme.colors.warning;
      case 'DISCONNECTED':
      case 'ERROR':
      default:
        return theme.colors.danger;
    }
  };

  const statusColor = getStatusColor();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.surfaceBorder,
        },
      ]}
    >
      {/* Top Brand Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.brandTitle, { color: theme.colors.primary }]}>
            SYNTHERA ROBOTICS
          </Text>
          <Text style={[styles.deviceName, { color: theme.colors.textPrimary }]}>
            {deviceName || 'DAKSH-01'}
          </Text>
        </View>

        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: theme.colors.surfaceHighlight,
              borderColor: statusColor,
            },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusLabel, { color: statusColor }]}>
            {connectionStatus === 'CONNECTED'
              ? 'Connected'
              : connectionStatus === 'CONNECTING'
              ? 'Connecting'
              : connectionStatus === 'RECONNECTING'
              ? 'Reconnecting'
              : 'Disconnected'}
          </Text>
        </View>
      </View>

      {/* Grid of Telemetry Readouts (Exact fields from PDF Section 2) */}
      <View style={[styles.grid, { borderColor: theme.colors.border }]}>
        {/* Row 1: Status & Battery */}
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>
              Status:
            </Text>
            <Text style={[styles.fieldValue, { color: statusColor }]}>
              {connectionStatus === 'CONNECTED' ? 'Connected' : connectionStatus}
            </Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>
              Battery:
            </Text>
            <Text
              style={[
                styles.fieldValue,
                {
                  color:
                    battery <= 20
                      ? theme.colors.batteryLow
                      : battery <= 50
                      ? theme.colors.batteryMid
                      : theme.colors.batteryFull,
                },
              ]}
            >
              {battery}%
            </Text>
          </View>
        </View>

        {/* Row 2: Hand Position & State */}
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>
              Hand Position:
            </Text>
            <Text style={[styles.fieldValue, { color: theme.colors.primary }]}>
              {position.toFixed(0)}°
            </Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>
              State:
            </Text>
            <Text
              style={[
                styles.fieldValue,
                {
                  color:
                    handState === 'STOPPED'
                      ? theme.colors.danger
                      : handState === 'OPEN'
                      ? theme.colors.servoOpen
                      : handState === 'CLOSED'
                      ? theme.colors.secondary
                      : theme.colors.textPrimary,
                },
              ]}
            >
              {handState}
            </Text>
          </View>
        </View>

        {/* Row 3: EMG Signal & Mode */}
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>
              EMG Signal:
            </Text>
            <Text style={[styles.fieldValue, { color: theme.colors.warning }]}>
              {emg}
            </Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>
              Mode:
            </Text>
            <Text style={[styles.fieldValue, { color: theme.colors.textPrimary }]}>
              {mode}
            </Text>
          </View>
        </View>
      </View>

      {/* Direct [ OPEN ] [ CLOSE ] [ STOP ] Action Row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={openHand}
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.colors.servoOpenDim,
              borderColor: theme.colors.servoOpen,
            },
          ]}
          accessibilityLabel="Open Hand"
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.servoOpen }]}>
            OPEN
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={closeHand}
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.colors.secondaryDim,
              borderColor: theme.colors.secondary,
            },
          ]}
          accessibilityLabel="Close Hand"
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.secondary }]}>
            CLOSE
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={emergencyStop}
          style={[
            styles.actionButton,
            styles.stopButton,
            {
              backgroundColor: theme.colors.danger,
              borderColor: theme.colors.danger,
            },
          ]}
          accessibilityLabel="Emergency Stop"
        >
          <StopCircleIcon size={16} color="#FFFFFF" />
          <Text style={[styles.actionButtonText, styles.stopButtonText]}>
            STOP
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  brandTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  deviceName: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  grid: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 8,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  stopButton: {
    flex: 1.2,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
});
