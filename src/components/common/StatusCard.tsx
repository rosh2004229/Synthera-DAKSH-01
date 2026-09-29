import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface StatusCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
  highlightColor?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  subtitle,
  icon,
  rightAction,
  children,
  style,
  highlightColor,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: highlightColor || theme.colors.surfaceBorder,
          shadowColor: theme.colors.cardShadow,
        },
        style,
      ]}
    >
      {(title || rightAction) && (
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <View>
              {title && (
                <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
          {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '400',
    marginTop: 2,
  },
  rightAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    width: '100%',
  },
});
