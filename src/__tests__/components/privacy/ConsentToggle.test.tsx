import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConsentToggle } from '../../../components/privacy/ConsentToggle';

describe('ConsentToggle', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    purpose: 'HEALTH_DATA_PROCESSING' as const,
    title: 'Health Data Processing',
    description: 'Allow processing of health metrics',
    isEnabled: false,
    onToggle: mockOnToggle,
    testID: 'consent-toggle',
  };

  it('renders correctly with required props', () => {
    const { getByText, getByTestId } = render(
      <ConsentToggle {...defaultProps} />
    );

    expect(getByText('Health Data Processing')).toBeTruthy();
    expect(getByText('Allow processing of health metrics')).toBeTruthy();
    expect(getByTestId('consent-toggle-toggle')).toBeTruthy();
  });

  it('handles toggle press correctly', () => {
    const { getByTestId } = render(
      <ConsentToggle {...defaultProps} />
    );

    const toggle = getByTestId('consent-toggle-toggle');
    fireEvent.press(toggle);
    
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('displays required badge when isRequired is true', () => {
    const { getByText } = render(
      <ConsentToggle {...defaultProps} isRequired={true} />
    );

    expect(getByText('Required')).toBeTruthy();
  });

  it('disables toggle when isRequired is true', () => {
    const { getByTestId } = render(
      <ConsentToggle {...defaultProps} isRequired={true} />
    );

    const toggle = getByTestId('consent-toggle-toggle');
    fireEvent.press(toggle);
    
    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  it('shows info content when info button is pressed', () => {
    const infoContent = {
      title: 'Additional Information',
      description: 'Detailed explanation of data processing',
    };

    const { getByTestId, getByText, queryByText } = render(
      <ConsentToggle 
        {...defaultProps} 
        infoContent={infoContent}
      />
    );

    // Info content should not be visible initially
    expect(queryByText(infoContent.title)).toBeNull();
    expect(queryByText(infoContent.description)).toBeNull();

    // Press info button
    const infoButton = getByTestId('consent-toggle-info-button');
    fireEvent.press(infoButton);

    // Info content should be visible
    expect(getByText(infoContent.title)).toBeTruthy();
    expect(getByText(infoContent.description)).toBeTruthy();
  });

  it('reflects enabled state correctly', () => {
    const { getByTestId, rerender } = render(
      <ConsentToggle {...defaultProps} isEnabled={false} />
    );

    const toggle = getByTestId('consent-toggle-toggle');
    expect(toggle.props.accessibilityState.checked).toBe(false);

    rerender(<ConsentToggle {...defaultProps} isEnabled={true} />);
    expect(toggle.props.accessibilityState.checked).toBe(true);
  });

  it('handles long text content properly', () => {
    const longTitle = 'A'.repeat(50);
    const longDescription = 'B'.repeat(200);

    const { getByText } = render(
      <ConsentToggle 
        {...defaultProps}
        title={longTitle}
        description={longDescription}
      />
    );

    expect(getByText(longTitle)).toBeTruthy();
    expect(getByText(longDescription)).toBeTruthy();
  });

  it('applies correct styles based on enabled state', () => {
    const { getByTestId, rerender } = render(
      <ConsentToggle {...defaultProps} isEnabled={false} />
    );

    const track = getByTestId('consent-toggle-toggle').findByProps({
      isEnabled: false,
    });
    expect(track.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: '#D1D5DB',
      })
    );

    rerender(<ConsentToggle {...defaultProps} isEnabled={true} />);
    const enabledTrack = getByTestId('consent-toggle-toggle').findByProps({
      isEnabled: true,
    });
    expect(enabledTrack.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: '#3B82F6',
      })
    );
  });

  it('handles accessibility properties correctly', () => {
    const { getByTestId } = render(
      <ConsentToggle {...defaultProps} />
    );

    const toggle = getByTestId('consent-toggle-toggle');
    expect(toggle.props.accessibilityRole).toBe('switch');
    expect(toggle.props.accessibilityState).toEqual({
      checked: false,
      disabled: false,
    });
  });

  it('updates info visibility state correctly', () => {
    const infoContent = {
      title: 'Info Title',
      description: 'Info Description',
    };

    const { getByTestId, queryByTestId } = render(
      <ConsentToggle 
        {...defaultProps} 
        infoContent={infoContent}
      />
    );

    // Info modal should not be visible initially
    expect(queryByTestId('consent-toggle-info-modal')).toBeNull();

    // Show info modal
    fireEvent.press(getByTestId('consent-toggle-info-button'));
    expect(getByTestId('consent-toggle-info-modal')).toBeTruthy();

    // Hide info modal
    fireEvent.press(getByTestId('consent-toggle-info-button'));
    expect(queryByTestId('consent-toggle-info-modal')).toBeNull();
  });
});
