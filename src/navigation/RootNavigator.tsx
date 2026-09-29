import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useAppSelector } from '../store/store';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ControlsScreen } from '../screens/ControlsScreen';
import { LogsScreen } from '../screens/LogsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CalibrationScreen } from '../screens/CalibrationScreen';
import {
  ActivityIcon,
  HandIcon,
  SettingsIcon,
  TerminalIcon,
} from '../components/common/SvgIcons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { theme } = useTheme();
  const logsCount = useAppSelector(s => s.logs.logs.length);
  const isMoving = useAppSelector(s => s.device.isMoving);

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[
        styles.tabBarSafeArea,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.surfaceBorder,
        },
      ]}
    >
      <View style={styles.tabsRow}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            navigation.navigate(route.name);
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const activeColor = theme.colors.primary;
          const inactiveColor = theme.colors.textMuted;
          const color = isFocused ? activeColor : inactiveColor;

          let iconNode: React.ReactNode = null;
          let badgeNode: React.ReactNode = null;

          if (route.name === 'Dashboard') {
            iconNode = <ActivityIcon size={22} color={color} />;
          } else if (route.name === 'Controls') {
            iconNode = <HandIcon size={22} color={color} />;
            if (isMoving) {
              badgeNode = (
                <View
                  style={[
                    styles.movingDot,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
              );
            }
          } else if (route.name === 'Logs') {
            iconNode = <TerminalIcon size={22} color={color} />;
            if (logsCount > 0) {
              badgeNode = (
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: theme.colors.surfaceHighlight,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                    {logsCount > 99 ? '99+' : logsCount}
                  </Text>
                </View>
              );
            }
          } else if (route.name === 'Settings') {
            iconNode = <SettingsIcon size={22} color={color} />;
          }

          const label =
            options.tabBarLabel !== undefined
              ? (options.tabBarLabel as string)
              : options.title !== undefined
              ? options.title
              : route.name;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || label}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.6}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
              style={styles.tabItem}
            >
              {isFocused && (
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
              )}

              <View style={styles.iconContainer}>
                {iconNode}
                {badgeNode}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  {
                    color,
                    fontWeight: isFocused ? '800' : '600',
                  },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      backBehavior="history"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="Controls"
        component={ControlsScreen}
        options={{ tabBarLabel: 'Controls' }}
      />
      <Tab.Screen
        name="Logs"
        component={LogsScreen}
        options={{ tabBarLabel: 'Logs' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator: React.FC = () => {
  const { theme, isDark } = useTheme();

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.textPrimary,
      border: theme.colors.surfaceBorder,
      notification: theme.colors.danger,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="Calibration"
          component={CalibrationScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBarSafeArea: {
    borderTopWidth: 1,
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 58,
  },
  tabItem: {
    flex: 1,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.4,
    marginTop: 4,
  },
  movingDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -12,
    minWidth: 17,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 3,
    borderRadius: 1.5,
  },
});
