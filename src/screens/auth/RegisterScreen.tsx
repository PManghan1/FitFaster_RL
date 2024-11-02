import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styled } from 'nativewind';

import { useAuthStore } from '../../store/auth.store';
import { RegisterFormData, registerSchema } from '../../types/auth';

// Style the components with NativeWind
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp, isLoading, error } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { error } = await signUp(data.email, data.password);
      if (!error) {
        navigation.replace('Home');
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <StyledView className="flex-1 bg-white p-4">
      <StyledView className="flex-1 justify-center">
        <StyledText className="text-2xl font-bold text-center mb-8 text-primary">
          Create Account
        </StyledText>

        {error && <StyledText className="text-error text-center mb-4">{error}</StyledText>}

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, value } }) => (
            <StyledView className="mb-4">
              <StyledTextInput
                className="border border-border rounded-lg p-4 text-base"
                placeholder="Full Name"
                onChangeText={onChange}
                value={value}
                editable={!isLoading}
              />
              {errors.fullName && (
                <StyledText className="text-error mt-1">{errors.fullName.message}</StyledText>
              )}
            </StyledView>
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <StyledView className="mb-4">
              <StyledTextInput
                className="border border-border rounded-lg p-4 text-base"
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
                editable={!isLoading}
              />
              {errors.email && (
                <StyledText className="text-error mt-1">{errors.email.message}</StyledText>
              )}
            </StyledView>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <StyledView className="mb-4">
              <StyledTextInput
                className="border border-border rounded-lg p-4 text-base"
                placeholder="Password"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                editable={!isLoading}
              />
              {errors.password && (
                <StyledText className="text-error mt-1">{errors.password.message}</StyledText>
              )}
            </StyledView>
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <StyledView className="mb-6">
              <StyledTextInput
                className="border border-border rounded-lg p-4 text-base"
                placeholder="Confirm Password"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                editable={!isLoading}
              />
              {errors.confirmPassword && (
                <StyledText className="text-error mt-1">
                  {errors.confirmPassword.message}
                </StyledText>
              )}
            </StyledView>
          )}
        />

        <StyledTouchableOpacity
          className="bg-primary px-4 py-4 rounded-lg mb-4"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <StyledText className="text-white text-center text-lg font-bold">Sign Up</StyledText>
          )}
        </StyledTouchableOpacity>

        <StyledView className="flex-row justify-center items-center">
          <StyledText className="text-secondary">Already have an account? </StyledText>
          <StyledTouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
            <StyledText className="text-primary font-bold">Sign In</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </StyledView>
  );
};
