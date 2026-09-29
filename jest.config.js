module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@react-navigation|@reduxjs/toolkit|react-redux|immer|@react-native-async-storage/async-storage|react-native-svg|react-native-screens)/',
  ],
  setupFiles: ['./jest.setup.js'],
};
