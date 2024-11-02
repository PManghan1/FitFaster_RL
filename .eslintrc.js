module.exports = {
  root: true,
  extends: ['universe/native', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  plugins: ['react', 'react-native', 'react-hooks'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    // React Native specific rules
    'react-native/no-unused-styles': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-raw-text': ['warn', { skip: ['Text'] }],

    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // React rules
    'react/prop-types': 'off', // Since we use TypeScript
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
