import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large' | 'emergency';

interface ControlButtonProps {
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export const ControlButton: React.FC<ControlButtonProps> = ({
  label,
  sublabel,
  icon,
  variant = 'primary',
  size = 'medium',
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          bg: theme.colors.danger,
          border: theme.colors.danger,
          text: '#FFFFFF',
          ripple: theme.colors.dangerDim,
        };
      case 'success':
        return {
          bg: theme.colors.success,
          border: theme.colors.success,
          text: '#080C14',
          ripple: theme.colors.successDim,
        };
      case 'secondary':
        return {
          bg: theme.colors.secondary,
          border: theme.colors.secondary,
          text: '#FFFFFF',
          ripple: theme.colors.secondaryDim,
        };
      case 'outline':
        return {
          bg: 'transparent',
          border: theme.colors.primary,
          text: theme.colors.primary,
          ripple: theme.colors.primaryDim,
        };
      case 'ghost':
        return {
          bg: theme.colors.surfaceHighlight,
          border: theme.colors.surfaceBorder,
          text: theme.colors.textPrimary,
          ripple: theme.colors.surfaceElevated,
        };
      case 'primary':
      default:
        return {
          bg: theme.colors.primary,
          border: theme.colors.primary,
          text: theme.colors.textInverse,
          ripple: theme.colors.primaryDim,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
          fontSize: 12,
          borderRadius: 8,
          iconSize: 14,
        };
      case 'large':
        return {
          paddingVertical: 14,
          paddingHorizontal: 20,
          fontSize: 16,
          borderRadius: 14,
          iconSize: 20,
        };
      case 'emergency':
        return {
          paddingVertical: 18,
          paddingHorizontal: 24,
          fontSize: 18,
          borderRadius: 16,
          iconSize: 24,
        };
      case 'medium':
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          fontSize: 14,
          borderRadius: 12,
          iconSize: 18,
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel || label}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? theme.colors.surfaceHighlight : vStyles.bg,
          borderColor: disabled ? theme.colors.surfaceBorder : vStyles.border,
          paddingVertical: sStyles.paddingVertical,
          paddingHorizontal: sStyles.paddingHorizontal,
          borderRadius: sStyles.borderRadius,
        },
        disabled && styles.disabledButton,
        size === 'emergency' && styles.emergencyShadow,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? theme.colors.primary : '#FFFFFF'}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <View style={styles.textColumn}>
            <Text
              style={[
                styles.label,
                {
                  color: disabled ? theme.colors.textMuted : vStyles.text,
                  fontSize: sStyles.fontSize,
                },
                size === 'emergency' && styles.emergencyLabel,
                textStyle,
              ]}
            >
              {label}
            </Text>
            {sublabel && (
              <Text
                style={[
                  styles.sublabel,
                  {
                    color: disabled
                      ? theme.colors.textMuted
                      : variant === 'primary' || variant === 'success'
                      ? 'rgba(0,0,0,0.6)'
                      : 'rgba(255,255,255,0.7)',
                  },
                ]}
              >
                {sublabel}
              </Text>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  emergencyLabel: {
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  sublabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  emergencyShadow: {
    elevation: 4,
    shadowColor: '#FF3860',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
