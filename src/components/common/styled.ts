import { TouchableOpacity, View, Text } from 'react-native';
import styled from 'styled-components/native';

import { theme } from '../../theme';

export const Card = styled(View)`
  background-color: ${theme.colors.background.default};
  border-radius: ${theme.borderRadius.lg}px;
  padding: ${theme.spacing.md}px;
  margin-bottom: ${theme.spacing.md}px;
  shadow-color: ${theme.colors.text.dark};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
`;

export const CardTitle = styled(Text)`
  font-size: ${theme.typography.fontSize.md}px;
  font-weight: 600;
  color: ${theme.colors.text.default};
  margin-bottom: ${theme.spacing.sm}px;
`;

export const ListRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  padding: ${theme.spacing.sm}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.border.light};
`;

export const ListText = styled(Text)`
  font-size: ${theme.typography.fontSize.sm}px;
  color: ${theme.colors.text.light};
`;

export const FloatingActionButton = styled(TouchableOpacity)`
  position: absolute;
  bottom: ${theme.spacing.xl}px;
  right: ${theme.spacing.xl}px;
  width: ${theme.spacing.xl * 2}px;
  height: ${theme.spacing.xl * 2}px;
  border-radius: ${theme.spacing.xl}px;
  background-color: ${theme.colors.primary.default};
  align-items: center;
  justify-content: center;
  elevation: 5;
`;

export const IconButton = styled(TouchableOpacity)`
  padding: ${theme.spacing.sm}px;
`;

export const ModalContainer = styled(View)`
  flex: 1;
  background-color: ${theme.colors.background.default};
`;

export const ModalHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.border.default};
`;

export const ModalTitle = styled(Text)`
  font-size: ${theme.typography.fontSize.lg}px;
  font-weight: 700;
  color: ${theme.colors.text.default};
`;
