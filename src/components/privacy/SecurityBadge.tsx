import React from 'react';
import styled from 'styled-components/native';
import { 
  Shield, 
  Lock, 
  Check, 
  AlertTriangle,
  Info,
} from 'react-native-feather';

type SecurityStatus = 'secure' | 'warning' | 'error' | 'info';
type ComplianceType = 'GDPR' | 'HIPAA' | 'encryption' | 'audit' | 'consent';

const Container = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  margin-vertical: 4px;
`;

const IconContainer = styled.View<{ status: SecurityStatus }>`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  justify-content: center;
  align-items: center;
  background-color: ${props => {
    switch (props.status) {
      case 'secure': return '#4CAF5020';
      case 'warning': return '#FFC10720';
      case 'error': return '#EF444420';
      case 'info': return '#3B82F620';
    }
  }};
`;

const Content = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const Title = styled.Text<{ status: SecurityStatus }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => {
    switch (props.status) {
      case 'secure': return '#4CAF50';
      case 'warning': return '#FFC107';
      case 'error': return '#EF4444';
      case 'info': return '#3B82F6';
    }
  }};
`;

const Description = styled.Text`
  font-size: 12px;
  color: #6B7280;
  margin-top: 2px;
`;

const DetailContainer = styled.View`
  background-color: #F9FAFB;
  padding: 12px;
  border-radius: 8px;
  margin-top: 8px;
`;

const DetailItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-vertical: 4px;
`;

const DetailText = styled.Text`
  font-size: 12px;
  color: #4B5563;
  margin-left: 8px;
`;

interface SecurityBadgeProps {
  type: ComplianceType;
  status: SecurityStatus;
  title?: string;
  description?: string;
  details?: string[];
  onPress?: () => void;
  testID?: string;
}

const getComplianceConfig = (type: ComplianceType) => {
  switch (type) {
    case 'GDPR':
      return {
        defaultTitle: 'GDPR Compliant',
        defaultDescription: 'Meets EU data protection requirements',
      };
    case 'HIPAA':
      return {
        defaultTitle: 'HIPAA Aligned',
        defaultDescription: 'Health data protection standards',
      };
    case 'encryption':
      return {
        defaultTitle: 'End-to-End Encrypted',
        defaultDescription: 'Data is securely encrypted',
      };
    case 'audit':
      return {
        defaultTitle: 'Security Audited',
        defaultDescription: 'Regular security assessments',
      };
    case 'consent':
      return {
        defaultTitle: 'Consent Managed',
        defaultDescription: 'User consent tracking active',
      };
  }
};

const StatusIcon: React.FC<{ status: SecurityStatus }> = ({ status }) => {
  switch (status) {
    case 'secure':
      return <Shield width={20} height={20} color="#4CAF50" />;
    case 'warning':
      return <AlertTriangle width={20} height={20} color="#FFC107" />;
    case 'error':
      return <AlertTriangle width={20} height={20} color="#EF4444" />;
    case 'info':
      return <Info width={20} height={20} color="#3B82F6" />;
  }
};

export const SecurityBadge: React.FC<SecurityBadgeProps> = ({
  type,
  status,
  title,
  description,
  details,
  onPress,
  testID,
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const config = getComplianceConfig(type);

  const handlePress = () => {
    setExpanded(!expanded);
    onPress?.();
  };

  return (
    <Container 
      onPress={handlePress}
      activeOpacity={0.7}
      testID={testID}
    >
      <IconContainer status={status}>
        <StatusIcon status={status} />
      </IconContainer>

      <Content>
        <Title status={status}>
          {title || config.defaultTitle}
        </Title>
        <Description>
          {description || config.defaultDescription}
        </Description>

        {expanded && details && details.length > 0 && (
          <DetailContainer>
            {details.map((detail, index) => (
              <DetailItem key={index} testID={`${testID}-detail-${index}`}>
                <Check width={16} height={16} color="#4CAF50" />
                <DetailText>{detail}</DetailText>
              </DetailItem>
            ))}
          </DetailContainer>
        )}
      </Content>
    </Container>
  );
};

// Preset configurations for common security badges
export const SECURITY_BADGE_PRESETS = {
  GDPR_COMPLIANT: {
    type: 'GDPR' as ComplianceType,
    status: 'secure' as SecurityStatus,
    details: [
      'Data processing transparency',
      'User consent management',
      'Data portability support',
      'Right to be forgotten',
    ],
  },
  ENCRYPTION_ACTIVE: {
    type: 'encryption' as ComplianceType,
    status: 'secure' as SecurityStatus,
    details: [
      'AES-256 encryption',
      'Secure key management',
      'End-to-end encryption',
      'Regular security audits',
    ],
  },
  CONSENT_MANAGED: {
    type: 'consent' as ComplianceType,
    status: 'secure' as SecurityStatus,
    details: [
      'Explicit consent tracking',
      'Purpose specification',
      'Consent withdrawal support',
      'Audit trail maintenance',
    ],
  },
};
