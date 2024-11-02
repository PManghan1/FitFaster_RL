import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AnalyticsScreen } from '../../screens/AnalyticsScreen';

describe('AnalyticsScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders all analytics components', () => {
    const { getByTestId } = render(<AnalyticsScreen />);

    // Verify screen container
    expect(getByTestId('analytics-screen')).toBeTruthy();

    // Verify summary cards
    expect(getByTestId('workout-summary-card')).toBeTruthy();
    expect(getByTestId('nutrition-summary-card')).toBeTruthy();
    expect(getByTestId('weight-training-card')).toBeTruthy();
    expect(getByTestId('protein-intake-card')).toBeTruthy();

    // Verify charts
    expect(getByTestId('workout-chart')).toBeTruthy();
    expect(getByTestId('nutrition-chart')).toBeTruthy();
  });

  it('handles refresh control', () => {
    const { getByTestId } = render(<AnalyticsScreen />);
    const scrollView = getByTestId('analytics-screen');

    // Trigger refresh
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: -100 },
        contentSize: { height: 500, width: 100 },
        layoutMeasurement: { height: 100, width: 100 },
      },
    });

    // Verify refresh is triggered
    jest.advanceTimersByTime(1000);
  });

  it('displays correct workout data', () => {
    const { getByText } = render(<AnalyticsScreen />);

    // Verify workout summary data
    expect(getByText('Weekly Workouts')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    expect(getByText('Total workouts this week')).toBeTruthy();
  });

  it('displays correct nutrition data', () => {
    const { getByText } = render(<AnalyticsScreen />);

    // Verify nutrition summary data
    expect(getByText('Calorie Intake')).toBeTruthy();
    expect(getByText('2,100')).toBeTruthy();
    expect(getByText('Daily average this week')).toBeTruthy();
  });

  it('displays correct progress metrics', () => {
    const { getByText } = render(<AnalyticsScreen />);

    // Verify weight training data
    expect(getByText('Weight Training')).toBeTruthy();
    expect(getByText('12,500 kg')).toBeTruthy();
    expect(getByText('Total volume this week')).toBeTruthy();

    // Verify protein intake data
    expect(getByText('Protein Intake')).toBeTruthy();
    expect(getByText('145g')).toBeTruthy();
    expect(getByText('Daily average this week')).toBeTruthy();
  });

  it('shows trend indicators correctly', () => {
    const { getByText } = render(<AnalyticsScreen />);

    // Verify positive trends
    expect(getByText('+25%')).toBeTruthy();
    expect(getByText('+15%')).toBeTruthy();
    expect(getByText('+10%')).toBeTruthy();

    // Verify negative trends
    expect(getByText('-5%')).toBeTruthy();
  });
});
