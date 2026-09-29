import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  G,
  Rect,
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { useDevice } from '../../hooks/useDevice';
import { useTheme } from '../../hooks/useTheme';

interface HandVisualizationProps {
  size?: number;
  showAngleOverlay?: boolean;
}

export const HandVisualization: React.FC<HandVisualizationProps> = React.memo(({
  size = 240,
  showAngleOverlay = true,
}) => {
  const { theme } = useTheme();
  const { position, handState, settings, isMoving } = useDevice();

  const minAngle = settings.minimumAngle;
  const maxAngle = settings.maximumAngle;
  const range = Math.max(1, maxAngle - minAngle);

  // Normalized flexion factor: 0.0 (open) to 1.0 (closed)
  const flexion = Math.max(0, Math.min(1, (position - minAngle) / range));

  // Joint rotation angles derived from flexion
  // When open (0°): fingers extend straight up
  // When closed (63°): proximal joints curl inward ~45°, distal joints curl inward ~60°
  const indexProximalRot = flexion * 48;
  const indexDistalRot = flexion * 55;

  const middleProximalRot = flexion * 52;
  const middleDistalRot = flexion * 58;

  const ringProximalRot = flexion * 50;
  const ringDistalRot = flexion * 56;

  const pinkyProximalRot = flexion * 46;
  const pinkyDistalRot = flexion * 52;

  // Thumb flexes across palm towards fingers
  const thumbBaseRot = flexion * 38;
  const thumbTipRot = flexion * 45;

  const accentColor = isMoving
    ? theme.colors.primary
    : handState === 'STOPPED'
    ? theme.colors.danger
    : handState === 'OPEN'
    ? theme.colors.servoOpen
    : handState === 'CLOSED'
    ? theme.colors.secondary
    : theme.colors.primary;

  return (
    <View style={[styles.container, { height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 260 260" style={styles.svg}>
        <Defs>
          {/* Futuristic Metallic Gradients */}
          <LinearGradient id="palmGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#1E293B" />
            <Stop offset="50%" stopColor="#0F172A" />
            <Stop offset="100%" stopColor="#020617" />
          </LinearGradient>
          <LinearGradient id="fingerGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#334155" />
            <Stop offset="100%" stopColor="#1E293B" />
          </LinearGradient>
          <LinearGradient id="wristGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#0F172A" />
            <Stop offset="50%" stopColor="#1E293B" />
            <Stop offset="100%" stopColor="#0F172A" />
          </LinearGradient>
        </Defs>

        {/* Outer Circular Reference HUD */}
        <Circle
          cx="130"
          cy="130"
          r="122"
          stroke={theme.colors.surfaceBorder}
          strokeWidth="1.5"
          strokeDasharray="4,6"
          fill="none"
        />
        <Circle
          cx="130"
          cy="130"
          r="112"
          stroke={theme.colors.surfaceBorder}
          strokeWidth="0.8"
          fill="none"
        />

        {/* 1. Wrist Socket & Servo Housing */}
        <G id="wrist_assembly">
          <Rect x="85" y="195" width="90" height="48" rx="10" fill="url(#wristGrad)" stroke={theme.colors.border} strokeWidth="1.5" />
          <Rect x="95" y="222" width="70" height="15" rx="4" fill="#0B0F19" stroke={theme.colors.surfaceBorder} strokeWidth="1" />
          <Circle cx="130" cy="229" r="3" fill={accentColor} />
          {/* Technical bus tracks */}
          <Path d="M 105 200 L 105 218 M 155 200 L 155 218" stroke={theme.colors.primaryDim} strokeWidth="1.5" />
        </G>

        {/* 2. Palm Core Base */}
        <G id="palm_assembly">
          <Path
            d="M 68 140 C 68 120, 80 115, 130 115 C 180 115, 192 120, 192 140 L 186 195 L 74 195 Z"
            fill="url(#palmGrad)"
            stroke={theme.colors.border}
            strokeWidth="2"
          />
          {/* Palm carbon-fiber texture lines */}
          <Path d="M 90 140 Q 130 155 170 140" stroke={theme.colors.surfaceBorder} strokeWidth="1.2" fill="none" />
          <Path d="M 94 160 Q 130 175 166 160" stroke={theme.colors.surfaceBorder} strokeWidth="1.2" fill="none" />

          {/* Central Motor Sensor Node */}
          <Circle cx="130" cy="155" r="12" fill="#090D16" stroke={accentColor} strokeWidth="2" />
          <Circle cx="130" cy="155" r="6" fill={accentColor} opacity="0.8" />
        </G>

        {/* 3. THUMB ASSEMBLY (Left Side, flexes across palm) */}
        <G id="thumb_group" transform={`translate(74, 150) rotate(${-thumbBaseRot}, 0, 0)`}>
          {/* Thumb Metacarpal */}
          <Rect x="-12" y="-30" width="14" height="32" rx="6" fill="url(#fingerGrad)" stroke={theme.colors.border} strokeWidth="1.5" />
          <Circle cx="-5" cy="-30" r="5" fill="#090D16" stroke={accentColor} strokeWidth="1.5" />

          {/* Thumb Distal Segment */}
          <G transform={`translate(-5, -30) rotate(${-thumbTipRot}, 0, 0)`}>
            <Path d="M -6 -24 L 6 -24 L 4 0 L -4 0 Z" fill="url(#fingerGrad)" stroke={theme.colors.border} strokeWidth="1.5" />
            <Circle cx="0" cy="-22" r="3" fill={accentColor} />
          </G>
        </G>

        {/* 4. INDEX FINGER */}
        <G id="index_finger" transform={`translate(92, 115) rotate(${-indexProximalRot * 0.4}, 0, 0)`}>
          {/* Proximal joint */}
          <Circle cx="0" cy="0" r="6" fill="#090D16" stroke={accentColor} strokeWidth="1.5" />
          {/* Proximal segment */}
          <Rect x="-6" y="-38" width="12" height="38" rx="5" fill="url(#fingerGrad)" stroke={theme.colors.border} strokeWidth="1.5" />

          {/* Distal joint & segment */}
          <G transform={`translate(0, -38) rotate(${-indexDistalRot * 0.6}, 0, 0)`}>
            <Circle cx="0" cy="0" r="5" fill="#090D16" stroke={accentColor} strokeWidth="1.2" />
            <Path d="M -5 -32 L 5 -32 L 4 0 L -4 0 Z" fill="url(#fingerGrad)" stroke={theme.colors.border} strokeWidth="1.5" />
            <Circle cx="0" cy="-28" r="2.5" fill={accentColor} />
          </G>
        </G>

        {/* 5. MIDDLE FINGER */}
        <G id="middle_finger" transform={`translate(118, 112) rotate(${-middleProximalRot * 0.15}, 0, 0)`}>
          <Circle cx="0" cy="0" r="6.5" fill="#090D16" stroke={accentColor} strokeWidth="1.5" />
          <Rect x="-6.5" y="-44" width="13" height="44" rx="5" fill="url(#fingerGrad)" stroke={theme.colors.border} strokeWidth="1.5" />

          <G transform={`translate(0, -44) rotate(${-middleDistalRot * 0.7}, 0, 0)`}>
            <Circle cx="0" cy="0" r="5.5" fill="#090D16" stroke={accentColor} strokeWidth="1.2" />
            <Path d="M -5.5 -36 L 5.5 -36 L 4.5 0 L -4.5 0 Z" fill="url(#fingerGrad)" stroke={theme.colors.border} strokeWidth="1.5" />
            <Circle cx="0" cy="-32" r="2.5" fill={accentColor} />
          </G>
        </G>

        {/* 6. RING FINGER */}
        <G id="ring_finger" transform={`translate(144, 115) rotate(${ringProximalRot * 0.15}, 0, 0)`}>
          <Circle cx="0" cy="0" r="6" fill="#090D16" stroke={accentColor} strokeWidth="1.5" />
          <Rect x="-6" y="-39" width="12" height="39" rx="5" fill="url(#fingerGrad)" stroke={theme.colors.border} strokeWidth="1.5" />

          <G transform={`translate(0, -39) rotate(${ringDistalRot * 0.6}, 0, 0)`}>
            <Circle cx="0" cy="0" r="5" fill="#090D16" stroke={accentColor} strokeWidth="1.2" />
            <Path d="M -5 -33 L 5 -33 L 4 0 L -4 0 Z" fill="url(#fingerGrad)" stroke={theme.colors.border} strokeWidth="1.5" />
            <Circle cx="0" cy="-29" r="2.5" fill={accentColor} />
          </G>
        </G>

        {/* 7. PINKY / LITTLE FINGER */}
        <G id="pinky_finger" transform={`translate(168, 122) rotate(${pinkyProximalRot * 0.35}, 0, 0)`}>
          <Circle cx="0" cy="0" r="5.5" fill="#090D16" stroke={accentColor} strokeWidth="1.5" />
          <Rect x="-5.5" y="-30" width="11" height="30" rx="4" fill="url(#fingerGrad)" stroke={theme.colors.border} strokeWidth="1.5" />

          <G transform={`translate(0, -30) rotate(${pinkyDistalRot * 0.6}, 0, 0)`}>
            <Circle cx="0" cy="0" r="4.5" fill="#090D16" stroke={accentColor} strokeWidth="1.2" />
            <Path d="M -4.5 -25 L 4.5 -25 L 3.5 0 L -3.5 0 Z" fill="url(#fingerGrad)" stroke={theme.colors.border} strokeWidth="1.5" />
            <Circle cx="0" cy="-22" r="2" fill={accentColor} />
          </G>
        </G>
      </Svg>

      {/* Floating Live Telemetry HUD Overlay */}
      {showAngleOverlay && (
        <View style={styles.hudContainer}>
          <View
            style={[
              styles.statePill,
              {
                backgroundColor: theme.colors.surface,
                borderColor: accentColor,
              },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: accentColor }]} />
            <Text style={[styles.stateText, { color: theme.colors.textPrimary }]}>
              {handState}
            </Text>
            <Text style={[styles.angleHud, { color: accentColor }]}>
              {position.toFixed(1)}°
            </Text>
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  svg: {
    alignSelf: 'center',
  },
  hudContainer: {
    position: 'absolute',
    bottom: 4,
    alignItems: 'center',
  },
  statePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stateText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  angleHud: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'monospace',
    marginLeft: 2,
  },
});
