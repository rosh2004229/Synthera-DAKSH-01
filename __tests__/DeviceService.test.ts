import { deviceService } from '../src/services/DeviceService';
import { store } from '../src/store/store';

describe('DeviceService Lifecycle & Command Tests', () => {
  beforeAll(() => {
    deviceService.initialize();
  });

  afterAll(() => {
    deviceService.destroy();
  });

  test('open command dispatches and updates state to OPENING', async () => {
    const success = await deviceService.open();
    expect(success).toBe(true);
    const lastCmd = store.getState().device.lastCommand;
    expect(lastCmd).toBe('OPEN');
  });

  test('close command dispatches and updates state to CLOSING', async () => {
    const success = await deviceService.close();
    expect(success).toBe(true);
    const lastCmd = store.getState().device.lastCommand;
    expect(lastCmd).toBe('CLOSE');
  });

  test('stop command dispatches and updates state to STOP', async () => {
    const success = await deviceService.stop();
    expect(success).toBe(true);
    const lastCmd = store.getState().device.lastCommand;
    expect(lastCmd).toBe('STOP');
  });

  test('setOperatingMode switches mode to EMG and AUTO', async () => {
    await deviceService.setOperatingMode('EMG');
    expect(store.getState().device.mode).toBe('EMG');

    await deviceService.setOperatingMode('AUTO');
    expect(store.getState().device.mode).toBe('AUTO');
  });

  test('disconnect and reconnect lifecycle', async () => {
    await deviceService.disconnect();
    expect(store.getState().device.connectionStatus).toBe('DISCONNECTED');

    const connected = await deviceService.reconnect();
    expect(connected).toBe(true);
    expect(store.getState().device.connectionStatus).toBe('CONNECTED');
  });
});
