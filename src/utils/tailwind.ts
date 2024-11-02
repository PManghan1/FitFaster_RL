import { styled } from 'nativewind';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';

// Export styled base components
export const StyledView = styled(View);
export const StyledText = styled(Text);
export const StyledTouchableOpacity = styled(TouchableOpacity);
export const StyledTextInput = styled(TextInput);

// Helper function to combine Tailwind classes
export const cn = (...classes: string[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Helper function for conditional classes
export const classNames = (
  baseClasses: string,
  conditionalClasses: Record<string, boolean>,
): string => {
  const activeConditionalClasses = Object.entries(conditionalClasses)
    .filter(([_, condition]) => condition)
    .map(([className]) => className);

  return cn(baseClasses, ...activeConditionalClasses);
};
