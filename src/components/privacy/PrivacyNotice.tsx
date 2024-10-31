import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ExternalLink } from 'react-native-feather';
import styled from 'styled-components/native';

import { colors } from '../../theme';

const Container = styled.View`
  padding: 16px;
  background-color: ${colors.background.default};
  border-radius: 12px;
  margin-vertical: 8px;
`;

const Section = styled.View`
  margin-bottom: 16px;
`;

const StyledSectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.text.default};
  margin-bottom: 8px;
`;

const StyledSectionContent = styled.Text`
  font-size: 14px;
  color: ${colors.text.light};
  line-height: 20px;
`;

const LinkContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 12px;
  background-color: ${colors.background.light};
  border-radius: 8px;
`;

const StyledLinkText = styled.Text`
  color: ${colors.text.default};
  font-size: 14px;
`;

const styles = StyleSheet.create({
  externalLink: {
    marginLeft: 'auto',
  },
});

interface PrivacyNoticeProps {
  onReadMore?: () => void;
  testID?: string;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ onReadMore, testID }) => {
  return (
    <Container testID={testID}>
      <Section>
        <StyledSectionTitle>
          <Text>Data Usage</Text>
        </StyledSectionTitle>
        <StyledSectionContent>
          <Text>
            We collect and process your fitness data to provide personalized workout recommendations
            and track your progress over time.
          </Text>
        </StyledSectionContent>
      </Section>

      <Section>
        <StyledSectionTitle>
          <Text>Data Collection</Text>
        </StyledSectionTitle>
        <StyledSectionContent>
          <Text>
            Information we collect includes workout history, exercise preferences, and basic health
            metrics. This data is used exclusively to enhance your fitness experience.
          </Text>
        </StyledSectionContent>
      </Section>

      <Section>
        <StyledSectionTitle>
          <Text>Data Protection</Text>
        </StyledSectionTitle>
        <StyledSectionContent>
          <Text>
            Your data is encrypted and stored securely. We implement industry-standard security
            measures to protect your information from unauthorized access.
          </Text>
        </StyledSectionContent>
      </Section>

      <Section>
        <StyledSectionTitle>
          <Text>Data Retention</Text>
        </StyledSectionTitle>
        <StyledSectionContent>
          <Text>
            You can request deletion of your data at any time. We retain your data only as long as
            necessary to provide our services and comply with legal obligations.
          </Text>
        </StyledSectionContent>
      </Section>

      {onReadMore && (
        <LinkContainer onPress={onReadMore} testID={`${testID}-read-more`}>
          <StyledLinkText>
            <Text>Read Full Privacy Policy</Text>
          </StyledLinkText>
          <ExternalLink
            width={16}
            height={16}
            color={colors.primary.default}
            style={styles.externalLink}
          />
        </LinkContainer>
      )}
    </Container>
  );
};
