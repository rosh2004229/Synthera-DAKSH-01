import {
  ConnectionStatus,
  DeviceCommand,
  DeviceTelemetry,
  OperatingMode,
} from '../types/device';
import { DeviceSettings } from '../types/settings';
import {
  ConnectionStatusListener,
  ICommunicationService,
  TelemetryListener,
} from './ICommunicationService';
import {
  ProstheticHandSimulator,
  SimulatorEventCallback,
} from './ProstheticHandSimulator';

/**
 * MockESP32Service
 *
 * Implements ICommunicationService by wrapping the ProstheticHandSimulator.
 * Simulates micro-controller UART / BLE GATT peripheral behavior:
 * - Connection lifecycle & latency
 * - Command serialization / ACK processing
 * - Disconnect / Reconnect simulations
 * - Telemetry streaming at 20Hz
 */
export class MockESP32Service implements ICommunicationService {
  private simulator: ProstheticHandSimulator;
  private connectionStatus: ConnectionStatus = 'CONNECTED';
  private telemetryListeners: Set<TelemetryListener> = new Set();
  private connectionListeners: Set<ConnectionStatusListener> = new Set();
  private eventCallback: SimulatorEventCallback | null = null;
  private isConnecting: boolean = false;

  constructor(
    initialSettings?: Partial<DeviceSettings>,
    eventCallback?: SimulatorEventCallback
  ) {
    this.eventCallback = eventCallback || null;
    this.simulator = new ProstheticHandSimulator(initialSettings);
    this.initSimulator();
  }

  private initSimulator(): void {
    this.simulator.start(
      (telemetry: DeviceTelemetry) => {
        if (this.connectionStatus === 'CONNECTED') {
          this.telemetryListeners.forEach(listener => {
            try {
              listener(telemetry);
            } catch (err) {
              console.warn('Error in telemetry listener:', err);
            }
          });
        }
      },
      (type, title, description) => {
        if (this.eventCallback) {
          this.eventCallback(type, title, description);
        }
      }
    );
  }

  public async connect(): Promise<boolean> {
    if (this.connectionStatus === 'CONNECTED') {
      return true;
    }

    this.setConnectionStatus('CONNECTING');
    if (this.eventCallback) {
      this.eventCallback('SYSTEM', 'ESP32 Connecting', 'Negotiating BLE GATT connection with DAKSH-01');
    }

    // Simulate BLE connection handshake (800ms)
    await new Promise(resolve => setTimeout(() => resolve(true), 800));

    this.setConnectionStatus('CONNECTED');
    if (this.eventCallback) {
      this.eventCallback('SYSTEM', 'Device Connected', 'ESP32 BLE GATT connection established successfully');
    }
    return true;
  }

  public async disconnect(): Promise<boolean> {
    if (this.connectionStatus === 'DISCONNECTED') {
      return true;
    }

    this.setConnectionStatus('DISCONNECTED');
    if (this.eventCallback) {
      this.eventCallback('WARNING', 'Device Disconnected', 'BLE link lost or manually terminated');
    }
    return true;
  }

  public async reconnect(): Promise<boolean> {
    if (this.isConnecting) return false;
    this.isConnecting = true;

    this.setConnectionStatus('RECONNECTING');
    if (this.eventCallback) {
      this.eventCallback('SYSTEM', 'Reconnection Attempt', 'Scanning for DAKSH-01 BLE advertisement packets...');
    }

    // Simulate realistic BLE scan and connection delay (1200ms)
    await new Promise(resolve => setTimeout(() => resolve(true), 1200));

    // Simulated success rate (95% success)
    const success = Math.random() > 0.05;

    if (success) {
      this.setConnectionStatus('CONNECTED');
      if (this.eventCallback) {
        this.eventCallback('SYSTEM', 'Device Reconnected', 'DAKSH-01 online. Telemetry stream resumed.');
      }
      this.isConnecting = false;
      return true;
    } else {
      this.setConnectionStatus('ERROR');
      if (this.eventCallback) {
        this.eventCallback('ERROR', 'Reconnection Failed', 'Device did not respond to BLE connection request');
      }
      this.isConnecting = false;
      return false;
    }
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  private setConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    this.connectionListeners.forEach(listener => {
      try {
        listener(status);
      } catch (err) {
        console.warn('Error in connection listener:', err);
      }
    });
  }

  public async sendCommand(command: DeviceCommand, payload?: any): Promise<boolean> {
    // Safety check: Cannot send commands when disconnected
    if (this.connectionStatus !== 'CONNECTED') {
      if (this.eventCallback) {
        this.eventCallback(
          'ERROR',
          'Command Rejected',
          `Cannot send ${command}: Device is ${this.connectionStatus}`
        );
      }
      return false;
    }

    // Simulate 20ms micro-controller transmission delay
    await new Promise(resolve => setTimeout(() => resolve(true), 20));

    switch (command) {
      case 'OPEN':
        return this.simulator.openHand();

      case 'CLOSE':
        return this.simulator.closeHand();

      case 'STOP':
        return this.simulator.emergencyStop();

      case 'SET_MODE':
        if (payload && (payload === 'MANUAL' || payload === 'EMG' || payload === 'AUTO')) {
          return this.simulator.setMode(payload as OperatingMode);
        }
        return false;

      case 'TRIGGER_EMG_CONTRACTION':
        this.simulator.triggerContraction(payload || 280);
        return true;

      case 'DISCONNECT':
        return this.disconnect();

      case 'RECONNECT':
        return this.reconnect();

      case 'RESET_DEVICE':
        this.simulator.resetBattery();
        this.simulator.setMode('MANUAL');
        this.simulator.openHand();
        return true;

      case 'CALIBRATE':
        if (payload && typeof payload.angle === 'number') {
          this.simulator.setPositionDirect(payload.angle);
        }
        return true;

      default:
        if (this.eventCallback) {
          this.eventCallback('ERROR', 'Invalid Command', `Unrecognized command opcode: ${command}`);
        }
        return false;
    }
  }

  public async setOperatingMode(mode: OperatingMode): Promise<boolean> {
    return this.sendCommand('SET_MODE', mode);
  }

  public updateSettings(settings: Partial<DeviceSettings>): void {
    this.simulator.updateSettings(settings);
  }

  public triggerEMGContraction(intensity?: number): void {
    this.simulator.triggerContraction(intensity);
  }

  public subscribeTelemetry(listener: TelemetryListener): () => void {
    this.telemetryListeners.add(listener);
    // Send immediate snapshot
    listener(this.simulator.getTelemetry());
    return () => {
      this.telemetryListeners.delete(listener);
    };
  }

  public subscribeConnectionStatus(listener: ConnectionStatusListener): () => void {
    this.connectionListeners.add(listener);
    listener(this.connectionStatus);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  public getLatestTelemetry(): DeviceTelemetry {
    return this.simulator.getTelemetry();
  }

  public destroy(): void {
    this.simulator.stop();
    this.telemetryListeners.clear();
    this.connectionListeners.clear();
  }
}
