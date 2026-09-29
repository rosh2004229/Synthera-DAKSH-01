import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDevice } from '../../hooks/useDevice';
import { useTheme } from '../../hooks/useTheme';
import { DeviceStatusBadge } from './DeviceStatusBadge';
import { MoonIcon, SunIcon, RefreshCwIcon } from './SvgIcons';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showThemeToggle?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  title = 'SYNTHERA ROBOTICS',
  subtitle,
  showThemeToggle = true,
  showBackButton = false,
  onBack,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { connectionStatus, deviceName, isConnected, reconnect, isConnecting } = useDevice();

  const displaySubtitle = subtitle || deviceName || 'DAKSH-01';

  // Calculate safe top padding to clear Android status bar / notch / camera cutout
  const androidStatusHeight = StatusBar.currentHeight || 24;
  const topInset = Platform.OS === 'android'
    ? Math.max(insets.top, androidStatusHeight)
    : Math.max(insets.top, 12);

  if (Platform.OS === 'android') {
    (StatusBar as any).setTranslucent?.(true);
    (StatusBar as any).setBackgroundColor?.('transparent');
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.surfaceBorder,
          paddingTop: topInset + 8,
        },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <View style={styles.left}>
        {showBackButton && (
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.surfaceBorder },
            ]}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityLabel="Go Back"
          >
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>◀</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleInfo}>
          <View style={styles.titleRow}>
            <Text style={[styles.brandText, { color: theme.colors.primary }]}>
              {title}
            </Text>
          </View>
          <Text style={[styles.modelText, { color: theme.colors.textPrimary }]}>
            {displaySubtitle}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        {!isConnected && (
          <TouchableOpacity
            style={[
              styles.reconnectBtn,
              { backgroundColor: theme.colors.primaryDim, borderColor: theme.colors.primary },
            ]}
            onPress={reconnect}
            disabled={isConnecting}
            accessibilityLabel="Reconnect Device"
          >
            <RefreshCwIcon size={14} color={theme.colors.primary} />
            <Text style={[styles.reconnectText, { color: theme.colors.primary }]}>
              {isConnecting ? 'LINKING...' : 'RECONNECT'}
            </Text>
          </TouchableOpacity>
        )}

        <DeviceStatusBadge status={connectionStatus} />

        {showThemeToggle && (
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.border },
            ]}
            onPress={toggleTheme}
            accessibilityLabel="Toggle Dark and Light Theme"
          >
            {isDark ? (
              <SunIcon size={16} color={theme.colors.warning} />
            ) : (
              <MoonIcon size={16} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleInfo: {
    flexDirection: 'column',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  modelText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reconnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  reconnectText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
