import { store } from '../store/store';
import {
  setConnectionStatus,
  setDeviceError,
  setLastCommand,
  updateTelemetry,
} from '../store/deviceSlice';
import { addLog } from '../store/logsSlice';
import { DeviceCommand, OperatingMode } from '../types/device';
import { DeviceSettings } from '../types/settings';
import { ICommunicationService } from './ICommunicationService';
import { MockESP32Service } from './MockESP32Service';

/**
 * DeviceService Singleton
 *
 * Central application layer service connecting UI/Redux to hardware communication.
 * Manages dispatching telemetry to Redux, persisting logs, and executing commands.
 */
class DeviceServiceManager {
  private static instance: DeviceServiceManager;
  private commService: ICommunicationService;
  private isInitialized: boolean = false;
  private unsubscribeTelemetry: (() => void) | null = null;
  private unsubscribeConnection: (() => void) | null = null;

  private constructor() {
    // Default to MockESP32Service. In future, this can dynamically switch to BLEDeviceService.
    this.commService = new MockESP32Service(
      store.getState().settings.settings,
      (type, title, description) => {
        store.dispatch(addLog(type, title, description));
      }
    );
  }

  public static getInstance(): DeviceServiceManager {
    if (!DeviceServiceManager.instance) {
      DeviceServiceManager.instance = new DeviceServiceManager();
    }
    return DeviceServiceManager.instance;
  }

  /**
   * Initialize bridge between communication service and Redux store
   */
  public initialize(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Subscribe to telemetry stream
    this.unsubscribeTelemetry = this.commService.subscribeTelemetry(telemetry => {
      store.dispatch(updateTelemetry(telemetry));
    });

    // 2. Subscribe to connection status changes
    this.unsubscribeConnection = this.commService.subscribeConnectionStatus(status => {
      store.dispatch(setConnectionStatus(status));
    });
  }

  /**
   * Set custom communication implementation (e.g. swap MockESP32Service with BLEDeviceService)
   */
  public setCommunicationService(newService: ICommunicationService): void {
    if (this.unsubscribeTelemetry) this.unsubscribeTelemetry();
    if (this.unsubscribeConnection) this.unsubscribeConnection();
    this.commService.destroy();

    this.commService = newService;
    this.unsubscribeTelemetry = this.commService.subscribeTelemetry(telemetry => {
      store.dispatch(updateTelemetry(telemetry));
    });
    this.unsubscribeConnection = this.commService.subscribeConnectionStatus(status => {
      store.dispatch(setConnectionStatus(status));
    });
  }

  /**
   * High-level Device Commands
   */
  public async sendCommand(command: DeviceCommand, payload?: any): Promise<boolean> {
    store.dispatch(setLastCommand({ command, timestamp: Date.now() }));
    try {
      const success = await this.commService.sendCommand(command, payload);
      if (!success) {
        store.dispatch(setDeviceError(`Command ${command} could not be completed.`));
      }
      return success;
    } catch (err: any) {
      const msg = err?.message || 'Communication transmission failure';
      store.dispatch(setDeviceError(msg));
      store.dispatch(addLog('ERROR', 'Transmission Error', msg));
      return false;
    }
  }

  public async open(): Promise<boolean> {
    return this.sendCommand('OPEN');
  }

  public async close(): Promise<boolean> {
    return this.sendCommand('CLOSE');
  }

  public async stop(): Promise<boolean> {
    return this.sendCommand('STOP');
  }

  public async setOperatingMode(mode: OperatingMode): Promise<boolean> {
    return this.commService.setOperatingMode(mode);
  }

  public async connect(): Promise<boolean> {
    return this.commService.connect();
  }

  public async disconnect(): Promise<boolean> {
    return this.sendCommand('DISCONNECT');
  }

  public async reconnect(): Promise<boolean> {
    return this.commService.reconnect();
  }

  public triggerEMGContraction(intensity?: number): void {
    this.commService.triggerEMGContraction(intensity);
  }

  public syncSettings(settings: Partial<DeviceSettings>): void {
    this.commService.updateSettings(settings);
  }

  public setCalibrationAngle(angle: number): Promise<boolean> {
    return this.sendCommand('CALIBRATE', { angle });
  }

  public resetDevice(): Promise<boolean> {
    return this.sendCommand('RESET_DEVICE');
  }

  public destroy(): void {
    if (this.unsubscribeTelemetry) this.unsubscribeTelemetry();
    if (this.unsubscribeConnection) this.unsubscribeConnection();
    this.commService.destroy();
    this.isInitialized = false;
  }
}

export const deviceService = DeviceServiceManager.getInstance();
