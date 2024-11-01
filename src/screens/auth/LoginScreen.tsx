import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Text } from 'react-native';

import {
  Button,
  ButtonText,
  Container,
  ContentContainer,
  ErrorText,
  FooterContainer,
  FooterText,
  Input,
  InputContainer,
  InputError,
  LinkText,
  Title,
} from '../../components/auth/styles';
import { useAuthStore } from '../../store/auth.store';
import { LoginFormData, loginSchema } from '../../types/auth';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  TwoFactorAuth: { email: string };
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

interface FieldProps {
  onChange: (value: string) => void;
  value: string;
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn, isLoading, error, isTwoFactorRequired } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await signIn(data.email, data.password);
      if (!result.error) {
        if (isTwoFactorRequired) {
          navigation.navigate('TwoFactorAuth', { email: data.email });
        } else {
          navigation.replace('Home');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <Container>
      <ContentContainer>
        <Title>
          <Text>Welcome Back</Text>
        </Title>

        {error && <ErrorText>{error}</ErrorText>}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }: { field: FieldProps }) => (
            <InputContainer hasError={!!errors.email}>
              <Input
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
                editable={!isLoading}
              />
              {errors.email && <InputError>{errors.email.message}</InputError>}
            </InputContainer>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }: { field: FieldProps }) => (
            <InputContainer hasError={!!errors.password}>
              <Input
                placeholder="Password"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                editable={!isLoading}
              />
              {errors.password && <InputError>{errors.password.message}</InputError>}
            </InputContainer>
          )}
        />

        <Button onPress={handleSubmit(onSubmit)} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ButtonText>
              <Text>Sign In</Text>
            </ButtonText>
          )}
        </Button>

        <Button
          variant="secondary"
          onPress={() => navigation.navigate('ForgotPassword')}
          disabled={isLoading}
        >
          <ButtonText variant="secondary">
            <Text>Forgot Password?</Text>
          </ButtonText>
        </Button>

        <FooterContainer>
          <FooterText>
            <Text>Don&apos;t have an account? </Text>
          </FooterText>
          <Button
            variant="secondary"
            onPress={() => navigation.navigate('Register')}
            disabled={isLoading}
          >
            <LinkText>
              <Text>Sign Up</Text>
            </LinkText>
          </Button>
        </FooterContainer>
      </ContentContainer>
    </Container>
  );
};
