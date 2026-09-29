import { ConnectionStatus, DeviceCommand, DeviceTelemetry, OperatingMode } from '../types/device';
import { DeviceSettings } from '../types/settings';

export type TelemetryListener = (telemetry: DeviceTelemetry) => void;
export type ConnectionStatusListener = (status: ConnectionStatus) => void;

/**
 * Interface defining communication contract between the Mobile Application
 * and the Prosthetic Hand hardware (Mock ESP32 or physical BLE ESP32).
 */
export interface ICommunicationService {
  /**
   * Connect to the device
   */
  connect(): Promise<boolean>;

  /**
   * Disconnect from the device
   */
  disconnect(): Promise<boolean>;

  /**
   * Attempt to reconnect to the device
   */
  reconnect(): Promise<boolean>;

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus;

  /**
   * Send a discrete command to the hardware/simulator
   */
  sendCommand(command: DeviceCommand, payload?: any): Promise<boolean>;

  /**
   * Set operating mode (MANUAL, EMG, AUTO)
   */
  setOperatingMode(mode: OperatingMode): Promise<boolean>;

  /**
   * Update configuration parameters on hardware
   */
  updateSettings(settings: Partial<DeviceSettings>): void;

  /**
   * Trigger a simulated muscle contraction (useful for EMG mode testing)
   */
  triggerEMGContraction(intensity?: number): void;

  /**
   * Subscribe to real-time telemetry stream
   */
  subscribeTelemetry(listener: TelemetryListener): () => void;

  /**
   * Subscribe to connection status changes
   */
  subscribeConnectionStatus(listener: ConnectionStatusListener): () => void;

  /**
   * Get latest snapshot of device telemetry
   */
  getLatestTelemetry(): DeviceTelemetry;

  /**
   * Clean up background timers and listeners
   */
  destroy(): void;
}
