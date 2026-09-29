import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConnectionStatus, DeviceState, DeviceTelemetry, HandState, OperatingMode } from '../types/device';

const MAX_EMG_HISTORY_LENGTH = 40;

const initialEmgHistory: number[] = Array.from({ length: MAX_EMG_HISTORY_LENGTH }, () =>
  Math.round(50 + Math.random() * 20)
);

const initialState: DeviceState = {
  connectionStatus: 'CONNECTED',
  deviceName: 'DAKSH-01',
  battery: 82,
  position: 45.0,
  targetPosition: 45.0,
  emg: 127,
  emgBaseline: 55,
  isContractionDetected: false,
  mode: 'AUTO',
  handState: 'HOLDING',
  isMoving: false,
  movementDirection: 'NONE',
  temperature: 34.2,
  firmwareVersion: 'v2.4.1-sim',
  uptimeSeconds: 0,
  lastCommand: null,
  lastCommandTimestamp: null,
  errorMessage: null,
  emgHistory: initialEmgHistory,
};

export const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    updateTelemetry: (state, action: PayloadAction<DeviceTelemetry>) => {
      const telemetry = action.payload;
      state.battery = telemetry.battery;
      state.position = telemetry.position;
      state.targetPosition = telemetry.targetPosition;
      state.emg = telemetry.emg;
      state.emgBaseline = telemetry.emgBaseline;
      state.isContractionDetected = telemetry.isContractionDetected;
      state.mode = telemetry.mode;
      state.handState = telemetry.handState;
      state.isMoving = telemetry.isMoving;
      state.movementDirection = telemetry.movementDirection;
      state.temperature = telemetry.temperature;
      state.uptimeSeconds = telemetry.uptimeSeconds;

      // In-place shift/push (Immer manages proxy efficiently)
      state.emgHistory.shift();
      state.emgHistory.push(telemetry.emg);
    },

    setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.connectionStatus = action.payload;
      if (action.payload === 'CONNECTED') {
        state.errorMessage = null;
      }
    },

    setOperatingMode: (state, action: PayloadAction<OperatingMode>) => {
      state.mode = action.payload;
    },

    setHandState: (state, action: PayloadAction<HandState>) => {
      state.handState = action.payload;
    },

    setLastCommand: (
      state,
      action: PayloadAction<{ command: string; timestamp?: number }>
    ) => {
      state.lastCommand = action.payload.command;
      state.lastCommandTimestamp = action.payload.timestamp || Date.now();
    },

    setDeviceError: (state, action: PayloadAction<string | null>) => {
      state.errorMessage = action.payload;
      if (action.payload) {
        state.handState = 'ERROR';
      }
    },

    setDeviceName: (state, action: PayloadAction<string>) => {
      state.deviceName = action.payload;
    },

    resetDeviceState: () => initialState,
  },
});

export const {
  updateTelemetry,
  setConnectionStatus,
  setOperatingMode,
  setHandState,
  setLastCommand,
  setDeviceError,
  setDeviceName,
  resetDeviceState,
} = deviceSlice.actions;

export default deviceSlice.reducer;
