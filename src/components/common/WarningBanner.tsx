import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { AlertTriangleIcon, RefreshCwIcon, StopCircleIcon } from './SvgIcons';

export type BannerVariant = 'warning' | 'danger' | 'info' | 'critical';

interface WarningBannerProps {
  variant?: BannerVariant;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  actionLoading?: boolean;
}

export const WarningBanner: React.FC<WarningBannerProps> = ({
  variant = 'warning',
  title,
  message,
  actionLabel,
  onAction,
  actionLoading = false,
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
      case 'critical':
        return {
          bg: theme.colors.dangerDim,
          border: theme.colors.danger,
          iconColor: theme.colors.danger,
          textColor: theme.colors.danger,
        };
      case 'info':
        return {
          bg: theme.colors.infoDim,
          border: theme.colors.info,
          iconColor: theme.colors.info,
          textColor: theme.colors.info,
        };
      case 'warning':
      default:
        return {
          bg: theme.colors.warningDim,
          border: theme.colors.warning,
          iconColor: theme.colors.warning,
          textColor: theme.colors.warning,
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: vStyles.bg,
          borderColor: vStyles.border,
        },
      ]}
    >
      <View style={styles.left}>
        <View style={styles.iconContainer}>
          {variant === 'danger' || variant === 'critical' ? (
            <StopCircleIcon size={20} color={vStyles.iconColor} />
          ) : (
            <AlertTriangleIcon size={20} color={vStyles.iconColor} />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: vStyles.textColor }]}>
            {title}
          </Text>
          <Text style={[styles.message, { color: theme.colors.textPrimary }]}>
            {message}
          </Text>
        </View>
      </View>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: vStyles.border },
          ]}
          onPress={onAction}
          disabled={actionLoading}
        >
          {actionLoading && <RefreshCwIcon size={12} color="#FFFFFF" />}
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconContainer: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  message: {
    fontSize: 12,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
