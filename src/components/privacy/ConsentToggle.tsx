import React, { useState } from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import { Info, Shield } from 'react-native-feather';
import styled from 'styled-components/native';

import { ConsentPurpose } from '../../types/profile';

interface ConsentToggleProps {
  purpose: ConsentPurpose;
  isEnabled: boolean;
  onToggle: (value: boolean) => void;
  infoContent?: string;
  testID?: string;
}

const Container = styled(View)`
  margin-vertical: 8px;
`;

const Header = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const TitleContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const IconContainer = styled(View)`
  margin-right: 8px;
`;

const Title = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
`;

const Description = styled(Text)`
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 8px;
`;

const InfoButton = styled(TouchableOpacity)`
  padding: 4px;
  margin-left: 8px;
`;

const InfoContent = styled(Text)`
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
  padding: 8px;
  background-color: #f3f4f6;
  border-radius: 4px;
`;

const ToggleContainer = styled(View)`
  flex-direction: row;
  align-items: center;
`;

export const ConsentToggle: React.FC<ConsentToggleProps> = ({
  purpose,
  isEnabled,
  onToggle,
  infoContent,
  testID = 'consent-toggle',
}) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <Container testID={testID}>
      <Header>
        <TitleContainer>
          <IconContainer>
            <Shield width={20} height={20} color="#10B981" />
          </IconContainer>
          <Title>{purpose.title}</Title>
        </TitleContainer>
        <ToggleContainer>
          <Switch
            testID={`${testID}-toggle`}
            value={isEnabled}
            onValueChange={onToggle}
            trackColor={{ false: '#D1D5DB', true: '#10B981' }}
            thumbColor={isEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        </ToggleContainer>
        {infoContent && (
          <InfoButton onPress={() => setShowInfo(!showInfo)} testID={`${testID}-info-button`}>
            <Info width={20} height={20} color="#6B7280" />
          </InfoButton>
        )}
      </Header>
      <Description>{purpose.description}</Description>
      {showInfo && infoContent && (
        <InfoContent testID={`${testID}-info-content`}>{infoContent}</InfoContent>
      )}
    </Container>
  );
};
