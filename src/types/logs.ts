export type LogType =
  | 'COMMAND'
  | 'SENSOR'
  | 'WARNING'
  | 'SYSTEM'
  | 'ERROR'
  | 'CALIBRATION';

export interface DeviceLog {
  id: string;
  timestamp: string; // ISO string or HH:mm:ss format
  epochTime: number; // For sorting
  type: LogType;
  title: string;
  description: string;
  data?: Record<string, any>;
}
