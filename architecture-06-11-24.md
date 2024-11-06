# FitFaster Project Architecture Overview

## Project Structure

### Root Configuration Files
- `.detoxrc.js` - Detox E2E testing configuration
- `.env` - Environment variables
- `.env.example` - Example environment variables template
- `.eslintrc.js` - ESLint configuration
- `.prettierrc` / `.prettierrc.js` - Prettier code formatting configuration
- `app.config.ts` - Expo application configuration
- `app.json` - Application metadata
- `App.tsx` - Root application component
- `babel.config.js` - Babel transpiler configuration
- `jest.config.js` - Jest testing configuration
- `metro.config.js` - Metro bundler configuration
- `package.json` - Project dependencies and scripts
- `tailwind.config.js` - TailwindCSS/NativeWind configuration
- `tsconfig.json` / `tsconfig.jest.json` - TypeScript configuration

### Source Code (`/src`)

#### Components
- `/components`
  - `/analytics` - Analytics-related components
  - `/auth` - Authentication components
  - `/common` - Shared/reusable components
  - `/hoc` - Higher-order components
  - `/home` - Home screen components
  - `/nutrition` - Nutrition tracking components
  - `/onboarding` - User onboarding components
  - `/privacy` - Privacy-related components
  - `/styled` - Styled components
  - `/supplement` - Supplement tracking components
  - `/workout` - Workout-related components
  - `ErrorBoundary.tsx` - Global error boundary component

#### Screens
- `/screens`
  - `/auth` - Authentication screens
  - `/onboarding` - Onboarding flow screens
  - `/supplement` - Supplement management screens
  - `AnalyticsScreen.tsx`
  - `ExerciseLibraryScreen.tsx`
  - `HomeScreen.tsx`
  - `NutritionTrackingScreen.tsx`
  - `ProgressScreen.tsx`
  - `WorkoutDetailsScreen.tsx`
  - `WorkoutScreen.tsx`

#### Navigation
- `/navigation`
  - `AppNavigator.tsx` - Main app navigation
  - `AuthNavigator.tsx` - Authentication flow
  - `OnboardingNavigator.tsx` - Onboarding flow
  - `RootNavigator.tsx` - Root navigation setup
  - `SupplementNavigator.tsx` - Supplement section navigation

#### State Management
- `/store`
  - `/hooks` - Custom store hooks
  - `/middleware` - Store middleware
  - `/selectors` - State selectors
  - `auth.store.ts`
  - `nutrition.store.ts`
  - `onboarding.store.ts`
  - `progress.store.ts`
  - `supplement.store.ts`
  - `workout.store.ts`
  - `types.ts`

#### Services
- `/services`
  - `analytics.ts` - Analytics service
  - `base.ts` - Base service class
  - `biometric.ts` - Biometric authentication
  - `cache.ts` - Caching service
  - `error.ts` - Error handling service
  - `factory.ts` - Service factory
  - `notification.ts` - Push notifications
  - `nutrition.ts` - Nutrition tracking
  - `performance.ts` - Performance monitoring
  - `preferences.ts` - User preferences
  - `profile.ts` - User profile management
  - `progress.ts` - Progress tracking
  - `supabase.ts` - Supabase client/configuration
  - `sync.ts` - Offline synchronization
  - `twoFactor.ts` - 2FA implementation
  - `workout.ts` - Workout management

#### Hooks
- `/hooks`
  - `useAccessibilityFocus.ts`
  - `useConnectionAlert.ts`
  - `useOfflineSync.ts`
  - `useOnboarding.ts`
  - `useOnboardingAnalytics.ts`
  - `usePerformanceMonitoring.ts`
  - `useSupplementAnalytics.ts`
  - `useSupplementPerformance.ts`
  - `useSupplementReminders.ts`

#### Types
- `/types`
  - `analytics.ts`
  - `api.ts`
  - `auth.ts`
  - `bottom-sheet.ts`
  - `branded.ts`
  - `goals.ts`
  - `icons.ts`
  - `nutrition.ts`
  - `onboarding.ts`
  - `preferences.ts`
  - `profile.ts`
  - `progress.ts`
  - `supabase.ts`
  - Type definitions (*.d.ts files)

#### Testing
- `/__tests__`
  - `/integration` - Integration tests
  - `/utils` - Test utilities
  - `/__mocks__` - Mock implementations
  - `/setup` - Test setup files

#### E2E Testing
- `/e2e`
  - `auth.e2e.ts`
  - `nutrition.e2e.ts`
  - `workout.e2e.ts`
  - `setup.ts`
  - `jest.config.js`

#### Assets
- `/assets`
  - `adaptive-icon.png`
  - `favicon.png`
  - `icon.png`
  - `splash.png`

#### Platform Specific
- `/android` - Android specific configuration and build files

### Documentation
- `documentation-complete.md`
- `documentation-index.md`
- `DRD.md`
- `INSTALL.md`
- `README.md`
- Various error documentation and implementation guides

## Key Technical Aspects

1. **Frontend Framework**: React Native with Expo
2. **Language**: TypeScript with strict type checking
3. **State Management**: Zustand
4. **Styling**: NativeWind (TailwindCSS for React Native)
5. **Navigation**: React Navigation
6. **Backend**: Supabase
7. **Testing**: Jest + React Native Testing Library
8. **E2E Testing**: Detox

## Architecture Principles

1. **Feature-based Structure**: Code organized by feature rather than type
2. **Clean Architecture**: Clear separation of concerns
3. **Type Safety**: Strict TypeScript implementation
4. **Component Architecture**: Functional components with hooks
5. **Error Handling**: Comprehensive error boundaries and handling
6. **Testing**: Comprehensive test coverage
7. **Performance**: Built-in monitoring and optimization
8. **Offline Support**: Robust offline synchronization
9. **Security**: Built-in security best practices
10. **Accessibility**: WCAG compliance focus
