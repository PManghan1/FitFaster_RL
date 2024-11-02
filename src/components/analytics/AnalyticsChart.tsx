import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

type DataPoint = {
  value: number;
  label: string;
};

type AnalyticsChartProps = {
  data: DataPoint[];
  maxValue: number;
  color?: string;
  testID?: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_SPACING = 8;
const CHART_HEIGHT = 200;

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  maxValue,
  color = '#3B82F6',
  testID,
}) => {
  const barWidth = (SCREEN_WIDTH - 32 - (data.length - 1) * BAR_SPACING) / data.length;

  return (
    <StyledView className="bg-white p-4 rounded-lg shadow-sm mb-4" testID={testID}>
      <StyledView className="h-[200px] flex-row items-end justify-between">
        {data.map((point, index) => (
          <StyledView
            key={point.label}
            testID={`chart-bar-${index}`}
            style={{
              width: barWidth,
              height: (point.value / maxValue) * CHART_HEIGHT,
              backgroundColor: color,
              borderRadius: 4,
            }}
          />
        ))}
      </StyledView>

      <StyledView className="flex-row justify-between mt-2">
        {data.map(point => (
          <StyledText key={`label-${point.label}`} className="text-gray-600 text-xs">
            {point.label}
          </StyledText>
        ))}
      </StyledView>
    </StyledView>
  );
};
