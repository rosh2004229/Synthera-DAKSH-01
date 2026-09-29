import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OperatingMode } from '../../types/device';
import { useDevice } from '../../hooks/useDevice';
import { useTheme } from '../../hooks/useTheme';
import { ActivityIcon, HandIcon, RefreshCwIcon } from '../common/SvgIcons';

interface ModeSelectorProps {
  onModeChange?: (mode: OperatingMode) => void;
}

const renderModeIcon = (mode: OperatingMode, color: string) => {
  switch (mode) {
    case 'MANUAL':
      return <HandIcon size={16} color={color} />;
    case 'EMG':
      return <ActivityIcon size={16} color={color} />;
    case 'AUTO':
      return <RefreshCwIcon size={16} color={color} />;
  }
};

const MODE_CONFIGS: Array<{
  key: OperatingMode;
  label: string;
  sublabel: string;
}> = [
  {
    key: 'MANUAL',
    label: 'MANUAL',
    sublabel: 'Direct Commands',
  },
  {
    key: 'EMG',
    label: 'EMG BIO',
    sublabel: 'Muscle Trigger',
  },
  {
    key: 'AUTO',
    label: 'AUTO',
    sublabel: 'Cyclic Movement',
  },
];

export const ModeSelector: React.FC<ModeSelectorProps> = React.memo(({ onModeChange }) => {
  const { theme } = useTheme();
  const { mode, setMode, isConnected } = useDevice();

  const handleSelect = (selectedMode: OperatingMode) => {
    if (!isConnected) return;
    setMode(selectedMode);
    if (onModeChange) onModeChange(selectedMode);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.surfaceBorder,
        },
      ]}
    >
      {MODE_CONFIGS.map(item => {
        const isActive = mode === item.key;
        const activeColor =
          item.key === 'EMG'
            ? theme.colors.warning
            : item.key === 'AUTO'
            ? theme.colors.primary
            : theme.colors.success;

        return (
          <TouchableOpacity
            key={item.key}
            activeOpacity={0.8}
            onPress={() => handleSelect(item.key)}
            disabled={!isConnected}
            style={[
              styles.segment,
              isActive && [
                styles.activeSegment,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: activeColor,
                  shadowColor: activeColor,
                },
              ],
            ]}
          >
            <View style={styles.iconWrap}>
              {renderModeIcon(item.key, isActive ? activeColor : theme.colors.textMuted)}
            </View>
            <Text
              style={[
                styles.modeLabel,
                isActive ? styles.activeLabel : styles.inactiveLabel,
                {
                  color: isActive ? theme.colors.textPrimary : theme.colors.textSecondary,
                },
              ]}
            >
              {item.label}
            </Text>
            <Text
              style={[
                styles.modeSublabel,
                { color: isActive ? activeColor : theme.colors.textMuted },
              ]}
            >
              {item.sublabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  activeSegment: {
    elevation: 3,
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconWrap: {
    marginBottom: 4,
  },
  modeLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
  },
  activeLabel: {
    fontWeight: '800',
  },
  inactiveLabel: {
    fontWeight: '600',
  },
  modeSublabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
