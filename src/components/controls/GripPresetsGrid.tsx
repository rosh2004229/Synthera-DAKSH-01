import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDevice } from '../../hooks/useDevice';
import { useTheme } from '../../hooks/useTheme';
import { deviceService } from '../../services/DeviceService';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface GripPreset {
  id: string;
  name: string;
  sublabel: string;
  targetAngle: number;
  icon: (color: string) => React.ReactNode;
}

const PRESETS: GripPreset[] = [
  {
    id: 'fist',
    name: 'Fist',
    sublabel: 'Power 63°',
    targetAngle: 63,
    icon: color => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
        <Path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
        <Path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
        <Path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
      </Svg>
    ),
  },
  {
    id: 'point',
    name: 'Point',
    sublabel: 'Index 35°',
    targetAngle: 35,
    icon: color => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 2v10" />
        <Path d="M18 11v-2a2 2 0 0 0-2-2v0" />
        <Path d="M14 10V8a2 2 0 0 0-2-2v0" />
        <Path d="M18 10a2 2 0 0 1 2 2v4a8 8 0 0 1-8 8H9" />
      </Svg>
    ),
  },
  {
    id: 'pinch',
    name: 'Pinch',
    sublabel: 'Precision 45°',
    targetAngle: 45,
    icon: color => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="7" r="3" />
        <Circle cx="12" cy="17" r="3" />
        <Path d="M12 10v4" />
      </Svg>
    ),
  },
  {
    id: 'lateral',
    name: 'Lateral',
    sublabel: 'Key 25°',
    targetAngle: 25,
    icon: color => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </Svg>
    ),
  },
];

export const GripPresetsGrid: React.FC = React.memo(() => {
  const { theme } = useTheme();
  const { position, isConnected, isCriticalBattery, isMoving } = useDevice();

  const handleSelectPreset = (targetAngle: number) => {
    if (!isConnected || isCriticalBattery) return;
    deviceService.setCalibrationAngle(targetAngle);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
        GRIP PRESETS
      </Text>
      <View style={styles.grid}>
        {PRESETS.map(preset => {
          const isSelected = Math.abs(position - preset.targetAngle) < 4;
          const activeColor = theme.colors.primary;

          return (
            <TouchableOpacity
              key={preset.id}
              activeOpacity={0.75}
              onPress={() => handleSelectPreset(preset.targetAngle)}
              disabled={!isConnected || isCriticalBattery}
              style={[
                styles.card,
                {
                  backgroundColor: isSelected
                    ? theme.colors.surfaceHighlight
                    : theme.colors.surfaceElevated,
                  borderColor: isSelected ? activeColor : theme.colors.surfaceBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primaryDim
                      : 'transparent',
                  },
                ]}
              >
                {preset.icon(isSelected ? activeColor : theme.colors.textSecondary)}
              </View>
              <Text
                style={[
                  styles.presetName,
                  {
                    color: isSelected ? theme.colors.textPrimary : theme.colors.textSecondary,
                    fontWeight: isSelected ? '800' : '600',
                  },
                ]}
              >
                {preset.name}
              </Text>
              <Text
                style={[
                  styles.presetSub,
                  { color: isSelected ? activeColor : theme.colors.textMuted },
                ]}
              >
                {preset.sublabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  presetName: {
    fontSize: 11,
    letterSpacing: 0.4,
  },
  presetSub: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
    fontFamily: 'monospace',
  },
});
