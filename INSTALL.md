# Installation Instructions

## Prerequisites
- Node.js (v16 or higher)
- Yarn or npm
- Git
- Expo CLI (`npm install -g expo-cli`)
- Xcode (for iOS development)
- Android Studio (for Android development)

## Installation Steps

1. First, install all dependencies:
```bash
# Using Yarn (recommended)
yarn install

# Or using npm
npm install
```

2. Set up Husky for git hooks:
```bash
# Initialize Husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "yarn lint-staged"
```

3. Install Expo development build:
```bash
# Install Expo development client
expo install expo-dev-client

# Generate native code
expo prebuild
```

4. Install iOS pods (if developing for iOS):
```bash
cd ios
pod install
cd ..
```

5. Set up environment variables:
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your configuration values
```

6. Verify the installation:
```bash
# Run TypeScript check
yarn typecheck

# Run linting
yarn lint

# Run tests
yarn test

# Start the development server
yarn start
```

## Platform-Specific Setup

### iOS
```bash
# Build iOS app
yarn ios
```

### Android
```bash
# Build Android app
yarn android
```

## Troubleshooting

If you encounter any issues:

1. Clear all caches:
```bash
# Clear Yarn cache
yarn cache clean

# Clear React Native cache
yarn start --clear

# Clear Watchman cache (if using Watchman)
watchman watch-del-all
```

2. Reset the installation:
```bash
# Remove dependencies
rm -rf node_modules

# Remove iOS pods
cd ios && rm -rf Pods && rm -rf build && cd ..

# Remove Android build
cd android && ./gradlew clean && cd ..

# Reinstall everything
yarn install
```

## Development Tools

After installation, you can use these commands:

- `yarn start` - Start the development server
- `yarn test` - Run tests
- `yarn lint` - Run ESLint
- `yarn typecheck` - Run TypeScript checks
- `yarn test:e2e` - Run E2E tests (requires setup)
- `yarn test:coverage` - Run tests with coverage report

## Additional Configuration

1. Configure your IDE:
   - Install ESLint extension
   - Install Prettier extension
   - Enable format on save

2. Set up mobile devices:
   - iOS Simulator (via Xcode)
   - Android Emulator (via Android Studio)
   - Physical devices (via Expo Go app)

## Next Steps

After installation:
1. Review the README.md for project documentation
2. Check the Updates.md for latest changes
3. Start the development server with `yarn start`
4. Begin development!
