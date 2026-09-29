import {
  DeviceTelemetry,
  HandState,
  OperatingMode,
} from '../types/device';
import { DeviceSettings, DEFAULT_SETTINGS } from '../types/settings';

export type SimulatorTelemetryCallback = (telemetry: DeviceTelemetry) => void;
export type SimulatorEventCallback = (
  type: 'COMMAND' | 'SENSOR' | 'WARNING' | 'SYSTEM' | 'ERROR' | 'CALIBRATION',
  title: string,
  description: string
) => void;

/**
 * Real-time physics and telemetry simulation engine for DAKSH-01 prosthetic hand.
 * Simulates micro-controller firmware execution, servo motor kinematics,
 * biopotential EMG sensor stream, battery discharge curve, and safety interlocks.
 */
export class ProstheticHandSimulator {
  // Configurable bounds and thresholds
  private settings: DeviceSettings = { ...DEFAULT_SETTINGS };

  // Current mechanical state
  private position: number = 45.0; // Initial angle 45° (Holding grasp from PDF)
  private targetPosition: number = 45.0;
  private handState: HandState = 'HOLDING';
  private mode: OperatingMode = 'MANUAL';
  private isMoving: boolean = false;
  private movementDirection: 'OPENING' | 'CLOSING' | 'NONE' = 'NONE';

  // Battery simulation
  private battery: number = 82.0; // Initial 82% from PDF specification
  private batteryDrainAccumulator: number = 0;
  private hasEmittedLowBatteryWarning: boolean = false;

  // EMG Biopotential simulation
  private emgRaw: number = 55;
  private emgBaseline: number = 55;
  private isContractionActive: boolean = false;
  private contractionIntensity: number = 0;
  private contractionDecay: number = 0;
  private lastContractionTriggerTime: number = 0;
  private emgPhase: number = 0;

  // Auto mode sequencer
  private autoCyclePhase: 'OPENING' | 'HOLD_OPEN' | 'CLOSING' | 'HOLD_CLOSED' = 'OPENING';
  private autoHoldTimerMs: number = 0;
  private readonly AUTO_HOLD_DURATION_MS = 3000; // Hold at full extension for 3.0s

  // General telemetry
  private temperature: number = 34.2;
  private uptimeSeconds: number = 0;
  private firmwareVersion: string = 'v2.4.1-sim';

  // Loop timer
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly TICK_MS = 100; // 10Hz balanced update rate for smooth 60fps UI
  private onTelemetryCallback: SimulatorTelemetryCallback | null = null;
  private onEventCallback: SimulatorEventCallback | null = null;

  constructor(initialSettings?: Partial<DeviceSettings>) {
    if (initialSettings) {
      this.settings = { ...this.settings, ...initialSettings };
    }
  }

  /**
   * Start the 20Hz simulation loop
   */
  public start(
    onTelemetry: SimulatorTelemetryCallback,
    onEvent?: SimulatorEventCallback
  ): void {
    this.onTelemetryCallback = onTelemetry;
    this.onEventCallback = onEvent || null;

    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      this.tick();
    }, this.TICK_MS);

    // Initial broadcast
    this.broadcastTelemetry();
  }

  /**
   * Stop the simulation loop
   */
  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Main simulation tick (runs every 50ms)
   */
  private tick(): void {
    const dtSeconds = this.TICK_MS / 1000;
    this.uptimeSeconds += dtSeconds;

    // 1. Simulate EMG Biopotential signal
    this.updateEMG(dtSeconds);

    // 2. Simulate battery discharge
    this.updateBattery(dtSeconds);

    // 3. Process Automatic Mode Sequencer
    if (this.mode === 'AUTO') {
      this.processAutoMode(dtSeconds);
    }

    // 4. Process Servo Kinematics / Position Interpolation
    this.updateKinematics(dtSeconds);

    // 5. Thermal simulation
    this.updateThermals(dtSeconds);

    // 6. Broadcast telemetry
    this.broadcastTelemetry();
  }

  /**
   * Biopotential EMG Sensor Signal Generator
   * Produces realistic baseline physiological noise, respiratory modulation,
   * high-frequency motor unit action potentials (MUAP), and synthetic contraction spikes.
   */
  private updateEMG(dtSeconds: number): void {
    this.emgPhase += dtSeconds * 8; // Phase progression

    // Resting baseline oscillation (simulating baseline noise + 50Hz mains drift filter)
    const baselineWobble = Math.sin(this.emgPhase * 0.7) * 8 + Math.cos(this.emgPhase * 1.9) * 5;
    const gaussianNoise = (Math.random() - 0.5) * 16;
    let computedEMG = this.emgBaseline + baselineWobble + gaussianNoise;

    // Active muscle contraction pulse calculation
    if (this.isContractionActive) {
      this.contractionIntensity -= this.contractionDecay * dtSeconds;
      if (this.contractionIntensity <= 0) {
        this.isContractionActive = false;
        this.contractionIntensity = 0;
      } else {
        // High frequency burst during contraction
        const burstJitter = (Math.random() - 0.5) * (this.contractionIntensity * 0.4);
        computedEMG += this.contractionIntensity + burstJitter;
      }
    }

    // Clamp EMG value to 10 - 500 range
    this.emgRaw = Math.round(Math.max(10, Math.min(500, computedEMG)));

    // EMG Mode Trigger Detection (Edge trigger with refractory cooldown)
    if (this.mode === 'EMG') {
      const now = Date.now();
      const isAboveThreshold = this.emgRaw >= this.settings.emgThreshold;
      const cooldownMs = 850; // Refractory period

      if (isAboveThreshold && now - this.lastContractionTriggerTime > cooldownMs) {
        this.lastContractionTriggerTime = now;
        this.handleEMGTrigger();
      }
    }
  }

  /**
   * Action triggered when muscle contraction exceeds threshold in EMG mode
   */
  private handleEMGTrigger(): void {
    if (this.battery <= 5) {
      this.logEvent(
        'WARNING',
        'EMG Command Inhibited',
        'Critical battery level prevents servo actuation'
      );
      return;
    }

    this.logEvent(
      'SENSOR',
      'EMG Contraction Detected',
      `Signal peak ${this.emgRaw} µV crossed threshold ${this.settings.emgThreshold} µV`
    );

    // Toggle hand state: if closer to closed or closing -> OPEN, else -> CLOSE
    const midPoint = (this.settings.minimumAngle + this.settings.maximumAngle) / 2;
    if (this.position > midPoint || this.handState === 'CLOSING' || this.handState === 'CLOSED') {
      this.openHand();
    } else {
      this.closeHand();
    }
  }

  /**
   * Trigger a simulated muscle contraction
   */
  public triggerContraction(intensity: number = 260): void {
    this.isContractionActive = true;
    this.contractionIntensity = intensity;
    this.contractionDecay = intensity / 0.45; // Decay in ~450ms
    this.logEvent('SENSOR', 'Manual Contraction Triggered', `Simulated muscle burst of ${intensity} µV`);
  }

  /**
   * Process Auto Mode Sequence: OPEN -> HOLD -> CLOSE -> HOLD -> repeat
   */
  private processAutoMode(dtSeconds: number): void {
    if (this.handState === 'STOPPED' || this.handState === 'ERROR') {
      return;
    }

    if (this.battery <= 5) {
      this.handState = 'STOPPED';
      this.isMoving = false;
      this.logEvent('WARNING', 'Auto Mode Halted', 'Battery critically low');
      return;
    }

    switch (this.autoCyclePhase) {
      case 'OPENING':
        this.targetPosition = this.settings.minimumAngle;
        if (Math.abs(this.position - this.settings.minimumAngle) < 0.5) {
          this.autoCyclePhase = 'HOLD_OPEN';
          this.autoHoldTimerMs = 0;
        }
        break;

      case 'HOLD_OPEN':
        this.autoHoldTimerMs += dtSeconds * 1000;
        if (this.autoHoldTimerMs >= this.AUTO_HOLD_DURATION_MS) {
          this.autoCyclePhase = 'CLOSING';
        }
        break;

      case 'CLOSING':
        this.targetPosition = this.settings.maximumAngle;
        if (Math.abs(this.position - this.settings.maximumAngle) < 0.5) {
          this.autoCyclePhase = 'HOLD_CLOSED';
          this.autoHoldTimerMs = 0;
        }
        break;

      case 'HOLD_CLOSED':
        this.autoHoldTimerMs += dtSeconds * 1000;
        if (this.autoHoldTimerMs >= this.AUTO_HOLD_DURATION_MS) {
          this.autoCyclePhase = 'OPENING';
        }
        break;
    }
  }

  /**
   * Servo Kinematics: Smooth angle interpolation towards targetPosition
   */
  private updateKinematics(dtSeconds: number): void {
    const diff = this.targetPosition - this.position;
    const absDiff = Math.abs(diff);

    // If within tiny tolerance, snap to target
    if (absDiff < 0.2) {
      this.position = this.targetPosition;
      this.isMoving = false;
      this.movementDirection = 'NONE';

      if (this.position <= this.settings.minimumAngle + 0.5) {
        this.handState = 'OPEN';
      } else if (this.position >= this.settings.maximumAngle - 0.5) {
        this.handState = 'CLOSED';
      } else if (this.handState !== 'STOPPED' && this.handState !== 'CALIBRATING') {
        this.handState = 'HOLDING';
      }
      return;
    }

    // Hand is actively moving
    this.isMoving = true;
    const speed = this.settings.speedDegreesPerSecond || 45; // deg/sec
    const maxDelta = speed * dtSeconds;
    const actualDelta = Math.min(absDiff, maxDelta) * Math.sign(diff);

    this.position += actualDelta;

    // Constrain position within hard limits
    this.position = Math.max(
      this.settings.minimumAngle,
      Math.min(this.settings.maximumAngle, this.position)
    );

    if (actualDelta > 0) {
      this.movementDirection = 'CLOSING';
      this.handState = 'CLOSING';
    } else {
      this.movementDirection = 'OPENING';
      this.handState = 'OPENING';
    }
  }

  /**
   * Battery discharge simulation based on idle vs active motor load
   */
  private updateBattery(dtSeconds: number): void {
    // Idle consumption: ~0.0008% / sec (lasts ~35 hours idle)
    // Motor actuation consumption: ~0.025% / sec while actively moving servos
    const drainRatePerSec = this.isMoving ? 0.025 : 0.0008;
    this.batteryDrainAccumulator += drainRatePerSec * dtSeconds;

    if (this.batteryDrainAccumulator >= 0.05) {
      this.battery = Math.max(0, parseFloat((this.battery - this.batteryDrainAccumulator).toFixed(2)));
      this.batteryDrainAccumulator = 0;

      // Low battery warning threshold trigger
      if (
        this.battery <= this.settings.batteryWarningThreshold &&
        !this.hasEmittedLowBatteryWarning
      ) {
        this.hasEmittedLowBatteryWarning = true;
        this.logEvent(
          'WARNING',
          'Low Battery Warning',
          `Prosthetic hand battery depleted to ${Math.round(this.battery)}% (Threshold: ${this.settings.batteryWarningThreshold}%)`
        );
      }
    }
  }

  /**
   * Internal temperature simulation
   */
  private updateThermals(dtSeconds: number): void {
    // Temperature rises slightly under continuous servo load, dissipates when idle
    const targetTemp = this.isMoving ? 38.5 : 33.0;
    this.temperature += (targetTemp - this.temperature) * (dtSeconds * 0.05);
  }

  /**
   * Command Handlers
   */
  public openHand(): boolean {
    if (this.battery <= 5) {
      this.logEvent('WARNING', 'Movement Blocked', 'Critical battery - charge required');
      return false;
    }
    this.mode = 'MANUAL';
    this.targetPosition = this.settings.minimumAngle;
    this.handState = 'OPENING';
    this.isMoving = true;
    this.movementDirection = 'OPENING';
    this.logEvent('COMMAND', 'OPEN Command Executed', `Targeting ${this.settings.minimumAngle}°`);
    this.broadcastTelemetry();
    return true;
  }

  public closeHand(): boolean {
    if (this.battery <= 5) {
      this.logEvent('WARNING', 'Movement Blocked', 'Critical battery - charge required');
      return false;
    }
    this.mode = 'MANUAL';
    this.targetPosition = this.settings.maximumAngle;
    this.handState = 'CLOSING';
    this.isMoving = true;
    this.movementDirection = 'CLOSING';
    this.logEvent('COMMAND', 'CLOSE Command Executed', `Targeting ${this.settings.maximumAngle}°`);
    this.broadcastTelemetry();
    return true;
  }

  public emergencyStop(): boolean {
    // Highest priority: immediately halt at exact current position
    this.mode = 'MANUAL';
    this.targetPosition = this.position;
    this.isMoving = false;
    this.movementDirection = 'NONE';
    this.handState = 'STOPPED';

    this.logEvent(
      'COMMAND',
      'EMERGENCY STOP Triggered',
      `Actuation halted instantly at angle ${this.position.toFixed(1)}°`
    );
    this.broadcastTelemetry();
    return true;
  }

  public setMode(newMode: OperatingMode): boolean {
    const oldMode = this.mode;
    this.mode = newMode;

    if (newMode === 'AUTO') {
      this.autoCyclePhase = 'OPENING';
      this.autoHoldTimerMs = 0;
      if (this.handState === 'STOPPED') {
        this.handState = 'OPENING';
      }
    } else if (newMode === 'MANUAL' || newMode === 'EMG') {
      // In manual or EMG mode, if moving in auto, hold current position
      if (oldMode === 'AUTO' && this.isMoving) {
        this.targetPosition = this.position;
      }
    }

    this.logEvent('SYSTEM', 'Operating Mode Changed', `Switched from ${oldMode} to ${newMode}`);
    this.broadcastTelemetry();
    return true;
  }

  public setPositionDirect(angle: number): void {
    this.mode = 'MANUAL';
    this.position = Math.max(this.settings.minimumAngle, Math.min(this.settings.maximumAngle, angle));
    this.targetPosition = this.position;
    this.isMoving = false;
    this.broadcastTelemetry();
  }

  public updateSettings(newSettings: Partial<DeviceSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    // Re-clamp position if limits changed
    this.position = Math.max(
      this.settings.minimumAngle,
      Math.min(this.settings.maximumAngle, this.position)
    );
    this.targetPosition = Math.max(
      this.settings.minimumAngle,
      Math.min(this.settings.maximumAngle, this.targetPosition)
    );
    this.broadcastTelemetry();
  }

  public resetBattery(): void {
    this.battery = 100;
    this.hasEmittedLowBatteryWarning = false;
    this.logEvent('SYSTEM', 'Battery Recharged', 'Prosthetic battery reset to 100%');
  }

  /**
   * Log an event via callback
   */
  private logEvent(
    type: 'COMMAND' | 'SENSOR' | 'WARNING' | 'SYSTEM' | 'ERROR' | 'CALIBRATION',
    title: string,
    description: string
  ): void {
    if (this.onEventCallback) {
      this.onEventCallback(type, title, description);
    }
  }

  /**
   * Construct and broadcast snapshot of current telemetry
   */
  public getTelemetry(): DeviceTelemetry {
    return {
      battery: Math.round(this.battery),
      position: parseFloat(this.position.toFixed(1)),
      targetPosition: parseFloat(this.targetPosition.toFixed(1)),
      emg: this.emgRaw,
      emgBaseline: this.emgBaseline,
      isContractionDetected: this.isContractionActive,
      mode: this.mode,
      handState: this.handState,
      isMoving: this.isMoving,
      movementDirection: this.movementDirection,
      temperature: parseFloat(this.temperature.toFixed(1)),
      firmwareVersion: this.firmwareVersion,
      uptimeSeconds: Math.round(this.uptimeSeconds),
    };
  }

  private broadcastTelemetry(): void {
    if (this.onTelemetryCallback) {
      this.onTelemetryCallback(this.getTelemetry());
    }
  }
}
