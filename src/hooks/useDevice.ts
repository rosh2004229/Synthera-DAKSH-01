import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { deviceService } from '../services/DeviceService';
import { OperatingMode } from '../types/device';
import { setDeviceError } from '../store/deviceSlice';

/**
 * useDevice Custom Hook
 *
 * Provides reactive access to device state using granular selectors
 * so components only re-render when their specific dependent values change.
 */
export const useDevice = () => {
  const dispatch = useAppDispatch();

  // Granular primitive selectors for 60fps performance without redundant re-renders
  const connectionStatus = useAppSelector(state => state.device.connectionStatus);
  const deviceName = useAppSelector(state => state.device.deviceName);
  const battery = useAppSelector(state => state.device.battery);
  const position = useAppSelector(state => state.device.position);
  const targetPosition = useAppSelector(state => state.device.targetPosition);
  const emg = useAppSelector(state => state.device.emg);
  const emgBaseline = useAppSelector(state => state.device.emgBaseline);
  const isContractionDetected = useAppSelector(state => state.device.isContractionDetected);
  const mode = useAppSelector(state => state.device.mode);
  const handState = useAppSelector(state => state.device.handState);
  const isMoving = useAppSelector(state => state.device.isMoving);
  const movementDirection = useAppSelector(state => state.device.movementDirection);
  const temperature = useAppSelector(state => state.device.temperature);
  const firmwareVersion = useAppSelector(state => state.device.firmwareVersion);
  const uptimeSeconds = useAppSelector(state => state.device.uptimeSeconds);
  const lastCommand = useAppSelector(state => state.device.lastCommand);
  const lastCommandTimestamp = useAppSelector(state => state.device.lastCommandTimestamp);
  const errorMessage = useAppSelector(state => state.device.errorMessage);
  const settings = useAppSelector(state => state.settings.settings);

  const openHand = useCallback(async () => {
    return await deviceService.open();
  }, []);

  const closeHand = useCallback(async () => {
    return await deviceService.close();
  }, []);

  const emergencyStop = useCallback(async () => {
    return await deviceService.stop();
  }, []);

  const setMode = useCallback(async (newMode: OperatingMode) => {
    return await deviceService.setOperatingMode(newMode);
  }, []);

  const triggerContraction = useCallback((intensity?: number) => {
    deviceService.triggerEMGContraction(intensity);
  }, []);

  const reconnect = useCallback(async () => {
    return await deviceService.reconnect();
  }, []);

  const disconnect = useCallback(async () => {
    return await deviceService.disconnect();
  }, []);

  const resetDevice = useCallback(async () => {
    return await deviceService.resetDevice();
  }, []);

  const clearError = useCallback(() => {
    dispatch(setDeviceError(null));
  }, [dispatch]);

  const isConnected = connectionStatus === 'CONNECTED';
  const isConnecting =
    connectionStatus === 'CONNECTING' ||
    connectionStatus === 'RECONNECTING';
  const isLowBattery = battery <= settings.batteryWarningThreshold;
  const isCriticalBattery = battery <= 5;

  return {
    connectionStatus,
    deviceName,
    battery,
    position,
    targetPosition,
    emg,
    emgBaseline,
    isContractionDetected,
    mode,
    handState,
    isMoving,
    movementDirection,
    temperature,
    firmwareVersion,
    uptimeSeconds,
    lastCommand,
    lastCommandTimestamp,
    errorMessage,
    isConnected,
    isConnecting,
    isLowBattery,
    isCriticalBattery,
    settings,
    openHand,
    closeHand,
    emergencyStop,
    setMode,
    triggerContraction,
    reconnect,
    disconnect,
    resetDevice,
    clearError,
  };
};
