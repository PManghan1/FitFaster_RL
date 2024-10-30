import React from "react";
import { TextInput as RNTextInput, TextInputProps, ViewStyle } from "react-native";
import { TextInput, Text, View } from "../styled";

interface AuthInputProps extends Omit<TextInputProps, 'style'> {
  error?: string;
  label?: string;
  style?: ViewStyle;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  error,
  label,
  style,
  ...props
}) => {
  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text
          style={{
            fontSize: 14,
            color: "#4B5563",
            marginBottom: 4,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        style={[{
          borderWidth: 1,
          borderColor: error ? "#EF4444" : "#D1D5DB",
          borderRadius: 8,
          padding: 16,
          fontSize: 16,
          backgroundColor: "white",
        }, style]}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && (
        <Text
          style={{
            color: "#EF4444",
            fontSize: 12,
            marginTop: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};
