import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface SettingRowProps {
  label: string;
  description?: string;
  value: string | number;
  unit?: string;
  onChangeText?: (val: string) => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  keyboardType?: 'default' | 'numeric' | 'number-pad';
  error?: string | null;
  editable?: boolean;
}

export const SettingRow: React.FC<SettingRowProps> = ({
  label,
  description,
  value,
  unit,
  onChangeText,
  onIncrement,
  onDecrement,
  keyboardType = 'default',
  error,
  editable = true,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: error ? theme.colors.danger : theme.colors.surfaceBorder,
        },
      ]}
    >
      <View style={styles.leftCol}>
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
          {label}
        </Text>
        {description && (
          <Text style={[styles.description, { color: theme.colors.textMuted }]}>
            {description}
          </Text>
        )}
        {error && (
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>
            {error}
          </Text>
        )}
      </View>

      <View style={styles.rightCol}>
        {onDecrement && (
          <TouchableOpacity
            style={[
              styles.stepBtn,
              {
                backgroundColor: theme.colors.surfaceHighlight,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={onDecrement}
            disabled={!editable}
          >
            <Text style={[styles.stepBtnText, { color: theme.colors.textPrimary }]}>
              -
            </Text>
          </TouchableOpacity>
        )}

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { color: theme.colors.textPrimary },
            ]}
            value={String(value)}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            editable={editable}
            selectTextOnFocus
          />
          {unit && (
            <Text style={[styles.unitText, { color: theme.colors.textMuted }]}>
              {unit}
            </Text>
          )}
        </View>

        {onIncrement && (
          <TouchableOpacity
            style={[
              styles.stepBtn,
              {
                backgroundColor: theme.colors.surfaceHighlight,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={onIncrement}
            disabled={!editable}
          >
            <Text style={[styles.stepBtnText, { color: theme.colors.textPrimary }]}>
              +
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCol: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  errorText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBtn: {
    width: 32,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 18,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    height: 36,
    minWidth: 70,
    justifyContent: 'center',
  },
  input: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
    padding: 0,
    textAlign: 'center',
    minWidth: 36,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
  },
});
