import React, { useState } from 'react';
import { TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Eye, EyeOff, Lock, AlertTriangle } from 'react-native-feather';
import { z } from 'zod';

const Container = styled.View`
  margin-bottom: 16px;
`;

const LabelContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const Label = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const SensitivityBadge = styled.View<{ color: string }>`
  flex-direction: row;
  align-items: center;
  padding: 4px 8px;
  border-radius: 16px;
  background-color: ${props => `${props.color}20`};
`;

const SensitivityText = styled.Text<{ color: string }>`
  margin-left: 4px;
  font-size: 12px;
  color: ${props => props.color};
`;

const InputContainer = styled.View<{ isFocused: boolean; hasError: boolean }>`
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-radius: 8px;
  padding: 8px 12px;
  border-color: ${props => 
    props.hasError ? '#EF4444' : 
    props.isFocused ? '#3B82F6' : 
    '#D1D5DB'
  };
`;

const StyledTextInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: #1F2937;
`;

const ErrorContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
`;

const ErrorText = styled.Text`
  margin-left: 4px;
  font-size: 12px;
  color: #EF4444;
`;

const InfoText = styled.Text`
  margin-top: 4px;
  font-size: 12px;
  color: #6B7280;
`;

interface SecureInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  sensitivityLevel: 'low' | 'medium' | 'high';
  validation?: z.ZodType<any>;
  secureTextEntry?: boolean;
  placeholder?: string;
  infoText?: string;
  testID?: string;
}

export const SecureInput: React.FC<SecureInputProps> = ({
  label,
  value,
  onChangeText,
  sensitivityLevel,
  validation,
  secureTextEntry,
  placeholder,
  infoText,
  testID,
}) => {
  const [isSecureVisible, setIsSecureVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const sensitivityColors = {
    low: '#4CAF50',    // Green
    medium: '#FFC107', // Yellow
    high: '#F44336',   // Red
  };

  const handleChangeText = (text: string) => {
    onChangeText(text);
    if (validation) {
      try {
        validation.parse(text);
        setError(null);
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError(err.errors[0].message);
        }
      }
    }
  };

  return (
    <Container>
      <LabelContainer>
        <Label>{label}</Label>
        <SensitivityBadge color={sensitivityColors[sensitivityLevel]}>
          <Lock 
            width={12} 
            height={12} 
            color={sensitivityColors[sensitivityLevel]} 
          />
          <SensitivityText color={sensitivityColors[sensitivityLevel]}>
            {sensitivityLevel.charAt(0).toUpperCase() + sensitivityLevel.slice(1)} Sensitivity
          </SensitivityText>
        </SensitivityBadge>
      </LabelContainer>

      <InputContainer isFocused={isFocused} hasError={!!error}>
        <StyledTextInput
          value={value}
          onChangeText={handleChangeText}
          secureTextEntry={secureTextEntry && !isSecureVisible}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          testID={testID}
          placeholderTextColor="#9CA3AF"
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecureVisible(!isSecureVisible)}
            testID={`${testID}-toggle-visibility`}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isSecureVisible ? (
              <EyeOff width={20} height={20} color="#6B7280" />
            ) : (
              <Eye width={20} height={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        )}
      </InputContainer>

      {error && (
        <ErrorContainer>
          <AlertTriangle width={12} height={12} color="#EF4444" />
          <ErrorText>{error}</ErrorText>
        </ErrorContainer>
      )}

      {infoText && !error && (
        <InfoText>{infoText}</InfoText>
      )}
    </Container>
  );
};
