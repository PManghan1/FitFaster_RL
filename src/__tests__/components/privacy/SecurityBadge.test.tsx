import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { 
  SecurityBadge, 
  SECURITY_BADGE_PRESETS 
} from '../../../components/privacy/SecurityBadge';

describe('SecurityBadge', () => {
  const defaultProps = {
    type: 'GDPR' as const,
    status: 'secure' as const,
    title: 'GDPR Compliance',
    description: 'Meets EU data protection requirements',
    details: [
      'Data encryption enabled',
      'User consent tracking',
      'Right to be forgotten',
    ],
    testID: 'security-badge',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with required props', () => {
    const { getByText, getByTestId } = render(
      <SecurityBadge {...defaultProps} />
    );

    expect(getByText('GDPR Compliance')).toBeTruthy();
    expect(getByText('Meets EU data protection requirements')).toBeTruthy();
    expect(getByTestId('security-badge')).toBeTruthy();
  });

  it('handles different status colors correctly', () => {
    const statuses = ['secure', 'warning', 'error', 'info'] as const;
    const colors = {
      secure: '#4CAF5020',
      warning: '#FFC10720',
      error: '#EF444420',
      info: '#3B82F620',
    };

    statuses.forEach(status => {
      const { getByTestId, rerender } = render(
        <SecurityBadge
          {...defaultProps}
          status={status}
          testID={`security-badge-${status}`}
        />
      );

      const badge = getByTestId(`security-badge-${status}`);
      expect(badge.findByProps({ status }).props.style).toContainEqual(
        expect.objectContaining({
          backgroundColor: colors[status],
        })
      );

      rerender(
        <SecurityBadge
          {...defaultProps}
          status={status}
          testID={`security-badge-${status}`}
        />
      );
    });
  });

  it('toggles detail visibility on press', () => {
    const { getByTestId, queryByTestId } = render(
      <SecurityBadge {...defaultProps} />
    );

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
    const { getByTestId } = render(
      <SecurityBadge {...defaultProps} />
    );

    fireEvent.press(getByTestId('security-badge'));

    defaultProps.details.forEach((detail, index) => {
      expect(getByTestId(`security-badge-detail-${index}`)).toHaveTextContent(detail);
    });
  });

  it('calls onPress callback when provided', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <SecurityBadge {...defaultProps} onPress={mockOnPress} />
    );

    fireEvent.press(getByTestId('security-badge'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders preset configurations correctly', () => {
    Object.entries(SECURITY_BADGE_PRESETS).forEach(([key, preset]) => {
      const { getByText, getByTestId, rerender } = render(
        <SecurityBadge
          {...preset}
          testID={`security-badge-${key}`}
        />
      );

      fireEvent.press(getByTestId(`security-badge-${key}`));
      preset.details.forEach(detail => {
        expect(getByText(detail)).toBeTruthy();
      });

      rerender(
        <SecurityBadge
          {...preset}
          testID={`security-badge-${key}`}
        />
      );
    });
  });

  it('displays correct icon based on status', () => {
    const { getByTestId, rerender } = render(
      <SecurityBadge {...defaultProps} status="secure" />
    );

    // Check Shield icon for secure status
    expect(getByTestId('security-badge').findByProps({
      width: 20,
      height: 20,
      color: '#4CAF50',
    })).toBeTruthy();

    // Check AlertTriangle icon for warning status
    rerender(<SecurityBadge {...defaultProps} status="warning" />);
    expect(getByTestId('security-badge').findByProps({
      width: 20,
      height: 20,
      color: '#FFC107',
    })).toBeTruthy();

    // Check AlertTriangle icon for error status
    rerender(<SecurityBadge {...defaultProps} status="error" />);
    expect(getByTestId('security-badge').findByProps({
      width: 20,
      height: 20,
      color: '#EF4444',
    })).toBeTruthy();

    // Check Info icon for info status
    rerender(<SecurityBadge {...defaultProps} status="info" />);
    expect(getByTestId('security-badge').findByProps({
      width: 20,
      height: 20,
      color: '#3B82F6',
    })).toBeTruthy();
  });

  it('handles missing details gracefully', () => {
    const { getByTestId, queryByTestId } = render(
      <SecurityBadge {...defaultProps} details={undefined} />
    );

    fireEvent.press(getByTestId('security-badge'));
    expect(queryByTestId('security-badge-detail-0')).toBeNull();
  });

  it('applies correct styles based on status', () => {
    const { getByTestId } = render(
      <SecurityBadge {...defaultProps} status="secure" />
    );

    const badge = getByTestId('security-badge');
    expect(badge.props.style).toContainEqual(
      expect.objectContaining({
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        marginVertical: 4,
      })
    );
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
      />
    );

    fireEvent.press(getByTestId('security-badge'));

    expect(getByText(longTitle)).toBeTruthy();
    expect(getByText(longDescription)).toBeTruthy();
    expect(getByText(longDetail)).toBeTruthy();
  });
});
