import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { 
  PrivacyNotice, 
  DEFAULT_PRIVACY_NOTICE_CONFIG 
} from '../../../components/privacy/PrivacyNotice';

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
}));

describe('PrivacyNotice', () => {
  const defaultProps = {
    title: 'Privacy Notice',
    dataUsageDescription: 'Test data usage description',
    dataCollectionPoints: [
      'Point 1',
      'Point 2',
      'Point 3',
    ],
    dataProtectionMeasures: [
      'Measure 1',
      'Measure 2',
      'Measure 3',
    ],
    privacyPolicyUrl: 'https://example.com/privacy',
    dataRetentionPeriod: '30 days',
    testID: 'privacy-notice',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with required props', () => {
    const { getByText, getByTestId } = render(
      <PrivacyNotice {...defaultProps} />
    );

    expect(getByText('Privacy Notice')).toBeTruthy();
    expect(getByText('Test data usage description')).toBeTruthy();
    expect(getByTestId('privacy-notice')).toBeTruthy();
  });

  it('displays all data collection points', () => {
    const { getByTestId } = render(
      <PrivacyNotice {...defaultProps} />
    );

    defaultProps.dataCollectionPoints.forEach((point, index) => {
      expect(getByTestId(`privacy-notice-collection-point-${index}`)).toHaveTextContent(point);
    });
  });

  it('displays all protection measures', () => {
    const { getByTestId } = render(
      <PrivacyNotice {...defaultProps} />
    );

    defaultProps.dataProtectionMeasures.forEach((measure, index) => {
      expect(getByTestId(`privacy-notice-protection-measure-${index}`)).toHaveTextContent(measure);
    });
  });

  it('handles privacy policy link press correctly', () => {
    const { getByTestId } = render(
      <PrivacyNotice {...defaultProps} />
    );

    const linkButton = getByTestId('privacy-notice-privacy-policy-link');
    fireEvent.press(linkButton);

    expect(Linking.openURL).toHaveBeenCalledWith(defaultProps.privacyPolicyUrl);
  });

  it('displays data retention period correctly', () => {
    const { getByText } = render(
      <PrivacyNotice {...defaultProps} />
    );

    expect(getByText('30 days')).toBeTruthy();
  });

  it('renders sensitivity indicator correctly', () => {
    const { getByTestId } = render(
      <PrivacyNotice {...defaultProps} />
    );

    expect(getByTestId('privacy-notice-sensitivity-indicator')).toBeTruthy();
  });

  it('uses default config correctly', () => {
    const { getByText } = render(
      <PrivacyNotice {...DEFAULT_PRIVACY_NOTICE_CONFIG} />
    );

    expect(getByText(DEFAULT_PRIVACY_NOTICE_CONFIG.dataUsageDescription)).toBeTruthy();
    DEFAULT_PRIVACY_NOTICE_CONFIG.dataCollectionPoints.forEach(point => {
      expect(getByText(point)).toBeTruthy();
    });
    DEFAULT_PRIVACY_NOTICE_CONFIG.dataProtectionMeasures.forEach(measure => {
      expect(getByText(measure)).toBeTruthy();
    });
  });

  it('handles long text content properly', () => {
    const longDescription = 'A'.repeat(500);
    const { getByText } = render(
      <PrivacyNotice
        {...defaultProps}
        dataUsageDescription={longDescription}
      />
    );

    expect(getByText(longDescription)).toBeTruthy();
  });

  it('applies correct styling to sections', () => {
    const { getByText } = render(
      <PrivacyNotice {...defaultProps} />
    );

    const sections = ['Data Usage', 'Data Collection', 'Data Protection', 'Data Retention'];
    sections.forEach(section => {
      const sectionTitle = getByText(section);
      expect(sectionTitle.props.style).toContainEqual(
        expect.objectContaining({
          fontSize: 16,
          fontWeight: '600',
          color: '#374151',
        })
      );
    });
  });

  it('renders bullet points with correct styling', () => {
    const { getByTestId } = render(
      <PrivacyNotice {...defaultProps} />
    );

    defaultProps.dataCollectionPoints.forEach((_, index) => {
      const bulletPoint = getByTestId(`privacy-notice-collection-point-${index}`);
      expect(bulletPoint.props.style).toContainEqual(
        expect.objectContaining({
          flexDirection: 'row',
          alignItems: 'flex-start',
          marginBottom: 4,
        })
      );
    });
  });

  it('handles missing optional props gracefully', () => {
    const minimalProps = {
      dataUsageDescription: 'Test description',
      dataCollectionPoints: [],
      dataProtectionMeasures: [],
      privacyPolicyUrl: 'https://example.com',
      dataRetentionPeriod: '30 days',
    };

    const { getByText, queryByTestId } = render(
      <PrivacyNotice {...minimalProps} />
    );

    expect(getByText('Privacy Notice')).toBeTruthy(); // Default title
    expect(queryByTestId('privacy-notice-collection-point-0')).toBeNull();
    expect(queryByTestId('privacy-notice-protection-measure-0')).toBeNull();
  });

  it('renders external link icon in privacy policy link', () => {
    const { getByTestId } = render(
      <PrivacyNotice {...defaultProps} />
    );

    const linkButton = getByTestId('privacy-notice-privacy-policy-link');
    expect(linkButton.findByProps({
      width: 16,
      height: 16,
      color: '#3B82F6',
    })).toBeTruthy();
  });
});
