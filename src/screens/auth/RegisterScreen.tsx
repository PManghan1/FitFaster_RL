import React from "react";
import { ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Text, TextInput, TouchableOpacity } from "../../components/styled";
import { useAuthStore } from "../../store/auth.store";
import { RegisterFormData, registerSchema } from "../../types/auth";

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp, isLoading, error } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { error } = await signUp(data);
      if (!error) {
        navigation.replace("Home");
      }
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ 
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 32,
          color: '#2563EB'
        }}>
          Create Account
        </Text>

        {error && (
          <Text style={{ color: '#EF4444', textAlign: 'center', marginBottom: 16 }}>
            {error}
          </Text>
        )}

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, value } }) => (
            <View style={{ marginBottom: 16 }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  borderRadius: 8,
                  padding: 16,
                  fontSize: 16,
                }}
                placeholder="Full Name"
                onChangeText={onChange}
                value={value}
                editable={!isLoading}
              />
              {errors.fullName && (
                <Text style={{ color: '#EF4444', marginTop: 4 }}>
                  {errors.fullName.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <View style={{ marginBottom: 16 }}>
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
                <Text style={{ color: '#EF4444', marginTop: 4 }}>
                  {errors.email.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <View style={{ marginBottom: 16 }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  borderRadius: 8,
                  padding: 16,
                  fontSize: 16,
                }}
                placeholder="Password"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                editable={!isLoading}
              />
              {errors.password && (
                <Text style={{ color: '#EF4444', marginTop: 4 }}>
                  {errors.password.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
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
                placeholder="Confirm Password"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                editable={!isLoading}
              />
              {errors.confirmPassword && (
                <Text style={{ color: '#EF4444', marginTop: 4 }}>
                  {errors.confirmPassword.message}
                </Text>
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
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#4B5563' }}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            disabled={isLoading}
          >
            <Text style={{ color: '#2563EB', fontWeight: 'bold' }}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
