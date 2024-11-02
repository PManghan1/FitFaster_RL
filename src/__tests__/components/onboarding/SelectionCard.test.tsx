import React from 'react';
import { View } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { SelectionCard } from '../../../components/onboarding/SelectionCard';

describe('SelectionCard', () => {
  const defaultProps = {
    title: 'Test Title',
    description: 'Test Description',
    selected: false,
    onSelect: jest.fn(),
    testID: 'test-card',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByTestId } = render(<SelectionCard {...defaultProps} />);

    expect(getByTestId('test-card')).toBeTruthy();
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Description')).toBeTruthy();
  });

  it('shows selected state correctly', () => {
    const { getByTestId, rerender } = render(<SelectionCard {...defaultProps} />);
    const card = getByTestId('test-card');

    expect(card.props.className).not.toContain('border-blue-500');

    rerender(<SelectionCard {...defaultProps} selected={true} />);
    expect(card.props.className).toContain('border-blue-500');
  });

  it('calls onSelect when pressed', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(<SelectionCard {...defaultProps} onSelect={onSelect} />);

    fireEvent.press(getByTestId('test-card'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('does not call onSelect when disabled', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <SelectionCard {...defaultProps} onSelect={onSelect} disabled={true} />
    );

    fireEvent.press(getByTestId('test-card'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders icon when provided', () => {
    const { getByTestId } = render(
      <SelectionCard {...defaultProps} icon={<View testID="test-icon" />} />
    );

    expect(getByTestId('test-icon')).toBeTruthy();
  });
});
