import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Switch, Button } from 'react-native-elements';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { Supplement } from '../../types/supplement';
import tw from '../../utils/tailwind';

interface ReminderSettingsProps {
  supplement: Supplement;
  onUpdateReminders: (enabled: boolean, times: string[]) => void;
}

export const ReminderSettings: React.FC<ReminderSettingsProps> = ({
  supplement,
  onUpdateReminders,
}) => {
  const [remindersEnabled, setRemindersEnabled] = useState(supplement.remindersEnabled);
  const [reminderTimes, setReminderTimes] = useState<string[]>(supplement.reminderTimes);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number | null>(null);

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const timeString = selectedDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      if (selectedTimeIndex === null) {
        setReminderTimes([...reminderTimes, timeString]);
      } else {
        const newTimes = [...reminderTimes];
        newTimes[selectedTimeIndex] = timeString;
        setReminderTimes(newTimes);
      }
    }
  };

  const removeTime = (index: number) => {
    setReminderTimes(reminderTimes.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onUpdateReminders(remindersEnabled, reminderTimes);
  };

  return (
    <View style={tw`p-4`}>
      <View style={tw`flex-row justify-between items-center mb-6`}>
        <Text style={tw`text-lg font-semibold`}>Enable Reminders</Text>
        <Switch
          value={remindersEnabled}
          onValueChange={value => {
            setRemindersEnabled(value);
            if (!value) {
              setReminderTimes([]);
            }
          }}
        />
      </View>

      {remindersEnabled && (
        <>
          <Text style={tw`text-gray-600 mb-4`}>Reminder Times</Text>
          <ScrollView style={tw`mb-4`}>
            {reminderTimes.map((time, index) => (
              <View
                key={index}
                style={tw`flex-row justify-between items-center bg-gray-100 rounded-lg p-3 mb-2`}
              >
                <Text>{time}</Text>
                <View style={tw`flex-row`}>
                  <TouchableOpacity
                    style={tw`mr-4`}
                    onPress={() => {
                      setSelectedTimeIndex(index);
                      setShowTimePicker(true);
                    }}
                  >
                    <Text style={tw`text-blue-500`}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeTime(index)}>
                    <Text style={tw`text-red-500`}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <Button
            title="Add Reminder Time"
            type="outline"
            onPress={() => {
              setSelectedTimeIndex(null);
              setShowTimePicker(true);
            }}
            buttonStyle={tw`mb-4`}
          />

          {showTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </>
      )}

      <Button title="Save Reminder Settings" onPress={handleSave} buttonStyle={tw`bg-blue-500`} />
    </View>
  );
};
