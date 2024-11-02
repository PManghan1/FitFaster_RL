import React, { useCallback, useState } from 'react';
import { Text } from 'react-native';
import { BarChart2, Clock, Hash } from 'react-native-feather';
import styled from 'styled-components/native';

import { Exercise, Set } from '../../types/workout';

const Container = styled.View`
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-vertical: 8px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
`;

const Title = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
`;

const InputRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const InputContainer = styled.View`
  flex: 1;
  margin-horizontal: 4px;
`;

const InputLabel = styled.Text`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const Input = styled.TextInput`
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 16px;
  color: #1f2937;
`;

const IconContainer = styled.View`
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
  margin-right: 8px;
`;

const SaveButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${props => (props.disabled ? '#E5E7EB' : '#3B82F6')};
  border-radius: 8px;
  padding: 12px;
  align-items: center;
  margin-top: 8px;
`;

const SaveButtonText = styled.Text<{ disabled?: boolean }>`
  color: ${props => (props.disabled ? '#9CA3AF' : 'white')};
  font-weight: 600;
  font-size: 14px;
`;

interface SetInputProps {
  exercise: Exercise;
  onSave: (set: Omit<Set, 'id' | 'exerciseId' | 'completed'>) => void;
  testID?: string;
}

export const SetInput: React.FC<SetInputProps> = ({ exercise, onSave, testID }) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');

  const isStrengthExercise = exercise.type === 'STRENGTH';

  const handleSave = useCallback(() => {
    const set: Omit<Set, 'id' | 'exerciseId' | 'completed'> = {
      notes,
      ...(isStrengthExercise
        ? {
            weight: weight ? parseFloat(weight) : undefined,
            reps: reps ? parseInt(reps, 10) : undefined,
          }
        : {
            duration: duration ? parseInt(duration, 10) : undefined,
            distance: distance ? parseFloat(distance) : undefined,
          }),
    };

    onSave(set);
    setWeight('');
    setReps('');
    setDuration('');
    setDistance('');
    setNotes('');
  }, [weight, reps, duration, distance, notes, isStrengthExercise, onSave]);

  const isValid = isStrengthExercise
    ? weight !== '' || reps !== ''
    : duration !== '' || distance !== '';

  return (
    <Container testID={testID}>
      <Title>
        <Text>Record Set</Text>
      </Title>

      {isStrengthExercise ? (
        <>
          <InputRow>
            <IconContainer>
              <BarChart2 width={20} height={20} color="#6B7280" />
            </IconContainer>
            <InputContainer>
              <InputLabel>
                <Text>Weight (kg)</Text>
              </InputLabel>
              <Input
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="0.0"
                testID={`${testID}-weight`}
              />
            </InputContainer>
            <IconContainer>
              <Hash width={20} height={20} color="#6B7280" />
            </IconContainer>
            <InputContainer>
              <InputLabel>
                <Text>Reps</Text>
              </InputLabel>
              <Input
                value={reps}
                onChangeText={setReps}
                keyboardType="number-pad"
                placeholder="0"
                testID={`${testID}-reps`}
              />
            </InputContainer>
          </InputRow>
        </>
      ) : (
        <>
          <InputRow>
            <IconContainer>
              <Clock width={20} height={20} color="#6B7280" />
            </IconContainer>
            <InputContainer>
              <InputLabel>
                <Text>Duration (seconds)</Text>
              </InputLabel>
              <Input
                value={duration}
                onChangeText={setDuration}
                keyboardType="number-pad"
                placeholder="0"
                testID={`${testID}-duration`}
              />
            </InputContainer>
            <InputContainer>
              <InputLabel>
                <Text>Distance (meters)</Text>
              </InputLabel>
              <Input
                value={distance}
                onChangeText={setDistance}
                keyboardType="decimal-pad"
                placeholder="0.0"
                testID={`${testID}-distance`}
              />
            </InputContainer>
          </InputRow>
        </>
      )}

      <InputContainer>
        <InputLabel>
          <Text>Notes (optional)</Text>
        </InputLabel>
        <Input
          value={notes}
          onChangeText={setNotes}
          placeholder="Add notes..."
          multiline
          numberOfLines={2}
          testID={`${testID}-notes`}
        />
      </InputContainer>

      <SaveButton onPress={handleSave} disabled={!isValid} testID={`${testID}-save`}>
        <SaveButtonText disabled={!isValid}>
          <Text>Save Set</Text>
        </SaveButtonText>
      </SaveButton>
    </Container>
  );
};
