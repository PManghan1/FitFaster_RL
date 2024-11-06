import babelJest from 'babel-jest';

export default babelJest.createTransformer({
  presets: ['babel-preset-expo'],
  plugins: [
    'react-native-reanimated/plugin',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-proposal-class-properties',
    'nativewind/babel',
    '@babel/plugin-transform-runtime',
    'dynamic-import-node',
  ],
  babelrc: false,
  configFile: false,
});
