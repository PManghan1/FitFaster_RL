import React from 'react';
import { View, Text } from 'react-native';
import { ChevronRight } from 'react-native-feather';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

type AnalyticsCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  testID?: string;
};

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  testID,
}) => {
  return (
    <StyledView className="bg-white p-4 rounded-lg shadow-sm mb-4" testID={testID}>
      <StyledView className="flex-row justify-between items-center">
        <StyledText className="text-gray-600 text-sm font-medium">{title}</StyledText>
        <ChevronRight stroke="#9CA3AF" width={16} height={16} />
      </StyledView>

      <StyledView className="mt-2">
        <StyledText className="text-2xl font-bold">{value}</StyledText>
        {subtitle && <StyledText className="text-gray-500 text-sm mt-1">{subtitle}</StyledText>}
      </StyledView>

      {trend && (
        <StyledView className="flex-row items-center mt-2">
          <StyledView
            className={`px-2 py-1 rounded-full ${trend.isPositive ? 'bg-green-100' : 'bg-red-100'}`}
          >
            <StyledText
              className={`text-xs ${trend.isPositive ? 'text-green-800' : 'text-red-800'}`}
            >
              {trend.isPositive ? '+' : '-'}
              {Math.abs(trend.value)}%
            </StyledText>
          </StyledView>
          <StyledText className="text-gray-500 text-xs ml-2">vs last week</StyledText>
        </StyledView>
      )}
    </StyledView>
  );
};
