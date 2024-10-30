import React from 'react';
import { ScrollView, Linking } from 'react-native';
import styled from 'styled-components/native';
import { FileText, ExternalLink, Shield } from 'react-native-feather';
import { DataSensitivityIndicator } from './DataSensitivityIndicator';

const Container = styled.View`
  padding: 16px;
  background-color: white;
  border-radius: 12px;
  border-width: 1px;
  border-color: #E5E7EB;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin-left: 8px;
`;

const Section = styled.View`
  margin-bottom: 16px;
`;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

const SectionContent = styled.Text`
  font-size: 14px;
  color: #6B7280;
  line-height: 20px;
`;

const LinkContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 12px;
  background-color: #F3F4F6;
  border-radius: 8px;
  margin-top: 8px;
`;

const LinkText = styled.Text`
  font-size: 14px;
  color: #3B82F6;
  margin-left: 8px;
`;

const BulletList = styled.View`
  margin-top: 8px;
`;

const BulletPoint = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 4px;
`;

const Bullet = styled.View`
  width: 4px;
  height: 4px;
  border-radius: 2px;
  background-color: #6B7280;
  margin-top: 8px;
  margin-right: 8px;
`;

const BulletText = styled.Text`
  flex: 1;
  font-size: 14px;
  color: #6B7280;
  line-height: 20px;
`;

interface PrivacyNoticeProps {
  title?: string;
  dataUsageDescription: string;
  dataCollectionPoints: string[];
  dataProtectionMeasures: string[];
  privacyPolicyUrl: string;
  dataRetentionPeriod: string;
  testID?: string;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({
  title = 'Privacy Notice',
  dataUsageDescription,
  dataCollectionPoints,
  dataProtectionMeasures,
  privacyPolicyUrl,
  dataRetentionPeriod,
  testID,
}) => {
  const handlePrivacyPolicyPress = () => {
    Linking.openURL(privacyPolicyUrl);
  };

  return (
    <ScrollView>
      <Container testID={testID}>
        <Header>
          <Shield width={24} height={24} color="#3B82F6" />
          <Title>{title}</Title>
        </Header>

        <Section>
          <SectionTitle>Data Usage</SectionTitle>
          <SectionContent>{dataUsageDescription}</SectionContent>
        </Section>

        <Section>
          <SectionTitle>Data Collection</SectionTitle>
          <BulletList>
            {dataCollectionPoints.map((point, index) => (
              <BulletPoint key={index} testID={`${testID}-collection-point-${index}`}>
                <Bullet />
                <BulletText>{point}</BulletText>
              </BulletPoint>
            ))}
          </BulletList>
        </Section>

        <Section>
          <SectionTitle>Data Protection</SectionTitle>
          <BulletList>
            {dataProtectionMeasures.map((measure, index) => (
              <BulletPoint key={index} testID={`${testID}-protection-measure-${index}`}>
                <Bullet />
                <BulletText>{measure}</BulletText>
              </BulletPoint>
            ))}
          </BulletList>
        </Section>

        <Section>
          <SectionTitle>Data Retention</SectionTitle>
          <SectionContent>{dataRetentionPeriod}</SectionContent>
        </Section>

        <DataSensitivityIndicator
          level="high"
          dataType="Health & Fitness Data"
          protectionMeasures={[
            'End-to-end encryption',
            'Regular security audits',
            'Strict access controls',
          ]}
          testID={`${testID}-sensitivity-indicator`}
        />

        <LinkContainer 
          onPress={handlePrivacyPolicyPress}
          testID={`${testID}-privacy-policy-link`}
        >
          <FileText width={20} height={20} color="#3B82F6" />
          <LinkText>Read Full Privacy Policy</LinkText>
          <ExternalLink width={16} height={16} color="#3B82F6" style={{ marginLeft: 'auto' }} />
        </LinkContainer>
      </Container>
    </ScrollView>
  );
};

// Example usage configuration
export const DEFAULT_PRIVACY_NOTICE_CONFIG = {
  dataUsageDescription: 
    'We collect and process your data to provide personalized fitness tracking and health monitoring services. Your privacy and data security are our top priorities.',
  dataCollectionPoints: [
    'Basic profile information (name, email)',
    'Health metrics (weight, height, activity levels)',
    'Fitness goals and preferences',
    'Workout and nutrition data',
  ],
  dataProtectionMeasures: [
    'Advanced encryption for all sensitive data',
    'Regular security audits and updates',
    'Strict access controls and authentication',
    'Compliance with GDPR and health data regulations',
    'Transparent data processing practices',
  ],
  privacyPolicyUrl: 'https://fitfaster.app/privacy',
  dataRetentionPeriod: 
    'Your data is retained for the duration of your account activity plus 30 days after account deletion. You can request complete data deletion at any time.',
};
