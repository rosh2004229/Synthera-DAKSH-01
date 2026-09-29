import { store } from '../src/store/store';
import { updateTelemetry } from '../src/store/deviceSlice';
import { addLog, clearLogs } from '../src/store/logsSlice';

describe('Redux Store State Tests', () => {
  test('Initial state contains default device parameters', () => {
    const state = store.getState();
    expect(state.device.deviceName).toBe('DAKSH-01');
    expect(state.device.battery).toBe(82);
    expect(state.device.position).toBe(45);
    expect(state.settings.settings.minimumAngle).toBe(0);
    expect(state.settings.settings.maximumAngle).toBe(63);
  });

  test('Telemetery updates correctly propagate to device slice', () => {
    store.dispatch(
      updateTelemetry({
        battery: 79,
        position: 22.5,
        targetPosition: 0,
        emg: 140,
        emgBaseline: 55,
        isContractionDetected: false,
        mode: 'MANUAL',
        handState: 'OPENING',
        isMoving: true,
        movementDirection: 'OPENING',
        temperature: 34.8,
        firmwareVersion: 'v2.4.1-sim',
        uptimeSeconds: 120,
      })
    );

    const device = store.getState().device;
    expect(device.battery).toBe(79);
    expect(device.position).toBe(22.5);
    expect(device.handState).toBe('OPENING');
  });

  test('Logs slice adds and clears diagnostic logs', () => {
    store.dispatch(
      addLog('COMMAND', 'Test Action', 'Testing command logging capability')
    );
    let logs = store.getState().logs.logs;
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].title).toBe('Test Action');

    store.dispatch(clearLogs());
    logs = store.getState().logs.logs;
    expect(logs.length).toBe(0);
  });
});
