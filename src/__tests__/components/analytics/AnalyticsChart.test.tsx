import React from 'react';
import { render } from '@testing-library/react-native';
import { AnalyticsChart } from '../../../components/analytics/AnalyticsChart';

describe('AnalyticsChart', () => {
  const mockData = [
    { label: 'Mon', value: 10 },
    { label: 'Tue', value: 20 },
    { label: 'Wed', value: 15 },
  ];

  const defaultProps = {
    data: mockData,
    maxValue: 30,
    testID: 'test-chart',
  };

  it('renders correctly with required props', () => {
    const { getByTestId, getAllByTestId } = render(<AnalyticsChart {...defaultProps} />);

    // Check main container
    expect(getByTestId('test-chart')).toBeTruthy();

    // Check if all bars are rendered
    const bars = getAllByTestId(/chart-bar-/);
    expect(bars).toHaveLength(mockData.length);
  });

  it('renders all data labels', () => {
    const { getByText } = render(<AnalyticsChart {...defaultProps} />);

    mockData.forEach(point => {
      expect(getByText(point.label)).toBeTruthy();
    });
  });

  it('uses correct bar heights based on values', () => {
    const { getAllByTestId } = render(<AnalyticsChart {...defaultProps} />);

    const bars = getAllByTestId(/chart-bar-/);
    bars.forEach((bar, index) => {
      const expectedHeight = (mockData[index].value / defaultProps.maxValue) * 200; // 200 is CHART_HEIGHT
      expect(bar.props.style.height).toBe(expectedHeight);
    });
  });

  it('uses custom color when provided', () => {
    const customColor = '#FF0000';
    const { getAllByTestId } = render(<AnalyticsChart {...defaultProps} color={customColor} />);

    const bars = getAllByTestId(/chart-bar-/);
    bars.forEach(bar => {
      expect(bar.props.style.backgroundColor).toBe(customColor);
    });
  });

  it('uses default color when no color prop provided', () => {
    const { getAllByTestId } = render(<AnalyticsChart {...defaultProps} />);

    const bars = getAllByTestId(/chart-bar-/);
    bars.forEach(bar => {
      expect(bar.props.style.backgroundColor).toBe('#3B82F6');
    });
  });

  it('handles empty data array', () => {
    const { queryByTestId } = render(
      <AnalyticsChart {...defaultProps} data={[]} testID="empty-chart" />
    );

    expect(queryByTestId('empty-chart')).toBeTruthy();
    expect(queryByTestId('chart-bar-0')).toBeNull();
  });

  it('handles single data point', () => {
    const singleDataPoint = [{ label: 'Mon', value: 10 }];
    const { getAllByTestId, getByText } = render(
      <AnalyticsChart {...defaultProps} data={singleDataPoint} />
    );

    const bars = getAllByTestId(/chart-bar-/);
    expect(bars).toHaveLength(1);
    expect(getByText('Mon')).toBeTruthy();
  });

  it('handles zero values', () => {
    const dataWithZero = [
      { label: 'Mon', value: 0 },
      { label: 'Tue', value: 10 },
    ];
    const { getAllByTestId } = render(<AnalyticsChart {...defaultProps} data={dataWithZero} />);

    const bars = getAllByTestId(/chart-bar-/);
    expect(bars[0].props.style.height).toBe(0);
    expect(bars[1].props.style.height).toBe((10 / defaultProps.maxValue) * 200);
  });
});
