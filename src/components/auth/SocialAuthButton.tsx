import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from "react-native";
import { Provider } from "@supabase/supabase-js";

interface SocialAuthButtonProps {
  provider: Provider;
  onPress: () => Promise<void>;
  isLoading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const getProviderConfig = (provider: Provider) => {
  switch (provider) {
    case "google":
      return {
        text: "Continue with Google",
        backgroundColor: "#fff",
        textColor: "#1F2937",
        borderColor: "#D1D5DB",
      };
    case "apple":
      return {
        text: "Continue with Apple",
        backgroundColor: "#000",
        textColor: "#fff",
        borderColor: "#000",
      };
    case "facebook":
      return {
        text: "Continue with Facebook",
        backgroundColor: "#1877F2",
        textColor: "#fff",
        borderColor: "#1877F2",
      };
    default:
      return {
        text: `Continue with ${provider}`,
        backgroundColor: "#fff",
        textColor: "#1F2937",
        borderColor: "#D1D5DB",
      };
  }
};

export const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({
  provider,
  onPress,
  isLoading = false,
  style,
  testID,
}) => {
  const config = getProviderConfig(provider);

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        {
          backgroundColor: config.backgroundColor,
          padding: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: config.borderColor,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 12,
        },
        style,
      ]}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator
          color={config.textColor}
          style={{ marginRight: 8 }}
        />
      ) : null}
      <Text
        style={{
          color: config.textColor,
          fontSize: 16,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {config.text}
      </Text>
    </TouchableOpacity>
  );
};
