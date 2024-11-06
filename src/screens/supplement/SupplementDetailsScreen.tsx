import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, Tab, TabView } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import useSupplementStore from '../../store/supplement.store';
import { ReminderSettings } from '../../components/supplement/ReminderSettings';
import { IntakeHistory } from '../../components/supplement/IntakeHistory';
import { IntakeLogModal } from '../../components/supplement/IntakeLogModal';
import tw from '../../utils/tailwind';
import type { SupplementStackParamList } from '../../navigation/SupplementNavigator';

type NavigationProp = StackNavigationProp<SupplementStackParamList, 'SupplementDetails'>;
type RoutePropType = RouteProp<SupplementStackParamList, 'SupplementDetails'>;

export const SupplementDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { supplementId } = route.params;

  const {
    supplements,
    intakes,
    logIntake,
    deleteSupplement,
    deleteIntake,
    toggleReminders,
    updateReminderTimes,
  } = useSupplementStore();

  const supplement = supplements.find(s => s.id === supplementId);
  const supplementIntakes = intakes.filter(i => i.supplementId === supplementId);

  const [tabIndex, setTabIndex] = useState(0);
  const [intakeModalVisible, setIntakeModalVisible] = useState(false);

  if (!supplement) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center`}>
        <Text>Supplement not found</Text>
      </SafeAreaView>
    );
  }

  const handleDelete = async () => {
    await deleteSupplement(supplementId);
    navigation.goBack();
  };

  const handleUpdateReminders = async (enabled: boolean, times: string[]) => {
    await toggleReminders(supplementId, enabled);
    if (enabled) {
      await updateReminderTimes(supplementId, times);
    }
  };

  const handleIntakeSubmit = async (dosage: number, notes?: string) => {
    await logIntake(supplementId, dosage, notes);
    setIntakeModalVisible(false);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <ScrollView>
        <View style={tw`p-4`}>
          <Text h1 style={tw`text-2xl font-bold mb-2`}>
            {supplement.name}
          </Text>
          <Text style={tw`text-gray-600 mb-4`}>
            {supplement.dosage} {supplement.unit} • {supplement.frequency}
          </Text>

          <Button
            title="Log Intake"
            onPress={() => setIntakeModalVisible(true)}
            buttonStyle={tw`bg-blue-500 mb-4`}
          />

          <Tab value={tabIndex} onChange={setTabIndex} indicatorStyle={tw`bg-blue-500`}>
            <Tab.Item title="History" />
            <Tab.Item title="Reminders" />
          </Tab>

          <TabView value={tabIndex} onChange={setTabIndex} animationType="spring">
            <TabView.Item style={tw`w-full`}>
              <IntakeHistory intakes={supplementIntakes} onDelete={deleteIntake} />
            </TabView.Item>

            <TabView.Item style={tw`w-full`}>
              <ReminderSettings supplement={supplement} onUpdateReminders={handleUpdateReminders} />
            </TabView.Item>
          </TabView>
        </View>

        <View style={tw`p-4`}>
          <Button title="Delete Supplement" onPress={handleDelete} buttonStyle={tw`bg-red-500`} />
        </View>
      </ScrollView>

      <IntakeLogModal
        visible={intakeModalVisible}
        supplement={supplement}
        onClose={() => setIntakeModalVisible(false)}
        onLog={handleIntakeSubmit}
      />
    </SafeAreaView>
  );
};
