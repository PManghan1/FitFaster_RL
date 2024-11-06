import React, { useState, useRef, useEffect } from 'react';
import { View, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Text, Input, Button } from 'react-native-elements';
import type { Supplement } from '../../types/supplement';
import tw from '../../utils/tailwind';

interface IntakeLogModalProps {
  visible: boolean;
  supplement: Supplement;
  onClose: () => void;
  onLog: (dosage: number, notes?: string) => void;
}

export const IntakeLogModal: React.FC<IntakeLogModalProps> = ({
  visible,
  supplement,
  onClose,
  onLog,
}) => {
  const [dosage, setDosage] = useState(supplement.dosage.toString());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dosageInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => dosageInputRef.current?.focus(), 100);
    }
  }, [visible]);

  const handleSubmit = () => {
    const dosageNum = parseFloat(dosage);
    if (isNaN(dosageNum) || dosageNum <= 0) {
      setError('Please enter a valid dosage amount');
      return;
    }
    setError(null);
    onLog(dosageNum, notes.trim() || undefined);
    setDosage(supplement.dosage.toString());
    setNotes('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessible={true}
      accessibilityViewIsModal={true}
      accessibilityLabel="Log supplement intake"
    >
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
        <View style={tw`bg-white rounded-lg p-6 w-[90%] max-w-md`}>
          <Text style={tw`text-xl font-bold mb-4`} accessibilityRole="header">
            Log Supplement Intake
          </Text>
          <Text style={tw`text-lg mb-4`}>{supplement.name}</Text>

          <View style={tw`mb-4`}>
            <Text style={tw`text-gray-600 mb-2`}>Dosage ({supplement.unit})</Text>
            <Input
              ref={dosageInputRef}
              value={dosage}
              onChangeText={setDosage}
              keyboardType="numeric"
              placeholder={`Enter dosage in ${supplement.unit}`}
              accessibilityLabel={`Dosage in ${supplement.unit}`}
              accessibilityHint="Enter the amount you're taking"
              errorMessage={error}
              errorStyle={tw`text-red-500`}
            />
          </View>

          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-600 mb-2`}>Notes (Optional)</Text>
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes about this intake"
              multiline
              accessibilityLabel="Notes about this intake"
              accessibilityHint="Optional: Add any additional information"
            />
          </View>

          <View style={tw`flex-row justify-end`}>
            <TouchableOpacity
              style={tw`mr-4 py-2 px-4 min-h-[44px] justify-center`}
              onPress={onClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel logging intake"
              accessibilityHint="Closes the form without saving"
            >
              <Text style={tw`text-gray-600`}>Cancel</Text>
            </TouchableOpacity>
            <Button
              title="Log Intake"
              onPress={handleSubmit}
              buttonStyle={tw`bg-blue-500 min-h-[44px]`}
              accessibilityLabel="Submit intake log"
              accessibilityHint="Saves the intake record"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
