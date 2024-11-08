/* eslint-disable @typescript-eslint/no-var-requires */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 */
const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,
  resolverMainFields: ['react-native', 'browser', 'main'],
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@config': path.resolve(__dirname, 'src/config'),
    '@services': path.resolve(__dirname, 'src/services'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@screens': path.resolve(__dirname, 'src/screens'),
    '@utils': path.resolve(__dirname, 'src/utils'),
    '@types': path.resolve(__dirname, 'src/types'),
    '@hooks': path.resolve(__dirname, 'src/hooks'),
    '@navigation': path.resolve(__dirname, 'src/navigation'),
    '@constants': path.resolve(__dirname, 'src/constants'),
  },
};

module.exports = config;
