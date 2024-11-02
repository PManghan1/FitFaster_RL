# FitFaster

A comprehensive fitness tracking application built with React Native, focusing on performance, security, and user experience.

## Technical Stack

- **Frontend Framework**: React Native (Expo)
- **Language**: TypeScript
- **State Management**: Zustand
- **Backend/Database**: Supabase
- **Styling**: NativeWind
- **Navigation**: React Navigation
- **Testing**: Jest + React Native Testing Library

## Architecture

The project follows a feature-based structure with clean architecture principles:

```
/src
  /components      # Reusable UI components
  /screens         # Screen components
  /navigation      # Navigation configuration
  /hooks          # Custom React hooks
  /services       # API and business logic
  /store          # State management
  /types          # TypeScript definitions
  /utils          # Utility functions
  /constants      # Constants and configuration
```

## Features

### Authentication
- Email-based authentication
- Social authentication integration
- Two-factor authentication
- Secure password recovery
- Biometric authentication support

### Nutrition Tracking
- Meal logging and tracking
- Barcode scanner for food items
- Portion size selection
- Nutritional information display
- Daily nutrition summaries

### Workout Management
- Exercise library
- Workout timer
- Set and rep tracking
- Exercise selection interface
- Workout history

### Progress Tracking
- Progress visualization
- Performance metrics
- Data analytics

### Privacy & Security
- Data sensitivity indicators
- Privacy consent management
- Secure input handling
- Security badges
- Privacy notices

## Setup & Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Copy `.env.example` to `.env` and configure environment variables
4. Start the development server:
```bash
npm start
```

## Development

### Type Safety
- Strict TypeScript configuration
- No 'any' types allowed
- Branded types for type-safe identifiers

### Testing
- Unit tests with Jest
- Integration tests
- E2E tests with Detox
- Performance testing

### Performance Optimization
- Performance monitoring hooks
- API performance tracking
- State management optimization
- Error boundaries implementation

### Code Quality
- ESLint configuration
- Prettier formatting
- Strict type checking
- Error handling patterns

## Security Features

- Two-factor authentication
- Biometric authentication
- Secure data storage
- Privacy-first approach
- Data sensitivity management

## Testing

Run tests using:

```bash
# Unit and integration tests
npm test

# E2E tests
npm run e2e

# Performance tests
npm run test:perf
```

## Error Handling

The application implements comprehensive error handling:
- Global error boundaries
- Component-level error fallbacks
- Service-level error management
- Type-safe error handling

## Performance Monitoring

Built-in performance monitoring includes:
- API call tracking
- State updates monitoring
- Performance metrics collection
- Optimization suggestions

## License

See [LICENSE](LICENSE) file for details.
