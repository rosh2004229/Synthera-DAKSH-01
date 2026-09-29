export const darkColors = {
  // Backgrounds
  background: '#080C14',
  surface: '#101726',
  surfaceElevated: '#172238',
  surfaceHighlight: '#1E2C48',
  surfaceBorder: '#1D2A42',

  // Primary brand (Synthera Cyan & Electric Teal)
  primary: '#00E5FF',
  primaryDim: 'rgba(0, 229, 255, 0.15)',
  primaryGlow: 'rgba(0, 229, 255, 0.35)',
  primaryDark: '#0097A7',

  // Secondary brand (Robotics Purple / Indigo)
  secondary: '#7C4DFF',
  secondaryDim: 'rgba(124, 77, 255, 0.15)',

  // Status & Telemetry
  success: '#00E676',
  successDim: 'rgba(0, 230, 118, 0.15)',
  warning: '#FFB300',
  warningDim: 'rgba(255, 179, 0, 0.15)',
  danger: '#FF3860',
  dangerDim: 'rgba(255, 56, 96, 0.18)',
  info: '#29B6F6',
  infoDim: 'rgba(41, 182, 246, 0.15)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#080C14',

  // Specialized telemetry colors
  emgLine: '#00E5FF',
  emgFill: 'rgba(0, 229, 255, 0.12)',
  emgThreshold: '#FFB300',
  emgPeak: '#FF3860',
  servoOpen: '#00E676',
  servoOpenDim: 'rgba(0, 230, 118, 0.15)',
  servoClose: '#7C4DFF',
  servoCloseDim: 'rgba(124, 77, 255, 0.15)',
  batteryFull: '#00E676',
  batteryMid: '#FFB300',
  batteryLow: '#FF3860',

  // UI accents
  border: '#1F2D44',
  divider: '#162235',
  cardShadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(8, 12, 20, 0.85)',
};

export const lightColors = {
  // Backgrounds
  background: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceElevated: '#F8FAFC',
  surfaceHighlight: '#E2E8F0',
  surfaceBorder: '#CBD5E1',

  // Primary brand
  primary: '#00838F',
  primaryDim: 'rgba(0, 131, 143, 0.12)',
  primaryGlow: 'rgba(0, 131, 143, 0.25)',
  primaryDark: '#006064',

  // Secondary brand
  secondary: '#6200EA',
  secondaryDim: 'rgba(98, 0, 234, 0.12)',

  // Status & Telemetry
  success: '#10B981',
  successDim: 'rgba(16, 185, 129, 0.12)',
  warning: '#D97706',
  warningDim: 'rgba(217, 119, 6, 0.12)',
  danger: '#EF4444',
  dangerDim: 'rgba(239, 68, 68, 0.12)',
  info: '#0284C7',
  infoDim: 'rgba(2, 132, 199, 0.12)',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Specialized telemetry colors
  emgLine: '#00838F',
  emgFill: 'rgba(0, 131, 143, 0.12)',
  emgThreshold: '#D97706',
  emgPeak: '#EF4444',
  servoOpen: '#10B981',
  servoOpenDim: 'rgba(16, 185, 129, 0.12)',
  servoClose: '#6200EA',
  servoCloseDim: 'rgba(98, 0, 234, 0.12)',
  batteryFull: '#10B981',
  batteryMid: '#D97706',
  batteryLow: '#EF4444',

  // UI accents
  border: '#E2E8F0',
  divider: '#EEF2F6',
  cardShadow: 'rgba(15, 23, 42, 0.08)',
  overlay: 'rgba(15, 23, 42, 0.6)',
};

export type ThemeColors = typeof darkColors;
