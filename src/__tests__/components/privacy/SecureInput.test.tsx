import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { z } from 'zod';

import { SecureInput } from '../../../components/privacy/SecureInput';

describe('SecureInput', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with required props', () => {
    const { getByText, getByTestId } = render(
      <SecureInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        sensitivityLevel="low"
        testID="test-input"
      />,
    );

    expect(getByText('Test Input')).toBeTruthy();
    expect(getByText('Low Sensitivity')).toBeTruthy();
    expect(getByTestId('test-input')).toBeTruthy();
  });

  it('displays different sensitivity levels correctly', () => {
    const { getByText, rerender } = render(
      <SecureInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        sensitivityLevel="low"
      />,
    );

    expect(getByText('Low Sensitivity')).toBeTruthy();

    rerender(
      <SecureInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        sensitivityLevel="medium"
      />,
    );
    expect(getByText('Medium Sensitivity')).toBeTruthy();

    rerender(
      <SecureInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        sensitivityLevel="high"
      />,
    );
    expect(getByText('High Sensitivity')).toBeTruthy();
  });

  it('handles secure text entry correctly', () => {
    const { getByTestId } = render(
      <SecureInput
        label="Password"
        value=""
        onChangeText={mockOnChangeText}
        sensitivityLevel="high"
        secureTextEntry
        testID="password-input"
      />,
    );

    const input = getByTestId('password-input');
    const toggleButton = getByTestId('password-input-toggle-visibility');

    expect(input.props.secureTextEntry).toBe(true);
    fireEvent.press(toggleButton);
    expect(input.props.secureTextEntry).toBe(false);
  });

  it('validates input using zod schema', () => {
    const schema = z.string().email('Invalid email format');
    const { getByTestId, getByText } = render(
      <SecureInput
        label="Email"
        value=""
        onChangeText={mockOnChangeText}
        sensitivityLevel="medium"
        validation={schema}
        testID="email-input"
      />,
    );

    const input = getByTestId('email-input');

    // Invalid email
    fireEvent.changeText(input, 'invalid-email');
    expect(getByText('Invalid email format')).toBeTruthy();

    // Valid email
    fireEvent.changeText(input, 'test@example.com');
    expect(() => getByText('Invalid email format')).toThrow();
  });

  it('displays info text when provided', () => {
    const { getByText } = render(
      <SecureInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        sensitivityLevel="low"
        infoText="Additional information"
      />,
    );

    expect(getByText('Additional information')).toBeTruthy();
  });

  it('handles focus and blur states correctly', () => {
    const { getByTestId } = render(
      <SecureInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        sensitivityLevel="low"
        testID="test-input"
      />,
    );

    const input = getByTestId('test-input');

    fireEvent(input, 'focus');
    // Check for focused styles
    expect(input.parent.props.style).toContainEqual(
      expect.objectContaining({
        borderColor: '#3B82F6',
      }),
    );

    fireEvent(input, 'blur');
    // Check for unfocused styles
    expect(input.parent.props.style).toContainEqual(
      expect.objectContaining({
        borderColor: '#D1D5DB',
      }),
    );
  });

  it('calls onChangeText with input value', () => {
    const { getByTestId } = render(
      <SecureInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        sensitivityLevel="low"
        testID="test-input"
      />,
    );

    const input = getByTestId('test-input');
    fireEvent.changeText(input, 'test value');

    expect(mockOnChangeText).toHaveBeenCalledWith('test value');
    expect(mockOnChangeText).toHaveBeenCalledTimes(1);
  });

  it('shows error state with validation error', () => {
    const schema = z.string().min(5, 'Minimum 5 characters required');
    const { getByTestId, getByText } = render(
      <SecureInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        sensitivityLevel="low"
        validation={schema}
        testID="test-input"
      />,
    );

    const input = getByTestId('test-input');
    fireEvent.changeText(input, 'test');

    expect(getByText('Minimum 5 characters required')).toBeTruthy();
    expect(input.parent.props.style).toContainEqual(
      expect.objectContaining({
        borderColor: '#EF4444',
      }),
    );
  });
});
