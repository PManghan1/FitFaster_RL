import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { styled } from 'nativewind';
import type { ReactNode } from 'react';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

export interface SelectionCardProps {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  testID?: string;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  title,
  description,
  selected,
  onSelect,
  icon,
  disabled = false,
  testID,
}) => {
  return (
    <StyledPressable
      onPress={onSelect}
      disabled={disabled}
      testID={testID}
      className={`p-4 mb-3 rounded-lg border ${
        selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <StyledView className="flex-row items-center">
        {icon && <StyledView className="mr-3">{icon}</StyledView>}
        <StyledView className="flex-1">
          <StyledText
            className={`font-semibold text-lg ${selected ? 'text-blue-500' : 'text-gray-900'}`}
          >
            {title}
          </StyledText>
          <StyledText className="text-gray-600 mt-1">{description}</StyledText>
        </StyledView>
        {selected && (
          <StyledView className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center">
            <StyledText className="text-white">✓</StyledText>
          </StyledView>
        )}
      </StyledView>
    </StyledPressable>
  );
};
