import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Shield, Info } from 'react-native-feather';
import { ConsentPurpose } from '../../types/profile';

const Container = styled.View`
  margin-vertical: 8px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const Title = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
`;

const Required = styled.Text`
  font-size: 12px;
  color: #EF4444;
  margin-left: 8px;
`;

const Description = styled.Text`
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 12px;
`;

const ToggleContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ToggleTrack = styled.View<{ isEnabled: boolean }>`
  width: 48px;
  height: 24px;
  border-radius: 12px;
  background-color: ${props => props.isEnabled ? '#3B82F6' : '#D1D5DB'};
  padding: 2px;
`;

const ToggleThumb = styled.View<{ isEnabled: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: white;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.2;
  shadow-radius: 2px;
  elevation: 2;
  transform: translateX(${props => props.isEnabled ? '24px' : '0px'});
`;

const InfoButton = styled.TouchableOpacity`
  padding: 8px;
  margin-left: 8px;
`;

const InfoModal = styled.View`
  background-color: white;
  padding: 16px;
  border-radius: 12px;
  margin-top: 8px;
  border-width: 1px;
  border-color: #E5E7EB;
`;

const InfoTitle = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 8px;
`;

const InfoText = styled.Text`
  font-size: 14px;
  color: #6B7280;
`;

interface ConsentToggleProps {
  purpose: ConsentPurpose;
  title: string;
  description: string;
  isRequired?: boolean;
  isEnabled: boolean;
  onToggle: () => void;
  infoContent?: {
    title: string;
    description: string;
  };
  testID?: string;
}

export const ConsentToggle: React.FC<ConsentToggleProps> = ({
  purpose,
  title,
  description,
  isRequired = false,
  isEnabled,
  onToggle,
  infoContent,
  testID,
}) => {
  const [showInfo, setShowInfo] = React.useState(false);

  return (
    <Container testID={testID}>
      <Header>
        <Title>
          {title}
          {isRequired && <Required>Required</Required>}
        </Title>
        {infoContent && (
          <InfoButton 
            onPress={() => setShowInfo(!showInfo)}
            testID={`${testID}-info-button`}
          >
            <Info width={20} height={20} color="#6B7280" />
          </InfoButton>
        )}
      </Header>

      <Description>{description}</Description>

      {showInfo && infoContent && (
        <InfoModal testID={`${testID}-info-modal`}>
          <InfoTitle>{infoContent.title}</InfoTitle>
          <InfoText>{infoContent.description}</InfoText>
        </InfoModal>
      )}

      <ToggleContainer>
        <Shield width={20} height={20} color={isEnabled ? '#3B82F6' : '#6B7280'} />
        <TouchableOpacity
          onPress={isRequired ? undefined : onToggle}
          disabled={isRequired}
          testID={`${testID}-toggle`}
          activeOpacity={isRequired ? 1 : 0.8}
        >
          <ToggleTrack isEnabled={isEnabled || isRequired}>
            <ToggleThumb isEnabled={isEnabled || isRequired} />
          </ToggleTrack>
        </TouchableOpacity>
      </ToggleContainer>
    </Container>
  );
};
