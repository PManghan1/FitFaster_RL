import React from 'react';
import { Text } from 'react-native';
import { AlertTriangle, Lock, Shield } from 'react-native-feather';
import styled from 'styled-components/native';

type SensitivityLevel = 'low' | 'medium' | 'high';

interface SensitivityConfig {
  color: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}

const Container = styled.View`
  padding: 12px;
  border-radius: 8px;
  margin-vertical: 4px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const Badge = styled.View<{ color: string }>`
  flex-direction: row;
  align-items: center;
  padding: 4px 8px;
  border-radius: 16px;
  background-color: ${props => `${props.color}20`};
`;

const Label = styled.Text<{ color: string }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.color};
  margin-left: 4px;
`;

const Description = styled.Text`
  font-size: 14px;
  color: #6b7280;
`;

const InfoContainer = styled.View`
  margin-top: 8px;
  padding: 8px;
  background-color: #f3f4f6;
  border-radius: 6px;
`;

const InfoText = styled.Text`
  font-size: 12px;
  color: #4b5563;
`;

const DescriptionContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const MeasureItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
`;

const getSensitivityConfig = (level: SensitivityLevel): SensitivityConfig => {
  switch (level) {
    case 'low':
      return {
        color: '#4CAF50',
        icon: <Shield width={16} height={16} color="#4CAF50" />,
        label: 'Low Sensitivity',
        description: 'Basic information that poses minimal privacy risk.',
      };
    case 'medium':
      return {
        color: '#FFC107',
        icon: <Lock width={16} height={16} color="#FFC107" />,
        label: 'Medium Sensitivity',
        description: 'Personal information requiring standard protection measures.',
      };
    case 'high':
      return {
        color: '#EF4444',
        icon: <AlertTriangle width={16} height={16} color="#EF4444" />,
        label: 'High Sensitivity',
        description: 'Sensitive health data requiring enhanced protection.',
      };
  }
};

interface DataSensitivityIndicatorProps {
  level: SensitivityLevel;
  dataType: string;
  protectionMeasures?: string[];
  testID?: string;
}

const styles = {
  inlineText: {
    color: '#6B7280',
    marginHorizontal: 4,
  },
  protectionText: {
    fontSize: 12,
    color: '#4B5563',
  },
  bulletText: {
    fontSize: 12,
    color: '#4B5563',
    marginRight: 4,
  },
};

export const DataSensitivityIndicator: React.FC<DataSensitivityIndicatorProps> = ({
  level,
  dataType,
  protectionMeasures,
  testID,
}) => {
  const config = getSensitivityConfig(level);

  return (
    <Container testID={testID}>
      <Header>
        <Badge color={config.color}>
          {config.icon}
          <Label color={config.color}>{config.label}</Label>
        </Badge>
      </Header>

      <DescriptionContainer>
        <Description>{dataType}</Description>
        <Text style={styles.inlineText}>{' - '}</Text>
        <Description>{config.description}</Description>
      </DescriptionContainer>

      {protectionMeasures && protectionMeasures.length > 0 && (
        <InfoContainer>
          <Text style={styles.protectionText}>Protection measures:</Text>
          {protectionMeasures.map((measure, index) => (
            <MeasureItem key={index}>
              <Text style={styles.bulletText}>•</Text>
              <InfoText testID={`${testID}-measure-${index}`}>{measure}</InfoText>
            </MeasureItem>
          ))}
        </InfoContainer>
      )}
    </Container>
  );
};

// Preset configurations for common data types
export const DATA_SENSITIVITY_PRESETS = {
  BASIC_PROFILE: {
    level: 'low' as SensitivityLevel,
    dataType: 'Basic Profile Information',
    protectionMeasures: ['Standard encryption', 'Basic access controls'],
  },
  CONTACT_INFO: {
    level: 'medium' as SensitivityLevel,
    dataType: 'Contact Information',
    protectionMeasures: ['Enhanced encryption', 'Access logging', 'User consent required'],
  },
  HEALTH_DATA: {
    level: 'high' as SensitivityLevel,
    dataType: 'Health Information',
    protectionMeasures: [
      'Advanced encryption',
      'Strict access controls',
      'Detailed audit logging',
      'Explicit consent required',
      'Regular security reviews',
    ],
  },
};
