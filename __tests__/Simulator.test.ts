import { ProstheticHandSimulator } from '../src/services/ProstheticHandSimulator';

describe('ProstheticHandSimulator Kinematics and Safety Tests', () => {
  let simulator: ProstheticHandSimulator;

  beforeEach(() => {
    simulator = new ProstheticHandSimulator({
      minimumAngle: 0,
      maximumAngle: 63,
      emgThreshold: 120,
      batteryWarningThreshold: 20,
      speedDegreesPerSecond: 100, // Faster for testing
    });
  });

  afterEach(() => {
    simulator.stop();
  });

  test('Initial state matches requirements (Battery: ~82%, Position: 45°, Mode: AUTO)', () => {
    const telemetry = simulator.getTelemetry();
    expect(telemetry.battery).toBe(82);
    expect(telemetry.position).toBe(45);
    expect(telemetry.mode).toBe('AUTO');
    expect(telemetry.handState).toBe('HOLDING');
  });

  test('OPEN command targets minimumAngle (0°) and updates direction to OPENING', () => {
    simulator.setMode('MANUAL');
    const success = simulator.openHand();
    expect(success).toBe(true);
    const telemetry = simulator.getTelemetry();
    expect(telemetry.targetPosition).toBe(0);
    expect(telemetry.handState).toBe('OPENING');
  });

  test('CLOSE command targets maximumAngle (63°) and updates direction to CLOSING', () => {
    simulator.setMode('MANUAL');
    const success = simulator.closeHand();
    expect(success).toBe(true);
    const telemetry = simulator.getTelemetry();
    expect(telemetry.targetPosition).toBe(63);
    expect(telemetry.handState).toBe('CLOSING');
  });

  test('EMERGENCY STOP immediately halts movement at current position', () => {
    simulator.setMode('MANUAL');
    simulator.closeHand();
    const stopped = simulator.emergencyStop();
    expect(stopped).toBe(true);
    const telemetry = simulator.getTelemetry();
    expect(telemetry.isMoving).toBe(false);
    expect(telemetry.handState).toBe('STOPPED');
    expect(telemetry.targetPosition).toBe(telemetry.position);
  });

  test('Angle cannot exceed calibrated bounds [0, 63]', () => {
    simulator.setPositionDirect(120);
    expect(simulator.getTelemetry().position).toBe(63);

    simulator.setPositionDirect(-50);
    expect(simulator.getTelemetry().position).toBe(0);
  });

  test('EMG simulated burst triggers contraction', () => {
    let triggeredEvent = false;
    simulator.start(
      () => {},
      (type, title) => {
        if (type === 'SENSOR' && title.includes('Contraction')) {
          triggeredEvent = true;
        }
      }
    );

    simulator.triggerContraction(300);
    const telemetry = simulator.getTelemetry();
    expect(telemetry.isContractionDetected).toBe(true);
    expect(triggeredEvent).toBe(true);
  });
});
