import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, CheckBox } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../hooks/useOnboarding';
import type { UserConsent } from '../../types/onboarding';
import tw from '../../utils/tailwind';

const CONSENT_ITEMS = [
  {
    key: 'healthDataCollection',
    title: 'Health Data Collection',
    description:
      'Allow us to collect and analyze your health and fitness data to provide personalized recommendations.',
  },
  {
    key: 'thirdPartySharing',
    title: 'Third-Party Data Sharing',
    description:
      'Share your data with trusted partners to enhance your fitness experience (optional).',
  },
  {
    key: 'marketing',
    title: 'Marketing Communications',
    description:
      'Receive updates, tips, and promotional offers related to your fitness journey (optional).',
  },
  {
    key: 'notifications',
    title: 'Push Notifications',
    description: 'Allow us to send you reminders, updates, and important alerts.',
  },
  {
    key: 'locationTracking',
    title: 'Location Services',
    description:
      'Enable location tracking for workout tracking and nearby facility recommendations (optional).',
  },
] as const;

export const UserConsentScreen: React.FC = () => {
  const { handleUserConsent } = useOnboarding();
  const [consent, setConsent] = useState<UserConsent>({
    healthDataCollection: false,
    thirdPartySharing: false,
    marketing: false,
    notifications: false,
    locationTracking: false,
  });
  const [error, setError] = useState<string | null>(null);

  const handleToggleConsent = (key: keyof UserConsent) => {
    setConsent(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!consent.healthDataCollection || !consent.notifications) {
      setError('Health data collection and notifications are required to use the app');
      return;
    }

    const { isValid, errors } = await handleUserConsent(consent);
    if (!isValid && errors) {
      setError(Object.values(errors)[0]);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        <Text h1 style={tw`text-2xl font-bold mb-2`}>
          Privacy & Consent
        </Text>
        <Text style={tw`text-gray-600 mb-6`}>
          Please review and confirm your privacy preferences.
        </Text>

        <View style={tw`mb-6`}>
          {CONSENT_ITEMS.map(item => (
            <View key={item.key} style={tw`mb-4`}>
              <CheckBox
                title={item.title}
                checked={consent[item.key]}
                onPress={() => handleToggleConsent(item.key)}
                containerStyle={tw`bg-transparent border-0 p-0 m-0 mb-1`}
                textStyle={tw`font-bold`}
                checkedColor="#3B82F6"
                accessibilityLabel={`${item.title} consent`}
                accessibilityHint={item.description}
              />
              <Text style={tw`text-gray-600 ml-8`}>{item.description}</Text>
              {(item.key === 'healthDataCollection' || item.key === 'notifications') && (
                <Text style={tw`text-red-500 ml-8 mt-1`}>Required</Text>
              )}
            </View>
          ))}
        </View>

        {error && <Text style={tw`text-red-500 mb-4 text-center`}>{error}</Text>}

        <Button
          title="Continue"
          onPress={handleSubmit}
          buttonStyle={tw`bg-blue-500 py-3 rounded-lg`}
          titleStyle={tw`font-bold`}
        />

        <Text style={tw`text-gray-500 text-xs text-center mt-4`}>
          You can update these preferences later in Settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserConsentScreen;
