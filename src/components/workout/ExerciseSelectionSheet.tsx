import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { X } from 'react-native-feather';
import styled from 'styled-components/native';

const Container = styled(View)`
  flex: 1;
`;

const Header = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
`;

const CloseButton = styled(TouchableOpacity)`
  padding: 8px;
`;

interface ExerciseSelectionSheetProps {
  onClose: () => void;
}

export const ExerciseSelectionSheet: React.FC<ExerciseSelectionSheetProps> = ({ onClose }) => {
  return (
    <Container>
      <Header>
        <Title>
          <Text>Select Exercise</Text>
        </Title>
        <CloseButton onPress={onClose}>
          <X width={24} height={24} color="#6b7280" />
        </CloseButton>
      </Header>
    </Container>
  );
};
