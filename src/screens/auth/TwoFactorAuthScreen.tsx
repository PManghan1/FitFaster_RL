import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import {
  Button,
  ButtonText,
  Container,
  ContentContainer,
  ErrorText,
  Input,
  InputContainer,
  Title,
  VerificationText,
} from '../../components/auth/styles';
import { useAuthStore } from '../../store/auth.store';

type RootStackParamList = {
  TwoFactorAuth: { email: string };
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'TwoFactorAuth'>;

export const TwoFactorAuthScreen: React.FC<Props> = ({ route, navigation }) => {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const { verifyTwoFactorCode, isLoading, error } = useAuthStore();

  const onSubmit = async () => {
    try {
      const success = await verifyTwoFactorCode(email, code);
      if (success) {
        navigation.replace('Home');
      }
    } catch (err) {
      console.error('2FA verification error:', err);
    }
  };

  return (
    <Container>
      <ContentContainer>
        <Title>
          <Text>Two-Factor Authentication</Text>
        </Title>

        {error && <ErrorText>{error}</ErrorText>}

        <VerificationText>
          <Text>Enter the verification code sent to your email.</Text>
        </VerificationText>

        <InputContainer>
          <Input
            placeholder="Verification Code"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
            editable={!isLoading}
          />
        </InputContainer>

        <Button onPress={onSubmit} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ButtonText>
              <Text>Verify Code</Text>
            </ButtonText>
          )}
        </Button>
      </ContentContainer>
    </Container>
  );
};
