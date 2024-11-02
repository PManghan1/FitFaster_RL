import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import type { ReactTestInstance } from 'react-test-renderer';

import { SecurityBadge } from '../../../components/privacy/SecurityBadge';

describe('SecurityBadge', () => {
  const defaultProps = {
    title: 'GDPR Compliance',
    description: 'Meets EU data protection requirements',
    details: ['Data encryption enabled', 'User consent tracking', 'Right to be forgotten'],
    status: 'secure' as const,
    testID: 'security-badge',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with required props', () => {
    const { getByText, getByTestId } = render(<SecurityBadge {...defaultProps} />);

    expect(getByText('GDPR Compliance')).toBeTruthy();
    expect(getByText('Meets EU data protection requirements')).toBeTruthy();
    expect(getByTestId('security-badge')).toBeTruthy();
  });

  it('handles different status colors correctly', () => {
    const statuses = ['secure', 'warning', 'info'] as const;
    const colors = {
      secure: 'rgba(34, 197, 94, 0.1)',
      warning: 'rgba(239, 68, 68, 0.1)',
      info: 'rgba(59, 130, 246, 0.1)',
    };

    statuses.forEach(status => {
      const { getByTestId } = render(
        <SecurityBadge {...defaultProps} status={status} testID={`security-badge-${status}`} />,
      );

      const badge = getByTestId(`security-badge-${status}`);
      expect(badge.props.style).toContainEqual(
        expect.objectContaining({
          backgroundColor: colors[status],
        }),
      );
    });
  });

  it('toggles detail visibility on press', () => {
    const { getByTestId, queryByTestId } = render(<SecurityBadge {...defaultProps} />);

    // Details should not be visible initially
    expect(queryByTestId('security-badge-detail-0')).toBeNull();

    // Press to show details
    fireEvent.press(getByTestId('security-badge'));
    expect(getByTestId('security-badge-detail-0')).toBeTruthy();

    // Press again to hide details
    fireEvent.press(getByTestId('security-badge'));
    expect(queryByTestId('security-badge-detail-0')).toBeNull();
  });

  it('renders all details when expanded', () => {
    const { getByTestId, getByText } = render(<SecurityBadge {...defaultProps} />);

    fireEvent.press(getByTestId('security-badge'));

    defaultProps.details.forEach((detail, index) => {
      expect(getByTestId(`security-badge-detail-${index}`)).toBeTruthy();
      expect(getByText(detail)).toBeTruthy();
    });
  });

  it('calls onPress callback when provided', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(<SecurityBadge {...defaultProps} onPress={mockOnPress} />);

    fireEvent.press(getByTestId('security-badge'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('displays correct icon based on status', () => {
    const { getByTestId, rerender } = render(<SecurityBadge {...defaultProps} />);

    const statuses = ['secure', 'warning', 'info'] as const;
    const iconColors = {
      secure: '#22C55E',
      warning: '#EF4444',
      info: '#3B82F6',
    };

    statuses.forEach(status => {
      rerender(<SecurityBadge {...defaultProps} status={status} />);
      const badge = getByTestId('security-badge');

      // Type guard to ensure we're working with a ReactTestInstance
      if (typeof badge !== 'string') {
        const header = badge.children[0] as ReactTestInstance;
        const titleContainer = header.children[0] as ReactTestInstance;
        const iconContainer = titleContainer.children[0] as ReactTestInstance;
        const icon = iconContainer.children[0] as ReactTestInstance;
        expect(icon.props.color).toBe(iconColors[status]);
      }
    });
  });

  it('handles missing details gracefully', () => {
    const { getByTestId, queryByTestId } = render(<SecurityBadge {...defaultProps} details={[]} />);

    fireEvent.press(getByTestId('security-badge'));
    expect(queryByTestId('security-badge-detail-0')).toBeNull();
  });

  it('handles long text content properly', () => {
    const longTitle = 'A'.repeat(50);
    const longDescription = 'B'.repeat(200);
    const longDetail = 'C'.repeat(100);

    const { getByText, getByTestId } = render(
      <SecurityBadge
        {...defaultProps}
        title={longTitle}
        description={longDescription}
        details={[longDetail]}
      />,
    );

    fireEvent.press(getByTestId('security-badge'));

    expect(getByText(longTitle)).toBeTruthy();
    expect(getByText(longDescription)).toBeTruthy();
    expect(getByText(longDetail)).toBeTruthy();
  });
});
