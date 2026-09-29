import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DeviceLog, LogType } from '../types/logs';

export interface LogsState {
  logs: DeviceLog[];
}

const formatCurrentTime = (): string => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const initialLogs: DeviceLog[] = [
  {
    id: 'log-init-1',
    timestamp: formatCurrentTime(),
    epochTime: Date.now() - 60000,
    type: 'SYSTEM',
    title: 'System Boot',
    description: 'DAKSH-01 Simulated ESP32 micro-controller initialized',
  },
  {
    id: 'log-init-2',
    timestamp: formatCurrentTime(),
    epochTime: Date.now() - 45000,
    type: 'CALIBRATION',
    title: 'Calibration Loaded',
    description: 'Loaded default ROM calibration: Min 0.0°, Max 63.0°',
  },
  {
    id: 'log-init-3',
    timestamp: formatCurrentTime(),
    epochTime: Date.now() - 30000,
    type: 'SYSTEM',
    title: 'BLE Link Established',
    description: 'GATT Telemetry stream opened with client mobile application',
  },
  {
    id: 'log-init-4',
    timestamp: formatCurrentTime(),
    epochTime: Date.now() - 15000,
    type: 'SENSOR',
    title: 'EMG Sensor Calibrated',
    description: 'Baseline resting potential calibrated at 55 µV',
  },
];

const initialState: LogsState = {
  logs: initialLogs,
};

export const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    addLog: {
      reducer: (state, action: PayloadAction<DeviceLog>) => {
        state.logs.unshift(action.payload);
        if (state.logs.length > 200) {
          state.logs.pop();
        }
      },
      prepare: (type: LogType, title: string, description: string, data?: Record<string, any>) => {
        return {
          payload: {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            timestamp: formatCurrentTime(),
            epochTime: Date.now(),
            type,
            title,
            description,
            data,
          },
        };
      },
    },

    setLoadedLogs: (state, action: PayloadAction<DeviceLog[]>) => {
      if (action.payload && action.payload.length > 0) {
        state.logs = action.payload;
      }
    },

    clearLogs: state => {
      state.logs = [];
    },
  },
});

export const { addLog, setLoadedLogs, clearLogs } = logsSlice.actions;

export default logsSlice.reducer;
