import React from 'react';
import { render } from '@testing-library/react-native';
import { 
  DataSensitivityIndicator, 
  DATA_SENSITIVITY_PRESETS 
} from '../../../components/privacy/DataSensitivityIndicator';

describe('DataSensitivityIndicator', () => {
  const defaultProps = {
    level: 'medium' as const,
    dataType: 'Personal Information',
    protectionMeasures: [
      'Standard encryption',
      'Access controls',
      'Regular audits',
    ],
    testID: 'sensitivity-indicator',
  };

  it('renders correctly with required props', () => {
    const { getByText, getByTestId } = render(
      <DataSensitivityIndicator {...defaultProps} />
    );

    expect(getByText('Medium Sensitivity')).toBeTruthy();
    expect(getByText('Personal Information')).toBeTruthy();
    expect(getByTestId('sensitivity-indicator')).toBeTruthy();
  });

  it('displays different sensitivity levels with correct colors', () => {
    const levels = ['low', 'medium', 'high'] as const;
    const colors = {
      low: '#4CAF50',
      medium: '#FFC107',
      high: '#EF4444',
    };

    levels.forEach(level => {
      const { getByText, rerender } = render(
        <DataSensitivityIndicator
          {...defaultProps}
          level={level}
        />
      );

      const badge = getByText(`${level.charAt(0).toUpperCase() + level.slice(1)} Sensitivity`);
      expect(badge.parent.props.style).toContainEqual(
        expect.objectContaining({
          backgroundColor: `${colors[level]}20`,
        })
      );

      rerender(
        <DataSensitivityIndicator
          {...defaultProps}
          level={level}
        />
      );
    });
  });

  it('renders protection measures correctly', () => {
    const { getByTestId } = render(
      <DataSensitivityIndicator {...defaultProps} />
    );

    defaultProps.protectionMeasures.forEach((measure, index) => {
      expect(getByTestId(`sensitivity-indicator-measure-${index}`)).toHaveTextContent(measure);
    });
  });

  it('handles missing protection measures gracefully', () => {
    const { queryByText } = render(
      <DataSensitivityIndicator
        {...defaultProps}
        protectionMeasures={undefined}
      />
    );

    expect(queryByText('Protection measures:')).toBeNull();
  });

  it('renders preset configurations correctly', () => {
    Object.entries(DATA_SENSITIVITY_PRESETS).forEach(([key, preset]) => {
      const { getByText, rerender } = render(
        <DataSensitivityIndicator
          level={preset.level}
          dataType={preset.dataType}
          protectionMeasures={preset.protectionMeasures}
        />
      );

      expect(getByText(preset.dataType)).toBeTruthy();
      preset.protectionMeasures.forEach(measure => {
        expect(getByText(measure)).toBeTruthy();
      });

      rerender(
        <DataSensitivityIndicator
          level={preset.level}
          dataType={preset.dataType}
          protectionMeasures={preset.protectionMeasures}
        />
      );
    });
  });

  it('displays appropriate icons for each sensitivity level', () => {
    const { getByTestId, rerender } = render(
      <DataSensitivityIndicator {...defaultProps} level="low" />
    );

    // Check for Shield icon for low sensitivity
    expect(getByTestId('sensitivity-indicator').findByProps({
      width: 16,
      height: 16,
      color: '#4CAF50',
    })).toBeTruthy();

    // Check for Lock icon for medium sensitivity
    rerender(<DataSensitivityIndicator {...defaultProps} level="medium" />);
    expect(getByTestId('sensitivity-indicator').findByProps({
      width: 16,
      height: 16,
      color: '#FFC107',
    })).toBeTruthy();

    // Check for AlertTriangle icon for high sensitivity
    rerender(<DataSensitivityIndicator {...defaultProps} level="high" />);
    expect(getByTestId('sensitivity-indicator').findByProps({
      width: 16,
      height: 16,
      color: '#EF4444',
    })).toBeTruthy();
  });

  it('handles long data type and measure texts properly', () => {
    const longDataType = 'A'.repeat(50);
    const longMeasure = 'B'.repeat(100);

    const { getByText } = render(
      <DataSensitivityIndicator
        {...defaultProps}
        dataType={longDataType}
        protectionMeasures={[longMeasure]}
      />
    );

    expect(getByText(longDataType)).toBeTruthy();
    expect(getByText(longMeasure)).toBeTruthy();
  });

  it('applies correct styles based on theme', () => {
    const { getByTestId } = render(
      <DataSensitivityIndicator {...defaultProps} />
    );

    const container = getByTestId('sensitivity-indicator');
    expect(container.props.style).toContainEqual(
      expect.objectContaining({
        padding: 12,
        borderRadius: 8,
        marginVertical: 4,
      })
    );
  });

  it('renders description with correct formatting', () => {
    const { getByText } = render(
      <DataSensitivityIndicator {...defaultProps} />
    );

    const description = getByText(`${defaultProps.dataType} - Personal information requiring standard protection measures.`);
    expect(description.props.style).toContainEqual(
      expect.objectContaining({
        fontSize: 14,
        color: '#6B7280',
      })
    );
  });
});
