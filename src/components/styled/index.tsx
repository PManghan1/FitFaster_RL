import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';

// Re-export base components
export { View, Text, TouchableOpacity, TextInput, ScrollView, Image };

// Common styled components
export const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

export const SafeContainer = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
  padding: ${props => props.theme.spacing.md}px;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const Column = styled.View`
  flex-direction: column;
`;

export const Center = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const Title = styled.Text`
  font-size: ${props => props.theme.typography.sizes['2xl']}px;
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
`;

export const Subtitle = styled.Text`
  font-size: ${props => props.theme.typography.sizes.lg}px;
  color: ${props => props.theme.colors.textSecondary};
`;

export const Label = styled.Text`
  font-size: ${props => props.theme.typography.sizes.sm}px;
  font-weight: ${props => props.theme.typography.weights.medium};
  color: ${props => props.theme.colors.text};
`;

export const ErrorText = styled.Text`
  font-size: ${props => props.theme.typography.sizes.sm}px;
  color: ${props => props.theme.colors.error};
`;

export const Button = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.lg}px;
  padding: ${props => props.theme.spacing.sm}px ${props => props.theme.spacing.md}px;
  align-items: center;
`;

export const ButtonText = styled.Text`
  color: white;
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.base}px;
`;

export const SecondaryButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg}px;
  padding: ${props => props.theme.spacing.sm}px ${props => props.theme.spacing.md}px;
  align-items: center;
`;

export const SecondaryButtonText = styled.Text`
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.base}px;
`;

export const Input = styled.TextInput`
  background-color: ${props => props.theme.colors.surface};
  border-width: 1px;
  border-color: ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.base}px;
  border-radius: ${props => props.theme.borderRadius.lg}px;
  padding: ${props => props.theme.spacing.sm}px;
  width: 100%;
`;

export const Card = styled.View`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg}px;
  padding: ${props => props.theme.spacing.md}px;
  margin-bottom: ${props => props.theme.spacing.md}px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border};
  ${props => props.theme.shadows.md}
`;

// Layout components
export const Section = styled.View`
  padding-vertical: ${props => props.theme.spacing.md}px;
`;

export const Divider = styled.View`
  height: 1px;
  background-color: ${props => props.theme.colors.border};
  margin-vertical: ${props => props.theme.spacing.md}px;
`;

export const Spacer = styled.View`
  height: ${props => props.theme.spacing.md}px;
`;

// Form components
export const FormGroup = styled.View`
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

export const FormLabel = styled.Text`
  margin-bottom: ${props => props.theme.spacing.sm}px;
  font-size: ${props => props.theme.typography.sizes.sm}px;
  font-weight: ${props => props.theme.typography.weights.medium};
  color: ${props => props.theme.colors.text};
`;

export const FormError = styled.Text`
  margin-top: ${props => props.theme.spacing.xs}px;
  font-size: ${props => props.theme.typography.sizes.sm}px;
  color: ${props => props.theme.colors.error};
`;

// List components
export const List = styled.View`
  border-top-width: 1px;
  border-color: ${props => props.theme.colors.border};
`;

export const ListItem = styled.TouchableOpacity`
  padding-vertical: ${props => props.theme.spacing.md}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-bottom-width: 1px;
  border-color: ${props => props.theme.colors.border};
`;

export const ListItemText = styled.Text`
  font-size: ${props => props.theme.typography.sizes.base}px;
  color: ${props => props.theme.colors.text};
`;

// Loading states
export const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const LoadingText = styled.Text`
  margin-top: ${props => props.theme.spacing.sm}px;
  font-size: ${props => props.theme.typography.sizes.sm}px;
  color: ${props => props.theme.colors.textSecondary};
`;

// Empty states
export const EmptyState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-vertical: ${props => props.theme.spacing.xl}px;
`;

export const EmptyStateText = styled.Text`
  margin-top: ${props => props.theme.spacing.sm}px;
  font-size: ${props => props.theme.typography.sizes.base}px;
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
`;

// Avatar
export const Avatar = styled.Image`
  width: ${props => props.theme.spacing.xl}px;
  height: ${props => props.theme.spacing.xl}px;
  border-radius: ${props => props.theme.borderRadius.full}px;
`;

export const AvatarLarge = styled.Image`
  width: ${props => props.theme.spacing.xl * 2}px;
  height: ${props => props.theme.spacing.xl * 2}px;
  border-radius: ${props => props.theme.borderRadius.full}px;
`;

// Badge
export const Badge = styled.View`
  background-color: ${props => `${props.theme.colors.primary}20`};
  padding: ${props => props.theme.spacing.xs}px ${props => props.theme.spacing.sm}px;
  border-radius: ${props => props.theme.borderRadius.full}px;
`;

export const BadgeText = styled.Text`
  font-size: ${props => props.theme.typography.sizes.xs}px;
  font-weight: ${props => props.theme.typography.weights.medium};
  color: ${props => props.theme.colors.primary};
`;

// Modal
export const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  margin: ${props => props.theme.spacing.md}px;
`;

export const ModalContent = styled.View`
  background-color: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.lg}px;
  padding: ${props => props.theme.spacing.lg}px;
  width: 100%;
  max-width: 320px;
`;

export const ModalTitle = styled.Text`
  font-size: ${props => props.theme.typography.sizes.xl}px;
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

export const ModalActions = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.lg}px;
  gap: ${props => props.theme.spacing.sm}px;
`;
