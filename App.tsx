import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { store, useAppDispatch } from './src/store/store';
import { deviceService } from './src/services/DeviceService';
import { storageService } from './src/storage/storage';
import { setLoadedSettings } from './src/store/settingsSlice';
import { setLoadedLogs } from './src/store/logsSlice';
import { setDeviceName } from './src/store/deviceSlice';
import { RootNavigator } from './src/navigation/RootNavigator';

const AppInitializer: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // 1. Load persisted settings and calibration from AsyncStorage
        const [savedSettings, savedCalibration, savedLogs] = await Promise.all([
          storageService.loadSettings(),
          storageService.loadCalibration(),
          storageService.loadLogs(),
        ]);

        dispatch(
          setLoadedSettings({
            settings: savedSettings,
            calibration: savedCalibration,
          })
        );

        if (savedLogs && savedLogs.length > 0) {
          dispatch(setLoadedLogs(savedLogs));
        }

        if (savedSettings.deviceName) {
          dispatch(setDeviceName(savedSettings.deviceName));
        }

        // 2. Initialize Centralized Device Simulation Service & Redux bridge
        deviceService.initialize();
        deviceService.syncSettings(savedSettings);
      } catch (e) {
        console.warn('Bootstrap initialization error:', e);
      } finally {
        setIsReady(true);
      }
    };

    bootstrap();

    return () => {
      deviceService.destroy();
    };
  }, [dispatch]);

  if (!isReady) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom', 'left', 'right']}>
        <ActivityIndicator size="large" color="#00E5FF" />
      </SafeAreaView>
    );
  }

  return <RootNavigator />;
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppInitializer />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#080C14',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
