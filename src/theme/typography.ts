import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  h4: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  telemetryNumber: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  telemetryNumberLarge: {
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: 1,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  monoBold: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
};
