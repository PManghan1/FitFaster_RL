import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { AlertTriangle, Check, Info, Shield } from 'react-native-feather';
import styled from 'styled-components/native';

import { colors, withOpacity } from '../../theme';

type SecurityLevel = 'secure' | 'warning' | 'info';

interface SecurityBadgeProps {
  title: string;
  description: string;
  details: string[];
  status: SecurityLevel;
  testID?: string;
  onPress?: () => void;
}

const Container = styled(TouchableOpacity)`
  padding: 8px 12px;
  border-radius: 8px;
  margin-vertical: 4px;
`;

const Header = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const IconContainer = styled(View)`
  margin-right: 8px;
`;

const TitleContainer = styled(View)`
  flex: 1;
  flex-direction: row;
  align-items: center;
`;

const Title = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.text.default};
`;

const Description = styled(Text)`
  font-size: 14px;
  color: ${colors.text.light};
  margin-top: 4px;
`;

const DetailContainer = styled(View)`
  margin-top: 8px;
`;

const DetailItem = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-vertical: 4px;
`;

const DetailText = styled(Text)`
  font-size: 14px;
  color: ${colors.text.light};
  margin-left: 8px;
`;

const getStatusColor = (status: SecurityLevel): string => {
  switch (status) {
    case 'secure':
      return colors.success.default;
    case 'warning':
      return colors.error.default;
    case 'info':
      return colors.info.default;
  }
};

const styles = StyleSheet.create({
  infoContainer: {
    backgroundColor: withOpacity(colors.info.default, 0.1),
  },
  secureContainer: {
    backgroundColor: withOpacity(colors.success.default, 0.1),
  },
  warningContainer: {
    backgroundColor: withOpacity(colors.error.default, 0.1),
  },
});

const getContainerStyle = (status: SecurityLevel): ViewStyle => {
  switch (status) {
    case 'secure':
      return styles.secureContainer;
    case 'warning':
      return styles.warningContainer;
    case 'info':
      return styles.infoContainer;
  }
};

const StatusIcon: React.FC<{ status: SecurityLevel }> = ({ status }) => {
  const color = getStatusColor(status);
  switch (status) {
    case 'secure':
      return <Shield width={20} height={20} color={color} />;
    case 'warning':
      return <AlertTriangle width={20} height={20} color={color} />;
    case 'info':
      return <Info width={20} height={20} color={color} />;
  }
};

export const SecurityBadge: React.FC<SecurityBadgeProps> = ({
  title,
  description,
  details,
  status,
  testID = 'security-badge',
  onPress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePress = () => {
    setIsExpanded(!isExpanded);
    onPress?.();
  };

  return (
    <Container testID={testID} onPress={handlePress} style={getContainerStyle(status)}>
      <Header>
        <TitleContainer>
          <IconContainer>
            <StatusIcon status={status} />
          </IconContainer>
          <Title>{title}</Title>
        </TitleContainer>
      </Header>
      <Description>{description}</Description>
      {isExpanded && (
        <DetailContainer>
          {details.map((detail, index) => (
            <DetailItem key={index} testID={`${testID}-detail-${index}`}>
              <Check width={16} height={16} color={colors.success.default} />
              <DetailText>{detail}</DetailText>
            </DetailItem>
          ))}
        </DetailContainer>
      )}
    </Container>
  );
};
