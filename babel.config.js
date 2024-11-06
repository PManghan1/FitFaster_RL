module.exports = function (api) {
  api.cache(true);

  const commonPlugins = [
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
    '@babel/plugin-proposal-export-namespace-from',
    [
      '@babel/plugin-transform-runtime',
      {
        helpers: true,
        regenerator: true,
      },
    ],
  ];

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxRuntime: 'automatic',
        },
      ],
    ],
    env: {
      test: {
        plugins: [
          ...commonPlugins,
          '@babel/plugin-transform-modules-commonjs',
          'dynamic-import-node',
        ],
      },
      production: {
        plugins: [...commonPlugins, 'react-native-reanimated/plugin', 'nativewind/babel'],
      },
    },
  };
};
