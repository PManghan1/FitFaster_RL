module.exports = {
  preset: 'jest-expo',
  setupFiles: [
    '<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js'
  ],
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/src/__tests__/setup.ts'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|styled-components|expo-constants)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^src/config/(.*)$': '<rootDir>/src/__mocks__/config.ts',
    '^src/config$': '<rootDir>/src/__mocks__/config.ts',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
  ],
  moduleDirectories: [
    'node_modules',
    '<rootDir>/src'
  ],
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
