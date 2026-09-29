export type ConnectionStatus =
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'RECONNECTING'
  | 'ERROR';

export type OperatingMode = 'MANUAL' | 'EMG' | 'AUTO';

export type HandState =
  | 'OPEN'
  | 'CLOSING'
  | 'CLOSED'
  | 'OPENING'
  | 'HOLDING'
  | 'STOPPED'
  | 'CALIBRATING'
  | 'ERROR';

export type DeviceCommand =
  | 'OPEN'
  | 'CLOSE'
  | 'STOP'
  | 'CALIBRATE'
  | 'SET_MODE'
  | 'TRIGGER_EMG_CONTRACTION'
  | 'DISCONNECT'
  | 'RECONNECT'
  | 'RESET_DEVICE';

export interface DeviceTelemetry {
  battery: number; // 0 - 100%
  position: number; // Current angle in degrees (e.g., 0 to 63)
  targetPosition: number; // Target angle in degrees
  emg: number; // EMG raw sensor value (0 - 500)
  emgBaseline: number; // Baseline resting EMG
  isContractionDetected: boolean; // Peak trigger state
  mode: OperatingMode;
  handState: HandState;
  isMoving: boolean;
  movementDirection: 'OPENING' | 'CLOSING' | 'NONE';
  temperature: number; // Device internal temp in °C
  firmwareVersion: string;
  uptimeSeconds: number;
}

export interface DeviceState extends DeviceTelemetry {
  connectionStatus: ConnectionStatus;
  deviceName: string;
  lastCommand: string | null;
  lastCommandTimestamp: number | null;
  errorMessage: string | null;
  emgHistory: number[]; // Rolling window of last 30-50 samples
}
