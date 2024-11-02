import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styled } from 'nativewind';

import { useAuthStore } from '../../store/auth.store';
import { ForgotPasswordFormData, forgotPasswordSchema } from '../../types/auth';

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

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { resetPassword, isLoading, error } = useAuthStore();
  const [isEmailSent, setIsEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await resetPassword(data.email);
      setIsEmailSent(true);
    } catch (err) {
      console.error('Reset password error:', err);
    }
  };

  if (isEmailSent) {
    return (
      <StyledView className="flex-1 bg-white p-4">
        <StyledView className="flex-1 justify-center items-center">
          <StyledText className="text-2xl font-bold text-center mb-4 text-primary">
            Check Your Email
          </StyledText>
          <StyledText className="text-center mb-8 text-secondary text-base">
            We&apos;ve sent password reset instructions to your email address.
          </StyledText>
          <StyledTouchableOpacity
            className="bg-primary px-4 py-4 rounded-lg w-full"
            onPress={() => navigation.navigate('Login')}
          >
            <StyledText className="text-white text-center text-lg font-bold">
              Back to Login
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    );
  }

  return (
    <StyledView className="flex-1 bg-white p-4">
      <StyledView className="flex-1 justify-center">
        <StyledText className="text-2xl font-bold text-center mb-4 text-primary">
          Reset Password
        </StyledText>
        <StyledText className="text-center mb-8 text-secondary text-base">
          Enter your email address and we&apos;ll send you instructions to reset your password.
        </StyledText>

        {error && <StyledText className="text-error text-center mb-4">{error}</StyledText>}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <StyledView className="mb-6">
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

        <StyledTouchableOpacity
          className="bg-primary px-4 py-4 rounded-lg mb-4"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <StyledText className="text-white text-center text-lg font-bold">
              Send Reset Instructions
            </StyledText>
          )}
        </StyledTouchableOpacity>

        <StyledTouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
          <StyledText className="text-primary text-center">Back to Login</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
};
