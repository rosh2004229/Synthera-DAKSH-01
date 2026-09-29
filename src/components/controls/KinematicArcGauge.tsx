import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface KinematicArcGaugeProps {
  angle: number;
  minAngle?: number;
  maxAngle?: number;
  size?: number;
  label?: string;
  unit?: string;
  showPercent?: boolean;
}

export const KinematicArcGauge: React.FC<KinematicArcGaugeProps> = React.memo(({
  angle,
  minAngle = 0,
  maxAngle = 63,
  size = 200,
  label = 'Hand opening',
  unit = '°',
  showPercent = true,
}) => {
  const { theme } = useTheme();

  const radius = size * 0.4;
  const strokeWidth = 14;
  const center = size / 2;

  // Gauge spans 240 degrees (from 150° to 390° / 30°)
  const startAngleDeg = 150;
  const totalSweepDeg = 240;

  const range = Math.max(1, maxAngle - minAngle);
  const clampedAngle = Math.max(minAngle, Math.min(maxAngle, angle));
  const progressRatio = (clampedAngle - minAngle) / range;
  const percent = Math.round(progressRatio * 100);

  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, startAngle: number, sweepAngle: number) => {
    const endAngle = startAngle + sweepAngle;
    const start = polarToCartesian(x, y, r, endAngle);
    const end = polarToCartesian(x, y, r, startAngle);
    const largeArcFlag = sweepAngle <= 180 ? '0' : '1';

    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const backgroundArcD = describeArc(center, center, radius, startAngleDeg, totalSweepDeg);
  const activeArcD =
    progressRatio > 0.005
      ? describeArc(center, center, radius, startAngleDeg, Math.max(2, totalSweepDeg * progressRatio))
      : '';

  // Active thumb needle position
  const needleAngle = startAngleDeg + totalSweepDeg * progressRatio;
  const needlePos = polarToCartesian(center, center, radius, needleAngle);

  return (
    <View style={[styles.container, { width: size, height: size * 0.9 }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="arcGlowGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={theme.colors.primary} />
            <Stop offset="70%" stopColor="#00F0FF" />
            <Stop offset="100%" stopColor={theme.colors.success} />
          </LinearGradient>
        </Defs>

        {/* Outer subtle decorative dashed ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius + 12}
          stroke={theme.colors.surfaceBorder}
          strokeWidth="1"
          strokeDasharray="3,5"
          fill="none"
        />

        {/* Background Inactive Arc Track */}
        <Path
          d={backgroundArcD}
          fill="none"
          stroke={theme.colors.surfaceHighlight}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Active Illuminated Progress Arc */}
        {activeArcD ? (
          <Path
            d={activeArcD}
            fill="none"
            stroke="url(#arcGlowGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        ) : null}

        {/* Active Pulse Marker */}
        <G>
          <Circle
            cx={needlePos.x}
            cy={needlePos.y}
            r={strokeWidth * 0.65}
            fill={theme.colors.surfaceElevated}
            stroke={theme.colors.primary}
            strokeWidth="3"
          />
          <Circle
            cx={needlePos.x}
            cy={needlePos.y}
            r={3}
            fill="#FFFFFF"
          />
        </G>
      </Svg>

      {/* Center Readout HUD */}
      <View style={styles.centerHud}>
        <View style={styles.angleRow}>
          <Text style={[styles.angleText, { color: theme.colors.textPrimary }]}>
            {clampedAngle.toFixed(0)}
          </Text>
          <Text style={[styles.unitText, { color: theme.colors.primary }]}>
            {unit}
          </Text>
        </View>

        <Text style={[styles.labelText, { color: theme.colors.textMuted }]}>
          {label}
        </Text>

        {showPercent && (
          <View
            style={[
              styles.percentPill,
              {
                backgroundColor: theme.colors.surfaceHighlight,
                borderColor: theme.colors.surfaceBorder,
              },
            ]}
          >
            <Text style={[styles.percentText, { color: theme.colors.primary }]}>
              {percent}% FLEXION
            </Text>
          </View>
        )}
      </View>

      {/* Bound Labels */}
      <View style={styles.boundsRow}>
        <Text style={[styles.boundText, { color: theme.colors.servoOpen }]}>
          {minAngle}° (OPEN)
        </Text>
        <Text style={[styles.boundText, { color: theme.colors.secondary }]}>
          {maxAngle}° (CLOSED)
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  centerHud: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '28%',
  },
  angleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  angleText: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
    fontFamily: 'monospace',
  },
  unitText: {
    fontSize: 22,
    fontWeight: '800',
    marginLeft: 2,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: -2,
  },
  percentPill: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  percentText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
  boundsRow: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  boundText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
