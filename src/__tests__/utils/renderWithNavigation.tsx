import { render, RenderAPI } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

/**
 * Renders a component wrapped in a NavigationContainer for testing.
 * This utility helps test components that require navigation context.
 *
 * @example
 * ```tsx
 * const { getByText } = renderWithNavigation(<MyScreen />);
 * expect(getByText('Welcome')).toBeTruthy();
 * ```
 *
 * @param component - The React component to render
 * @returns The rendered component with all testing utilities from @testing-library/react-native
 */
export function renderWithNavigation(component: React.ReactNode): RenderAPI {
  return render(<NavigationContainer>{component}</NavigationContainer>);
}
