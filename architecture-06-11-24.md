# FitFaster Project Architecture Overview

## Project Structure

```
/src
├── __mocks__/                  # Jest mock files
├── __tests__/                  # Test files
│   ├── components/             # Component tests
│   ├── hooks/                  # Hook tests
│   ├── integration/           # Integration tests
│   ├── navigation/            # Navigation tests
│   ├── performance/           # Performance tests
│   ├── screens/               # Screen tests
│   ├── services/              # Service tests
│   ├── setup/                # Test setup files
│   └── utils/                # Test utilities
├── analytics/                 # Analytics event definitions
│   └── supplement-events.ts
├── components/               # React components
│   ├── ErrorBoundary.tsx
│   ├── analytics/
│   ├── auth/
│   ├── common/
│   ├── hoc/
│   ├── home/
│   ├── nutrition/
│   ├── onboarding/
│   ├── privacy/
│   ├── styled/
│   ├── supplement/
│   └── workout/
├── config/                   # Configuration files
├── constants/               # Application constants
│   ├── config.ts
│   ├── icons.tsx
│   └── theme.ts
├── docs/                    # Documentation
│   └── error-handling.md
├── hooks/                   # Custom React hooks
│   ├── useAccessibilityFocus.ts
│   ├── useConnectionAlert.ts
│   ├── useOfflineSync.ts
│   ├── useOnboarding.ts
│   ├── useOnboardingAnalytics.ts
│   ├── usePerformanceMonitoring.ts
│   ├── useSupplementAnalytics.ts
│   ├── useSupplementPerformance.ts
│   └── useSupplementReminders.ts
├── navigation/              # Navigation configuration
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── OnboardingNavigator.tsx
│   ├── RootNavigator.tsx
│   └── SupplementNavigator.tsx
├── screens/                # Screen components
│   ├── AnalyticsScreen.tsx
│   ├── ExerciseLibraryScreen.tsx
│   ├── HomeScreen.tsx
│   ├── NutritionTrackingScreen.tsx
│   ├── ProgressScreen.tsx
│   ├── WorkoutDetailsScreen.tsx
│   ├── WorkoutScreen.tsx
│   ├── auth/
│   ├── onboarding/
│   └── supplement/
├── services/               # Business logic and API services
│   ├── analytics.ts
│   ├── base.ts
│   ├── biometric.ts
│   ├── cache.ts
│   ├── error.ts
│   ├── factory.ts
│   ├── notification.ts
│   ├── nutrition.ts
│   ├── performance.ts
│   ├── preferences.ts
│   ├── profile.ts
│   ├── progress.ts
│   ├── supabase.ts
│   ├── sync.ts
│   ├── twoFactor.ts
│   └── workout.ts
├── store/                  # State management
│   ├── auth.store.ts
│   ├── nutrition.store.ts
│   ├── onboarding.store.ts
│   ├── progress.store.ts
│   ├── supplement.store.ts
│   ├── types.ts
│   ├── workout.store.ts
│   ├── hooks/
│   ├── middleware/
│   └── selectors/
├── styles/                 # Global styles
│   └── global.css
├── theme/                  # Theme configuration
│   └── index.ts
├── types/                  # TypeScript type definitions
│   ├── analytics.ts
│   ├── api.ts
│   ├── auth.ts
│   ├── bottom-sheet.ts
│   ├── branded.ts
│   ├── goals.ts
│   ├── icons.ts
│   ├── nutrition.ts
│   ├── onboarding.ts
│   ├── preferences.ts
│   ├── profile.ts
│   ├── progress.ts
│   ├── supabase.ts
│   ├── supplement.ts
│   ├── sync.ts
│   └── workout.ts
├── utils/                  # Utility functions
│   ├── database.ts
│   ├── logger.ts
│   ├── performance.ts
│   ├── sanitize.ts
│   ├── supabase.ts
│   ├── tailwind.ts
│   ├── time.ts
│   └── validation.ts
└── validation/            # Form validation schemas
    ├── goals.ts
    └── onboarding.ts
```

## Key Technologies

- **React Native (Expo)**: Mobile application framework
- **TypeScript**: Programming language with strict typing
- **Supabase**: Backend as a Service (BaaS)
- **Zustand**: State management
- **NativeWind**: Tailwind CSS for React Native
- **React Navigation**: Navigation library

## Architecture Patterns

### Clean Architecture
- Clear separation of concerns
- Domain-driven design principles
- Independent business logic layer

### Feature-based Structure
- Features are organized in self-contained modules
- Each feature has its own components, screens, and tests
- Shared utilities and services are centralized

### Testing Strategy
- Jest + React Native Testing Library
- Unit tests for components and hooks
- Integration tests for critical paths
- E2E tests with Detox

## Core Features

### Authentication
- Email and social authentication
- Two-factor authentication
- Secure session management

### Profile Management
- User profiles and preferences
- Data synchronization
- Privacy settings

### Tracking
- Meal tracking
- Workout tracking
- Supplement tracking
- Progress visualization

### Performance Monitoring
- Analytics integration
- Performance metrics
- Error tracking

### Offline Support
- Offline data persistence
- Background sync
- Conflict resolution

## Security Features

- Secure data storage
- Input validation
- Error boundaries
- API security
- Data encryption

## Accessibility

- Screen reader support
- Keyboard navigation
- Color contrast compliance
- Dynamic text sizing

## State Management

### Zustand Stores
- Authentication state
- User preferences
- Workout data
- Nutrition data
- Supplement data
- Progress tracking

### Middleware
- Performance monitoring
- State persistence
- Analytics tracking

## Services Layer

### API Services
- Base service configuration
- Error handling
- Request/response interceptors
- Rate limiting

### Business Logic
- Workout calculations
- Nutrition analysis
- Progress tracking
- Notification management

## Documentation

- API documentation
- Component documentation
- Test coverage reports
- Error handling guidelines
- Performance optimization guides

## Build and Deployment

- Continuous Integration
- Automated testing
- Code quality checks
- Performance monitoring
- Error tracking
- Analytics integration
