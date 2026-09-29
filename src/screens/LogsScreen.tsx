import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  BackHandler,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/store';
import { useTheme } from '../hooks/useTheme';
import { clearLogs } from '../store/logsSlice';
import { storageService } from '../storage/storage';
import { Header } from '../components/common/Header';
import { LogItem } from '../components/logs/LogItem';
import { LogType } from '../types/logs';
import { TerminalIcon } from '../components/common/SvgIcons';

export const LogsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const logs = useAppSelector(state => state.logs.logs);

  // Handle hardware phone back button -> move to previous screen or Home
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        }
        navigation.navigate('Dashboard');
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  const [selectedFilter, setSelectedFilter] = useState<LogType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterOptions: Array<LogType | 'ALL'> = [
    'ALL',
    'COMMAND',
    'SENSOR',
    'WARNING',
    'SYSTEM',
    'ERROR',
    'CALIBRATION',
  ];

  const filteredLogs = useMemo(() => {
    return logs.filter(item => {
      const matchesType = selectedFilter === 'ALL' || item.type === selectedFilter;
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [logs, selectedFilter, searchQuery]);

  const handleClearLogs = () => {
    Alert.alert(
      'Clear Device Logs',
      'Are you sure you want to erase all telemetry diagnostic logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            dispatch(clearLogs());
            await storageService.clearLogs();
          },
        },
      ]
    );
  };

  return (
    <View
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <Header subtitle="DIAGNOSTIC LOGS" />

      <View style={styles.container}>
        {/* Search Bar & Clear Action */}
        <View style={styles.topControlRow}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.surfaceBorder,
              },
            ]}
          >
            <TextInput
              style={[styles.searchInput, { color: theme.colors.textPrimary }]}
              placeholder="Search event logs..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={[styles.clearSearchText, { color: theme.colors.textMuted }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.clearBtn,
              { backgroundColor: theme.colors.dangerDim, borderColor: theme.colors.danger },
            ]}
            onPress={handleClearLogs}
            disabled={logs.length === 0}
          >
            <Text style={[styles.clearBtnText, { color: theme.colors.danger }]}>
              CLEAR
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Categories Chips */}
        <View style={styles.filterRow}>
          <FlatList
            horizontal
            data={filterOptions}
            keyExtractor={item => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => {
              const isActive = selectedFilter === item;
              return (
                <TouchableOpacity
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isActive
                        ? theme.colors.primary
                        : theme.colors.surfaceElevated,
                      borderColor: isActive
                        ? theme.colors.primary
                        : theme.colors.surfaceBorder,
                    },
                  ]}
                  onPress={() => setSelectedFilter(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isActive ? styles.activeChipText : styles.inactiveChipText,
                      {
                        color: isActive
                          ? theme.colors.textInverse
                          : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Log List */}
        <FlatList
          data={filteredLogs}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <LogItem log={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <TerminalIcon size={40} color={theme.colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.colors.textSecondary }]}>
                No Event Logs Recorded
              </Text>
              <Text style={[styles.emptyDesc, { color: theme.colors.textMuted }]}>
                Sensor events, commands, and telemetry notifications will appear here.
              </Text>
            </View>
          }
        />

        {/* Bottom Screen Switcher Bar */}
        <View style={styles.bottomNavRow}>
          <TouchableOpacity
            style={[
              styles.navTabBtn,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.surfaceBorder },
            ]}
            onPress={() => navigation.navigate('Dashboard')}
            activeOpacity={0.7}
          >
            <Text style={[styles.navTabText, { color: theme.colors.textPrimary }]}>
              ← DASHBOARD
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navTabBtn,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.surfaceBorder },
            ]}
            onPress={() => navigation.navigate('Controls')}
            activeOpacity={0.7}
          >
            <Text style={[styles.navTabText, { color: theme.colors.primary }]}>
              CONTROLS STUDIO →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navTabBtn,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.surfaceBorder },
            ]}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Text style={[styles.navTabText, { color: theme.colors.warning }]}>
              SETTINGS →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  topControlRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  clearSearchText: {
    fontSize: 14,
    paddingHorizontal: 4,
  },
  clearBtn: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterList: {
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    letterSpacing: 0.4,
  },
  activeChipText: {
    fontWeight: '800',
  },
  inactiveChipText: {
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 240,
  },
  bottomNavRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  navTabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTabText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
