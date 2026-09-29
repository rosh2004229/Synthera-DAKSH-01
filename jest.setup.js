/* eslint-disable no-undef */
const mockAsyncStorage = {
  setItem: jest.fn(() => Promise.resolve(null)),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
  clear: jest.fn(() => Promise.resolve(null)),
  getAllKeys: jest.fn(() => Promise.resolve([])),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('react-native-screens', () => {
  const React = require('react');
  const View = require('react-native').View;
  const HeaderConfig = (props: any) => React.createElement(View, props);

  return {
    enableScreens: jest.fn(),
    screensEnabled: jest.fn(() => false),
    Screen: View,
    ScreenContainer: View,
    NativeScreen: View,
    NativeScreenContainer: View,
    ScreenStack: View,
    ScreenStackItem: View,
    FullWindowOverlay: View,
    ScreenStackHeaderConfig: HeaderConfig,
    ScreenStackHeaderSubview: View,
    SearchBar: View,
    shouldUseActivityState: true,
    compatibilityFlags: {
      usesNewAndroidHeaderHeightImplementation: true,
    },
  };
});
