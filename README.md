# FitFaster LTD

A React Native fitness tracking application built with Expo, TypeScript, and Supabase.

## Features

- 🏋️‍♂️ Workout tracking and planning
- 📊 Progress visualization
- 🍎 Nutrition tracking
- 📱 Cross-platform (iOS & Android)
- 🔐 Secure authentication
- 💾 Cloud data sync

## Tech Stack

- React Native (Expo)
- TypeScript
- Supabase
- Zustand
- NativeWind
- React Navigation
- Jest + React Native Testing Library

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Studio (for Android development)
- Supabase account

## Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/fitfaster-ltd/fitfaster.git
cd fitfaster
```

2. **Install dependencies**
```bash
yarn install
```

3. **Environment Setup**
- Copy `.env.example` to `.env`
```bash
cp .env.example .env
```
- Fill in your Supabase credentials and other environment variables

4. **Start the development server**
```bash
yarn start
```

5. **Run on platform**
- iOS: `yarn ios`
- Android: `yarn android`
- Web: `yarn web`

## Project Structure

```
src/
├── __mocks__/          # Jest mocks
├── __tests__/          # Test files
├── components/         # Reusable components
│   ├── auth/
│   ├── nutrition/
│   ├── privacy/
│   └── workout/
├── config/            # App configuration
├── constants/         # Constants and theme
├── navigation/        # Navigation setup
├── screens/          # Screen components
├── services/         # API and external services
├── store/            # Zustand state management
├── styles/           # Global styles
├── types/            # TypeScript definitions
└── utils/            # Utility functions
```

## Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use functional components
- Implement proper error handling
- Write unit tests for critical paths
- Use proper typing (no 'any' types)

### Testing
```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test --coverage

# Run specific test file
yarn test path/to/test
```

### Type Checking
```bash
# Run TypeScript compiler
yarn tsc

# Watch mode
yarn tsc --watch
```

### Linting
```bash
# Run ESLint
yarn lint

# Fix auto-fixable issues
yarn lint --fix
```

## Available Scripts

- `yarn start`: Start the Expo development server
- `yarn android`: Run on Android
- `yarn ios`: Run on iOS
- `yarn web`: Run on web
- `yarn test`: Run tests
- `yarn lint`: Run ESLint
- `yarn tsc`: Run TypeScript compiler

## Environment Variables

Required environment variables in `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

The project uses Jest and React Native Testing Library for testing. Key testing principles:

- Write tests for critical user paths
- Mock external dependencies
- Test component behavior, not implementation
- Maintain high test coverage for core functionality

## Deployment

### Expo Build
```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Publishing Updates
```bash
expo publish
```

## Troubleshooting

Common issues and solutions:

1. **Metro bundler issues**
   ```bash
   yarn start --reset-cache
   ```

2. **iOS build fails**
   - Clean Xcode build folder
   - Remove iOS build folder and reinstall pods
   ```bash
   cd ios && rm -rf build/
   pod install
   ```

3. **Android build fails**
   - Clean Android build
   ```bash
   cd android && ./gradlew clean
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@fitfaster.com or join our Slack channel.
