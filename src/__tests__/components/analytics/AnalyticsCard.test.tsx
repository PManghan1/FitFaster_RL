import React from 'react';
import { render } from '@testing-library/react-native';
import { AnalyticsCard } from '../../../components/analytics/AnalyticsCard';

describe('AnalyticsCard', () => {
  const defaultProps = {
    title: 'Test Metric',
    value: '100',
    subtitle: 'Test subtitle',
    testID: 'test-card',
  };

  it('renders correctly with required props', () => {
    const { getByText, getByTestId } = render(<AnalyticsCard {...defaultProps} />);

    expect(getByTestId('test-card')).toBeTruthy();
    expect(getByText('Test Metric')).toBeTruthy();
    expect(getByText('100')).toBeTruthy();
    expect(getByText('Test subtitle')).toBeTruthy();
  });

  it('renders positive trend correctly', () => {
    const props = {
      ...defaultProps,
      trend: { value: 10, isPositive: true },
    };

    const { getByText } = render(<AnalyticsCard {...props} />);
    expect(getByText('+10%')).toBeTruthy();
    expect(getByText('vs last week')).toBeTruthy();
  });

  it('renders negative trend correctly', () => {
    const props = {
      ...defaultProps,
      trend: { value: 15, isPositive: false },
    };

    const { getByText } = render(<AnalyticsCard {...props} />);
    expect(getByText('-15%')).toBeTruthy();
    expect(getByText('vs last week')).toBeTruthy();
  });

  it('handles missing subtitle', () => {
    const { title, value, testID } = defaultProps;
    const { queryByText } = render(<AnalyticsCard title={title} value={value} testID={testID} />);

    expect(queryByText('Test subtitle')).toBeNull();
  });

  it('handles missing trend', () => {
    const { queryByText } = render(<AnalyticsCard {...defaultProps} />);

    expect(queryByText('vs last week')).toBeNull();
    expect(queryByText('+10%')).toBeNull();
    expect(queryByText('-10%')).toBeNull();
  });

  it('handles numeric value', () => {
    const props = {
      ...defaultProps,
      value: 100,
    };

    const { getByText } = render(<AnalyticsCard {...props} />);
    expect(getByText('100')).toBeTruthy();
  });
});
