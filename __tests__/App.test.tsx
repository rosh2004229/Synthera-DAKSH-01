/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { deviceService } from '../src/services/DeviceService';

describe('App Root Integration Test', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    deviceService.destroy();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('App boots and renders correctly without crashing', async () => {
    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<App />);
      jest.advanceTimersByTime(100);
    });

    expect(tree).toBeDefined();

    await ReactTestRenderer.act(async () => {
      tree.unmount();
    });
  });
});

