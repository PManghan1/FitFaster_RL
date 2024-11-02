# FitFaster

A comprehensive fitness tracking application built with React Native (Expo), TypeScript, and modern development practices.

## Tech Stack

- **Frontend Framework**: React Native (Expo)
- **Language**: TypeScript
- **State Management**: Zustand
- **Database**: Supabase
- **Styling**: NativeWind (TailwindCSS)
- **Navigation**: React Navigation
- **Testing**: Jest + React Native Testing Library

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── analytics/     # Analytics-related components
│   ├── auth/          # Authentication components
│   ├── common/        # Shared components
│   ├── nutrition/     # Nutrition tracking components
│   ├── onboarding/    # Onboarding flow components
│   └── privacy/       # Privacy-related components
├── screens/           # Application screens
│   ├── auth/          # Authentication screens
│   ├── onboarding/    # Onboarding flow screens
│   └── ...           # Other main app screens
├── navigation/        # Navigation configuration
├── hooks/            # Custom React hooks
├── services/         # API and business logic
├── store/            # Zustand state management
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── validation/       # Schema validation
└── __tests__/        # Test files
```

## Features

### Enhanced Onboarding Flow
1. Welcome Screen
   - Initial app introduction
   - Basic user information collection

2. Health Metrics Screen
   - Height, weight, age collection
   - Gender selection
   - Medical conditions (optional)
   - Medications (optional)

3. Fitness Level Screen
   - Experience level assessment
   - Weekly activity frequency
   - Typical exercises selection
   - Preferred workout times

4. Goal Timeframes Screen
   - Primary fitness goal selection
   - Target date setting
   - Weekly commitment hours
   - Milestone creation

5. User Consent Screen
   - Health data collection consent
   - Third-party sharing preferences
   - Marketing communications opt-in
   - Terms and privacy policy acceptance

6. Dietary Preferences Screen
   - Diet type selection
   - Food allergies and restrictions
   - Meal frequency preferences
   - Supplement usage tracking
   - Meal preparation style

7. Activity Level Screen
   - Daily activity assessment
   - Occupation type
   - Transportation mode
   - Weekend activity patterns

### Core Features (In Development)
- Nutrition tracking with barcode scanning
- Workout logging and progress tracking
- Supplement intake management
- Analytics and progress visualization
- Offline support
- Social sharing capabilities

## Getting Started

1. Clone the repository:
```bash
git clone [repository-url]
cd fitfaster
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use functional components
- Implement proper error handling
- Write comprehensive tests
- Use proper type definitions (no 'any' types)

### Testing
- Unit tests for components and utilities
- Integration tests for critical paths
- E2E tests for main user flows
- Run tests: `npm test`

### State Management
- Use Zustand for global state
- Implement proper state persistence
- Handle offline scenarios

## Contributing

1. Create a feature branch
2. Implement changes with tests
3. Submit a pull request
4. Ensure CI passes

## License

[License details here]
