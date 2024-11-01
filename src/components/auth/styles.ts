import styled from 'styled-components/native';

import { borderRadius, colors, spacing, typography } from '../../theme';

export const Container = styled.View`
  flex: 1;
  background-color: ${colors.background.default};
  padding: ${spacing.md}px;
`;

export const ContentContainer = styled.View`
  flex: 1;
  justify-content: center;
`;

export const Title = styled.Text`
  font-size: ${typography.fontSize.xl}px;
  font-weight: ${typography.fontWeight.bold};
  text-align: center;
  margin-bottom: ${spacing.xl}px;
  color: ${colors.primary.default};
`;

export const ErrorText = styled.Text`
  color: ${colors.error.default};
  text-align: center;
  margin-bottom: ${spacing.md}px;
`;

export const InputContainer = styled.View<{ hasError?: boolean }>`
  margin-bottom: ${spacing.md}px;
`;

export const Input = styled.TextInput`
  border-width: 1px;
  border-color: ${colors.border.default};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.md}px;
  font-size: ${typography.fontSize.md}px;
`;

export const InputError = styled.Text`
  color: ${colors.error.default};
  margin-top: ${spacing.xs}px;
`;

export const Button = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' }>`
  background-color: ${({ variant }) =>
    variant === 'secondary' ? 'transparent' : colors.primary.default};
  padding: ${spacing.md}px;
  border-radius: ${borderRadius.md}px;
  margin-bottom: ${spacing.md}px;
`;

export const ButtonText = styled.Text<{ variant?: 'primary' | 'secondary' }>`
  color: ${({ variant }) =>
    variant === 'secondary' ? colors.primary.default : colors.background.default};
  text-align: center;
  font-size: ${typography.fontSize.lg}px;
  font-weight: ${typography.fontWeight.bold};
`;

export const LinkText = styled.Text`
  color: ${colors.primary.default};
  text-align: center;
`;

export const FooterContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const FooterText = styled.Text`
  color: ${colors.text.light};
`;

export const VerificationText = styled.Text`
  margin-bottom: ${spacing.md}px;
  font-size: ${typography.fontSize.md}px;
  text-align: center;
  color: ${colors.text.light};
`;
