import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ConnectionStatus } from '../../types/device';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  status: ConnectionStatus;
  showText?: boolean;
}

export const DeviceStatusBadge: React.FC<Props> = ({ status, showText = true }) => {
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'CONNECTING' || status === 'RECONNECTING') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status, pulseAnim]);

  const getStatusConfig = () => {
    switch (status) {
      case 'CONNECTED':
        return {
          label: 'ONLINE',
          color: theme.colors.success,
          bg: theme.colors.successDim,
        };
      case 'CONNECTING':
      case 'RECONNECTING':
        return {
          label: status,
          color: theme.colors.warning,
          bg: theme.colors.warningDim,
        };
      case 'ERROR':
        return {
          label: 'LINK ERROR',
          color: theme.colors.danger,
          bg: theme.colors.dangerDim,
        };
      case 'DISCONNECTED':
      default:
        return {
          label: 'OFFLINE',
          color: theme.colors.textMuted,
          bg: theme.colors.surfaceHighlight,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          borderColor: config.color,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.dot,
          {
            backgroundColor: config.color,
            opacity: pulseAnim,
          },
        ]}
      />
      {showText && (
        <Text style={[styles.text, { color: config.color }]}>
          {config.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
