import React, { useEffect, useCallback } from 'react';
import { View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Play, Pause, RotateCcw } from 'react-native-feather';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { useWorkoutStore } from '../../store/workout.store';

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
  align-items: center;
`;

const TimeDisplay = styled.Text`
  font-size: 48px;
  font-weight: bold;
  color: #1F2937;
  margin-vertical: 16px;
`;

const Label = styled.Text`
  font-size: 16px;
  color: #6B7280;
  margin-bottom: 8px;
`;

const Controls = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
`;

const ControlButton = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' }>`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${props => props.variant === 'primary' ? '#3B82F6' : '#E5E7EB'};
  justify-content: center;
  align-items: center;
  margin-horizontal: 8px;
`;

const PresetButton = styled.TouchableOpacity<{ isSelected?: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  background-color: ${props => props.isSelected ? '#3B82F6' : '#E5E7EB'};
  margin-horizontal: 4px;
`;

const PresetText = styled.Text<{ isSelected?: boolean }>`
  color: ${props => props.isSelected ? 'white' : '#4B5563'};
  font-weight: ${props => props.isSelected ? '600' : '400'};
`;

const PresetContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: 16px;
`;

interface WorkoutTimerProps {
  initialTime?: number;
  onComplete?: () => void;
  presets?: number[];
  label?: string;
  testID?: string;
}

export const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  initialTime = 60,
  onComplete,
  presets = [30, 60, 90, 120],
  label = 'Rest Timer',
  testID,
}) => {
  const { restTimer, startRestTimer, stopRestTimer } = useWorkoutStore();
  const [isActive, setIsActive] = React.useState(false);

  useEffect(() => {
    return () => {
      stopRestTimer();
      deactivateKeepAwake();
    };
  }, []);

  useEffect(() => {
    if (restTimer === 0) {
      handleComplete();
    }
  }, [restTimer]);

  const handleStart = useCallback(() => {
    setIsActive(true);
    activateKeepAwake();
    startRestTimer(restTimer || initialTime);
  }, [initialTime, startRestTimer]);

  const handlePause = useCallback(() => {
    setIsActive(false);
    deactivateKeepAwake();
    stopRestTimer();
  }, [stopRestTimer]);

  const handleReset = useCallback(() => {
    setIsActive(false);
    deactivateKeepAwake();
    stopRestTimer();
    startRestTimer(initialTime);
  }, [initialTime, startRestTimer, stopRestTimer]);

  const handleComplete = useCallback(() => {
    setIsActive(false);
    deactivateKeepAwake();
    stopRestTimer();
    onComplete?.();
  }, [onComplete, stopRestTimer]);

  const handlePresetSelect = useCallback((time: number) => {
    stopRestTimer();
    startRestTimer(time);
    setIsActive(true);
    activateKeepAwake();
  }, [startRestTimer, stopRestTimer]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container testID={testID}>
      <Label>{label}</Label>
      <TimeDisplay testID={`${testID}-display`}>
        {formatTime(restTimer || initialTime)}
      </TimeDisplay>

      <Controls>
        <ControlButton
          onPress={handleReset}
          variant="secondary"
          testID={`${testID}-reset`}
        >
          <RotateCcw width={24} height={24} color="#4B5563" />
        </ControlButton>

        <ControlButton
          onPress={isActive ? handlePause : handleStart}
          variant="primary"
          testID={`${testID}-toggle`}
        >
          {isActive ? (
            <Pause width={24} height={24} color="white" />
          ) : (
            <Play width={24} height={24} color="white" />
          )}
        </ControlButton>
      </Controls>

      <PresetContainer>
        {presets.map((preset) => (
          <PresetButton
            key={preset}
            onPress={() => handlePresetSelect(preset)}
            isSelected={restTimer === preset}
            testID={`${testID}-preset-${preset}`}
          >
            <PresetText isSelected={restTimer === preset}>
              {formatTime(preset)}
            </PresetText>
          </PresetButton>
        ))}
      </PresetContainer>
    </Container>
  );
};
