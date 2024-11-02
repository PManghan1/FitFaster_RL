import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator } from 'react-native';

import { Text, TextInput, TouchableOpacity, View } from '../../components/styled';
import { useAuthStore } from '../../store/auth.store';
import { ForgotPasswordFormData, forgotPasswordSchema } from '../../types/auth';

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
      <View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 16,
              color: '#2563EB',
            }}
          >
            Check Your Email
          </Text>
          <Text
            style={{
              textAlign: 'center',
              marginBottom: 32,
              color: '#4B5563',
              fontSize: 16,
            }}
          >
            We&apos;ve sent password reset instructions to your email address.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#2563EB',
              padding: 16,
              borderRadius: 8,
              width: '100%',
            }}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 16,
            color: '#2563EB',
          }}
        >
          Reset Password
        </Text>
        <Text
          style={{
            textAlign: 'center',
            marginBottom: 32,
            color: '#4B5563',
            fontSize: 16,
          }}
        >
          Enter your email address and we&apos;ll send you instructions to reset your password.
        </Text>

        {error && (
          <Text style={{ color: '#EF4444', textAlign: 'center', marginBottom: 16 }}>{error}</Text>
        )}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <View style={{ marginBottom: 24 }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  borderRadius: 8,
                  padding: 16,
                  fontSize: 16,
                }}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
                editable={!isLoading}
              />
              {errors.email && (
                <Text style={{ color: '#EF4444', marginTop: 4 }}>{errors.email.message}</Text>
              )}
            </View>
          )}
        />

        <TouchableOpacity
          style={{
            backgroundColor: '#2563EB',
            padding: 16,
            borderRadius: 8,
            marginBottom: 16,
          }}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
              Send Reset Instructions
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
          <Text style={{ color: '#2563EB', textAlign: 'center' }}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
