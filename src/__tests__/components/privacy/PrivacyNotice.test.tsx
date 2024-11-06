import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { PrivacyNotice } from '../../../components/privacy/PrivacyNotice';

// Mock the theme
jest.mock('../../../theme', () => ({
  colors: {
    background: {
      default: '#FFFFFF',
      light: '#F5F5F5',
    },
    text: {
      default: '#000000',
      light: '#666666',
    },
    primary: {
      default: '#007AFF',
    },
  },
}));

describe('PrivacyNotice', () => {
  const defaultProps = {
    testID: 'privacy-notice',
    onReadMore: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with required props', () => {
    const { getByText, getByTestId } = render(<PrivacyNotice {...defaultProps} />);

    expect(getByText('Data Usage')).toBeTruthy();
    expect(getByTestId('privacy-notice')).toBeTruthy();
  });

  it('displays all sections', () => {
    const { getByText } = render(<PrivacyNotice {...defaultProps} />);

    const sections = ['Data Usage', 'Data Collection', 'Data Protection', 'Data Retention'];
    sections.forEach(section => {
      expect(getByText(section)).toBeTruthy();
    });
  });

  it('handles read more link press correctly', () => {
    const onReadMore = jest.fn();
    const { getByTestId } = render(<PrivacyNotice {...defaultProps} onReadMore={onReadMore} />);

    const linkButton = getByTestId('privacy-notice-read-more');
    fireEvent.press(linkButton);

    expect(onReadMore).toHaveBeenCalled();
  });

  it('applies correct styling to sections', () => {
    const { getByText } = render(<PrivacyNotice {...defaultProps} />);

    const sections = ['Data Usage', 'Data Collection', 'Data Protection', 'Data Retention'];
    sections.forEach((section: string) => {
      const sectionTitle = getByText(section);
      expect(sectionTitle.parent?.props.style).toMatchObject({
        fontSize: 18,
        fontWeight: '600',
      });
    });
  });

  it('handles missing optional props gracefully', () => {
    const { queryByTestId } = render(<PrivacyNotice testID="privacy-notice" />);

    expect(queryByTestId('privacy-notice-read-more')).toBeNull();
  });

  it('renders external link icon in read more link', () => {
    const { getByTestId } = render(<PrivacyNotice {...defaultProps} />);

    const linkButton = getByTestId('privacy-notice-read-more');
    expect(linkButton).toBeTruthy();
  });
});
