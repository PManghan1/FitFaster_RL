module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
          alias: {
            '@': './src',
            '@config': './src/config',
            '@services': './src/services',
            '@components': './src/components',
            '@screens': './src/screens',
            '@utils': './src/utils',
            '@types': './src/types',
            '@hooks': './src/hooks',
            '@navigation': './src/navigation',
            '@constants': './src/constants',
          },
        },
      ],
    ],
  };
};
