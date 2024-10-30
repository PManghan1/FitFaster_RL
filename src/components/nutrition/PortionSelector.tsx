import React, { useState } from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { Minus, Plus } from 'react-native-feather';
import { FoodItem } from '../../types/nutrition';

const Container = styled.View`
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-vertical: 8px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
`;

const ServingInfo = styled.Text`
  font-size: 14px;
  color: #6B7280;
`;

const ControlsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const PortionControl = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ControlButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: ${props => props.disabled ? '#E5E7EB' : '#3B82F6'};
  justify-content: center;
  align-items: center;
`;

const PortionInput = styled.TextInput`
  min-width: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: 500;
  color: #1F2937;
  margin-horizontal: 12px;
`;

const NutritionGrid = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding-top: 16px;
  border-top-width: 1px;
  border-top-color: #E5E7EB;
`;

const NutritionItem = styled.View`
  align-items: center;
`;

const NutritionLabel = styled.Text`
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 4px;
`;

const NutritionValue = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: #1F2937;
`;

interface PortionSelectorProps {
  foodItem: FoodItem;
  onChange: (portions: number) => void;
  initialPortions?: number;
  minPortions?: number;
  maxPortions?: number;
  step?: number;
  testID?: string;
}

export const PortionSelector: React.FC<PortionSelectorProps> = ({
  foodItem,
  onChange,
  initialPortions = 1,
  minPortions = 0.25,
  maxPortions = 10,
  step = 0.25,
  testID,
}) => {
  const [portions, setPortions] = useState(initialPortions);
  const defaultServing = foodItem.servings[foodItem.defaultServing];
  const nutrients = defaultServing.nutrients;

  const handleIncrease = () => {
    const newValue = Math.min(portions + step, maxPortions);
    setPortions(newValue);
    onChange(newValue);
  };

  const handleDecrease = () => {
    const newValue = Math.max(portions - step, minPortions);
    setPortions(newValue);
    onChange(newValue);
  };

  const handleInputChange = (text: string) => {
    const value = parseFloat(text);
    if (!isNaN(value)) {
      const newValue = Math.min(Math.max(value, minPortions), maxPortions);
      setPortions(newValue);
      onChange(newValue);
    }
  };

  const calculateNutrition = (value: number): number => {
    return parseFloat((value * portions).toFixed(1));
  };

  return (
    <Container testID={testID}>
      <Header>
        <Title>Portion Size</Title>
        <ServingInfo>
          {defaultServing.amount} {defaultServing.unit.toLowerCase()} per serving
        </ServingInfo>
      </Header>

      <ControlsContainer>
        <PortionControl>
          <ControlButton
            onPress={handleDecrease}
            disabled={portions <= minPortions}
            testID={`${testID}-decrease`}
          >
            <Minus
              width={20}
              height={20}
              color={portions <= minPortions ? '#9CA3AF' : 'white'}
            />
          </ControlButton>

          <PortionInput
            value={portions.toString()}
            onChangeText={handleInputChange}
            keyboardType="decimal-pad"
            selectTextOnFocus
            testID={`${testID}-input`}
          />

          <ControlButton
            onPress={handleIncrease}
            disabled={portions >= maxPortions}
            testID={`${testID}-increase`}
          >
            <Plus
              width={20}
              height={20}
              color={portions >= maxPortions ? '#9CA3AF' : 'white'}
            />
          </ControlButton>
        </PortionControl>

        <ServingInfo>
          = {calculateNutrition(defaultServing.amount)} {defaultServing.unit.toLowerCase()}
        </ServingInfo>
      </ControlsContainer>

      <NutritionGrid>
        <NutritionItem>
          <NutritionLabel>Calories</NutritionLabel>
          <NutritionValue testID={`${testID}-calories`}>
            {calculateNutrition(nutrients.calories)}
          </NutritionValue>
        </NutritionItem>
        <NutritionItem>
          <NutritionLabel>Protein</NutritionLabel>
          <NutritionValue testID={`${testID}-protein`}>
            {calculateNutrition(nutrients.protein)}g
          </NutritionValue>
        </NutritionItem>
        <NutritionItem>
          <NutritionLabel>Carbs</NutritionLabel>
          <NutritionValue testID={`${testID}-carbs`}>
            {calculateNutrition(nutrients.carbs)}g
          </NutritionValue>
        </NutritionItem>
        <NutritionItem>
          <NutritionLabel>Fat</NutritionLabel>
          <NutritionValue testID={`${testID}-fat`}>
            {calculateNutrition(nutrients.fat)}g
          </NutritionValue>
        </NutritionItem>
      </NutritionGrid>
    </Container>
  );
};
