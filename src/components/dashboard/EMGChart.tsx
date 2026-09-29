import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Path, Line, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface EMGChartProps {
  data: number[];
  threshold: number;
  height?: number;
  maxVal?: number;
  minVal?: number;
  isContraction?: boolean;
}

export const EMGChart: React.FC<EMGChartProps> = React.memo(({
  data,
  threshold,
  height = 110,
  maxVal = 350,
  minVal = 0,
  isContraction = false,
}) => {
  const { theme } = useTheme();

  const width = 320; // Internal SVG coordinate width (stretches with viewBox)

  const { pathD, areaD, thresholdY, latestY, latestX } = useMemo(() => {
    if (!data || data.length < 2) {
      return { pathD: '', areaD: '', thresholdY: 0, latestY: 0, latestX: 0 };
    }

    const range = Math.max(50, maxVal - minVal);
    const stepX = width / (data.length - 1);

    const getY = (val: number) => {
      const clamped = Math.max(minVal, Math.min(maxVal, val));
      const ratio = (clamped - minVal) / range;
      return height - ratio * (height - 16) - 8; // 8px padding top/bottom
    };

    let p = `M 0 ${getY(data[0])}`;
    for (let i = 1; i < data.length; i++) {
      const x = i * stepX;
      const y = getY(data[i]);
      p += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }

    const lastX = width;
    const lastY = getY(data[data.length - 1]);
    const aD = `${p} L ${lastX} ${height} L 0 ${height} Z`;

    const tY = getY(threshold);

    return {
      pathD: p,
      areaD: aD,
      thresholdY: tY,
      latestY: lastY,
      latestX: lastX,
    };
  }, [data, threshold, height, maxVal, minVal, width]);

  return (
    <View style={[styles.container, { height }]}>
      <Svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={styles.svg}
      >
        <Defs>
          <LinearGradient id="emgAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop
              offset="0%"
              stopColor={isContraction ? theme.colors.emgPeak : theme.colors.emgLine}
              stopOpacity="0.45"
            />
            <Stop
              offset="100%"
              stopColor={isContraction ? theme.colors.emgPeak : theme.colors.emgLine}
              stopOpacity="0.0"
            />
          </LinearGradient>
        </Defs>

        {/* Oscilloscope Grid Lines */}
        <Line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke={theme.colors.surfaceBorder} strokeWidth="1" strokeDasharray="3,3" />
        <Line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke={theme.colors.surfaceBorder} strokeWidth="1" strokeDasharray="3,3" />
        <Line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke={theme.colors.surfaceBorder} strokeWidth="1" strokeDasharray="3,3" />

        <Line x1={width * 0.25} y1="0" x2={width * 0.25} y2={height} stroke={theme.colors.surfaceBorder} strokeWidth="0.8" strokeDasharray="2,4" />
        <Line x1={width * 0.5} y1="0" x2={width * 0.5} y2={height} stroke={theme.colors.surfaceBorder} strokeWidth="0.8" strokeDasharray="2,4" />
        <Line x1={width * 0.75} y1="0" x2={width * 0.75} y2={height} stroke={theme.colors.surfaceBorder} strokeWidth="0.8" strokeDasharray="2,4" />

        {/* EMG Threshold Reference Line */}
        <Line
          x1="0"
          y1={thresholdY}
          x2={width}
          y2={thresholdY}
          stroke={theme.colors.emgThreshold}
          strokeWidth="1.5"
          strokeDasharray="4,4"
        />

        {/* Area Gradient */}
        {areaD ? <Path d={areaD} fill="url(#emgAreaGrad)" /> : null}

        {/* Main Oscilloscope Waveform */}
        {pathD ? (
          <Path
            d={pathD}
            fill="none"
            stroke={isContraction ? theme.colors.emgPeak : theme.colors.emgLine}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {/* Current Endpoint Pulse Marker */}
        {latestX > 0 && (
          <Rect
            x={latestX - 3}
            y={latestY - 3}
            width="6"
            height="6"
            fill={isContraction ? theme.colors.emgPeak : theme.colors.primary}
            rx="3"
          />
        )}
      </Svg>

      {/* Threshold Badge Overlay */}
      <View style={[styles.thresholdLabel, { top: Math.max(4, thresholdY - 14) }]}>
        <Text style={[styles.thresholdText, { color: theme.colors.emgThreshold }]}>
          TRG: {threshold} µV
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  thresholdLabel: {
    position: 'absolute',
    left: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  thresholdText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
});
