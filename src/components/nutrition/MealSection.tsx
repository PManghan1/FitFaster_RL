import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { Edit2, Trash2 } from 'react-native-feather';
import { MealType, MealEntry, FoodItem, Nutrients } from '../../types/nutrition';

const Container = styled.View`
  margin-vertical: 8px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
`;

const TotalCalories = styled.Text`
  font-size: 14px;
  color: #6B7280;
`;

const EntryContainer = styled.View`
  background-color: white;
  border-radius: 12px;
  margin-vertical: 4px;
  padding: 12px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
`;

const EntryHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const FoodName = styled.Text`
  font-size: 16px;
  color: #1F2937;
  flex: 1;
`;

const ActionButton = styled.TouchableOpacity`
  padding: 8px;
  margin-left: 8px;
`;

const ServingInfo = styled.Text`
  font-size: 12px;
  color: #6B7280;
  margin-top: 4px;
`;

const NutritionRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 8px;
  border-top-width: 1px;
  border-top-color: #E5E7EB;
`;

const NutritionItem = styled.View`
  align-items: center;
`;

const NutritionLabel = styled.Text`
  font-size: 12px;
  color: #6B7280;
`;

const NutritionValue = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: #1F2937;
`;

const EmptyState = styled.View`
  padding: 16px;
  background-color: #F3F4F6;
  border-radius: 12px;
  align-items: center;
`;

const EmptyStateText = styled.Text`
  font-size: 14px;
  color: #6B7280;
  text-align: center;
`;

interface MealSectionProps {
  mealType: MealType;
  entries: Array<MealEntry & { food: FoodItem }>;
  totals: Nutrients;
  onEditEntry?: (entry: MealEntry) => void;
  onDeleteEntry?: (entry: MealEntry) => void;
  testID?: string;
}

const getMealTypeLabel = (mealType: MealType): string => {
  switch (mealType) {
    case 'BREAKFAST':
      return 'Breakfast';
    case 'LUNCH':
      return 'Lunch';
    case 'DINNER':
      return 'Dinner';
    case 'SNACK':
      return 'Snack';
    default:
      return mealType;
  }
};

export const MealSection: React.FC<MealSectionProps> = ({
  mealType,
  entries,
  totals,
  onEditEntry,
  onDeleteEntry,
  testID,
}) => {
  return (
    <Container testID={testID}>
      <Header>
        <Title>{getMealTypeLabel(mealType)}</Title>
        <TotalCalories>{totals.calories} cal</TotalCalories>
      </Header>

      {entries.length === 0 ? (
        <EmptyState testID={`${testID}-empty`}>
          <EmptyStateText>No {getMealTypeLabel(mealType).toLowerCase()} entries yet</EmptyStateText>
        </EmptyState>
      ) : (
        entries.map((entry) => {
          const serving = entry.food.servings[entry.servingIndex];
          const nutrients = serving.nutrients;
          const amount = entry.servingAmount;

          return (
            <EntryContainer key={entry.id} testID={`${testID}-entry-${entry.id}`}>
              <EntryHeader>
                <FoodName>{entry.food.name}</FoodName>
                <View style={{ flexDirection: 'row' }}>
                  {onEditEntry && (
                    <ActionButton
                      onPress={() => onEditEntry(entry)}
                      testID={`${testID}-edit-${entry.id}`}
                    >
                      <Edit2 width={20} height={20} color="#3B82F6" />
                    </ActionButton>
                  )}
                  {onDeleteEntry && (
                    <ActionButton
                      onPress={() => onDeleteEntry(entry)}
                      testID={`${testID}-delete-${entry.id}`}
                    >
                      <Trash2 width={20} height={20} color="#EF4444" />
                    </ActionButton>
                  )}
                </View>
              </EntryHeader>

              <ServingInfo>
                {amount} × {serving.amount} {serving.unit.toLowerCase()}
              </ServingInfo>

              <NutritionRow>
                <NutritionItem>
                  <NutritionLabel>Calories</NutritionLabel>
                  <NutritionValue>
                    {(nutrients.calories * amount).toFixed(0)}
                  </NutritionValue>
                </NutritionItem>
                <NutritionItem>
                  <NutritionLabel>Protein</NutritionLabel>
                  <NutritionValue>
                    {(nutrients.protein * amount).toFixed(1)}g
                  </NutritionValue>
                </NutritionItem>
                <NutritionItem>
                  <NutritionLabel>Carbs</NutritionLabel>
                  <NutritionValue>
                    {(nutrients.carbs * amount).toFixed(1)}g
                  </NutritionValue>
                </NutritionItem>
                <NutritionItem>
                  <NutritionLabel>Fat</NutritionLabel>
                  <NutritionValue>
                    {(nutrients.fat * amount).toFixed(1)}g
                  </NutritionValue>
                </NutritionItem>
              </NutritionRow>
            </EntryContainer>
          );
        })
      )}
    </Container>
  );
};
