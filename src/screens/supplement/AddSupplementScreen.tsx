import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Input, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import useSupplementStore from '../../store/supplement.store';
import type { SupplementFrequency, SupplementUnit } from '../../types/supplement';
import { Picker } from '@react-native-picker/picker';
import tw from '../../utils/tailwind';

type RootStackParamList = {
  SupplementList: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const AddSupplementScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { addSupplement } = useSupplementStore();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [unit, setUnit] = useState<SupplementUnit>('mg');
  const [frequency, setFrequency] = useState<SupplementFrequency>('daily');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!name || !dosage) {
      // Show error
      return;
    }

    const dosageNum = parseFloat(dosage);
    if (isNaN(dosageNum) || dosageNum <= 0) {
      // Show error
      return;
    }

    await addSupplement({
      name,
      dosage: dosageNum,
      unit,
      frequency,
      notes: notes || undefined,
      startDate: new Date(),
      remindersEnabled: false,
      reminderTimes: [],
    });

    navigation.goBack();
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <ScrollView style={tw`p-4`}>
        <Text h1 style={tw`text-2xl font-bold mb-6`}>
          Add New Supplement
        </Text>

        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-600 mb-2`}>Supplement Name</Text>
          <Input value={name} onChangeText={setName} placeholder="Enter supplement name" />
        </View>

        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-600 mb-2`}>Dosage</Text>
          <Input
            value={dosage}
            onChangeText={setDosage}
            keyboardType="numeric"
            placeholder="Enter dosage amount"
          />
        </View>

        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-600 mb-2`}>Unit</Text>
          <View style={tw`border border-gray-300 rounded-lg`}>
            <Picker selectedValue={unit} onValueChange={value => setUnit(value as SupplementUnit)}>
              <Picker.Item label="Milligrams (mg)" value="mg" />
              <Picker.Item label="Grams (g)" value="g" />
              <Picker.Item label="Micrograms (mcg)" value="mcg" />
              <Picker.Item label="Milliliters (ml)" value="ml" />
              <Picker.Item label="Capsule" value="capsule" />
              <Picker.Item label="Tablet" value="tablet" />
              <Picker.Item label="Scoop" value="scoop" />
              <Picker.Item label="Serving" value="serving" />
            </Picker>
          </View>
        </View>

        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-600 mb-2`}>Frequency</Text>
          <View style={tw`border border-gray-300 rounded-lg`}>
            <Picker
              selectedValue={frequency}
              onValueChange={value => setFrequency(value as SupplementFrequency)}
            >
              <Picker.Item label="Daily" value="daily" />
              <Picker.Item label="Weekly" value="weekly" />
              <Picker.Item label="Monthly" value="monthly" />
              <Picker.Item label="As Needed" value="as_needed" />
            </Picker>
          </View>
        </View>

        <View style={tw`mb-6`}>
          <Text style={tw`text-gray-600 mb-2`}>Notes (Optional)</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes about this supplement"
            multiline
          />
        </View>

        <Button title="Add Supplement" onPress={handleSubmit} buttonStyle={tw`bg-blue-500`} />
      </ScrollView>
    </SafeAreaView>
  );
};
