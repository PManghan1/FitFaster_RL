import React from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList, UserConsent } from '../../types/onboarding';
import { Text, Button, CheckBox } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userConsentSchema } from '../../types/onboarding';
import { useOnboarding } from '../../hooks/useOnboarding';
import tw from '../../utils/tailwind';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'UserConsent'>;

const UserConsentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { handleUserConsent } = useOnboarding();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserConsent>({
    resolver: zodResolver(userConsentSchema),
    defaultValues: {
      healthDataCollection: false,
      thirdPartySharing: false,
      marketingCommunications: false,
      termsAccepted: false,
      privacyPolicyAccepted: false,
      dataRetentionAcknowledged: false,
    },
  });

  const onSubmit = (data: UserConsent) => {
    const { isValid } = handleUserConsent(data);
    if (isValid) {
      navigation.navigate('DietaryPreferences');
    }
  };

  const ConsentItem = ({
    title,
    description,
    name,
    required = true,
  }: {
    title: string;
    description: string;
    name: keyof UserConsent;
    required?: boolean;
  }) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <View style={tw`mb-6`}>
          <CheckBox
            title={
              <View style={tw`flex-1 ml-2`}>
                <Text style={tw`font-semibold text-base`}>
                  {title} {required && <Text style={tw`text-red-500`}>*</Text>}
                </Text>
                <Text style={tw`text-gray-600 text-sm mt-1`}>{description}</Text>
              </View>
            }
            checked={value}
            onPress={() => onChange(!value)}
            containerStyle={tw`bg-transparent border-0 p-0 m-0`}
          />
          {errors[name] && <Text style={tw`text-red-500 mt-1 ml-2`}>{errors[name]?.message}</Text>}
        </View>
      )}
    />
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        <Text h1 style={tw`text-2xl font-bold mb-6`}>
          Data Privacy and Consent
        </Text>
        <Text style={tw`text-gray-600 mb-8`}>
          Your privacy is important to us. Please review and consent to our data handling practices.
        </Text>

        <ConsentItem
          title="Health Data Collection"
          description="Allow us to collect and process your health metrics, fitness data, and activity information to provide personalized recommendations and track your progress."
          name="healthDataCollection"
        />

        <ConsentItem
          title="Third-Party Integration"
          description="Allow sharing of necessary data with third-party services (e.g., fitness tracking devices) to enhance your experience."
          name="thirdPartySharing"
        />

        <ConsentItem
          title="Marketing Communications"
          description="Receive updates about new features, tips, and promotional offers. You can opt out at any time."
          name="marketingCommunications"
          required={false}
        />

        <ConsentItem
          title="Terms of Service"
          description="I agree to the Terms of Service and understand my rights and obligations as a user of the app."
          name="termsAccepted"
        />

        <ConsentItem
          title="Privacy Policy"
          description="I have read and agree to the Privacy Policy, including how my personal data will be collected, used, and protected."
          name="privacyPolicyAccepted"
        />

        <ConsentItem
          title="Data Retention"
          description="I understand that my data will be retained as long as I maintain an active account, and I can request its deletion at any time."
          name="dataRetentionAcknowledged"
        />

        <View style={tw`mt-4 mb-8`}>
          <Text style={tw`text-sm text-gray-500 italic`}>
            * Required consents are necessary to provide core app functionality. You can manage
            these preferences later in the app settings.
          </Text>
        </View>

        <View style={tw`flex-row justify-between mb-4`}>
          <Button
            title="View Privacy Policy"
            type="outline"
            buttonStyle={tw`border-blue-500 px-4`}
            titleStyle={tw`text-blue-500`}
            containerStyle={tw`flex-1 mr-2`}
            onPress={() => {
              // TODO: Implement privacy policy modal
              console.log('Show privacy policy');
            }}
          />
          <Button
            title="View Terms"
            type="outline"
            buttonStyle={tw`border-blue-500 px-4`}
            titleStyle={tw`text-blue-500`}
            containerStyle={tw`flex-1 ml-2`}
            onPress={() => {
              // TODO: Implement terms modal
              console.log('Show terms');
            }}
          />
        </View>

        <Button
          title="Continue"
          onPress={handleSubmit(onSubmit)}
          buttonStyle={tw`bg-blue-500 py-3 rounded-lg`}
          titleStyle={tw`font-bold`}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserConsentScreen;
