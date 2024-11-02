import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Edit2, Trash2 } from 'react-native-feather';
import styled from 'styled-components/native';

import { colors, shadows } from '../../theme';
import { FoodItem, MealEntry, MealType, Nutrients } from '../../types/nutrition';

const Container = styled.View`
  margin-vertical: 8px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const StyledTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.text.default};
`;

const StyledTotalCalories = styled.Text`
  font-size: 14px;
  color: ${colors.text.light};
`;

const EntryContainer = styled.View`
  background-color: ${colors.background.default};
  border-radius: 12px;
  margin-vertical: 4px;
  padding: 12px;
  shadow-color: ${shadows.sm.shadowColor};
  shadow-offset: ${`${shadows.sm.shadowOffset.width}px ${shadows.sm.shadowOffset.height}px`};
  shadow-opacity: ${shadows.sm.shadowOpacity};
  shadow-radius: ${shadows.sm.shadowRadius}px;
  elevation: ${shadows.sm.elevation};
`;

const EntryHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const StyledFoodName = styled.Text`
  font-size: 16px;
  color: ${colors.text.default};
  flex: 1;
`;

const ActionButton = styled.TouchableOpacity`
  padding: 8px;
  margin-left: 8px;
`;

const StyledServingInfo = styled.Text`
  font-size: 12px;
  color: ${colors.text.light};
  margin-top: 4px;
`;

const NutritionRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 8px;
  border-top-width: 1px;
  border-top-color: ${colors.border.light};
`;

const NutritionItem = styled.View`
  align-items: center;
`;

const StyledNutritionLabel = styled.Text`
  font-size: 12px;
  color: ${colors.text.light};
`;

const StyledNutritionValue = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${colors.text.default};
`;

const EmptyState = styled.View`
  padding: 16px;
  background-color: ${colors.background.light};
  border-radius: 12px;
  align-items: center;
`;

const StyledEmptyStateText = styled.Text`
  font-size: 14px;
  color: ${colors.text.light};
  text-align: center;
`;

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
  },
});

interface MealSectionProps {
  mealType: MealType;
  entries: (MealEntry & { food: FoodItem })[];
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
        <StyledTitle>
          <Text>{getMealTypeLabel(mealType)}</Text>
        </StyledTitle>
        <StyledTotalCalories>
          <Text>{totals.calories} cal</Text>
        </StyledTotalCalories>
      </Header>

      {entries.length === 0 ? (
        <EmptyState testID={`${testID}-empty`}>
          <StyledEmptyStateText>
            <Text>No {getMealTypeLabel(mealType).toLowerCase()} entries yet</Text>
          </StyledEmptyStateText>
        </EmptyState>
      ) : (
        entries.map(entry => {
          const serving = entry.food.servings[entry.servingIndex];
          const nutrients = serving.nutrients;
          const amount = entry.servingAmount;

          return (
            <EntryContainer key={entry.id} testID={`${testID}-entry-${entry.id}`}>
              <EntryHeader>
                <StyledFoodName>
                  <Text>{entry.food.name}</Text>
                </StyledFoodName>
                <View style={styles.actionRow}>
                  {onEditEntry && (
                    <ActionButton
                      onPress={() => onEditEntry(entry)}
                      testID={`${testID}-edit-${entry.id}`}
                    >
                      <Edit2 width={20} height={20} color={colors.primary.default} />
                    </ActionButton>
                  )}
                  {onDeleteEntry && (
                    <ActionButton
                      onPress={() => onDeleteEntry(entry)}
                      testID={`${testID}-delete-${entry.id}`}
                    >
                      <Trash2 width={20} height={20} color={colors.error.default} />
                    </ActionButton>
                  )}
                </View>
              </EntryHeader>

              <StyledServingInfo>
                <Text>
                  {amount} × {serving.amount} {serving.unit.toLowerCase()}
                </Text>
              </StyledServingInfo>

              <NutritionRow>
                <NutritionItem>
                  <StyledNutritionLabel>
                    <Text>Calories</Text>
                  </StyledNutritionLabel>
                  <StyledNutritionValue>
                    <Text>{(nutrients.calories * amount).toFixed(0)}</Text>
                  </StyledNutritionValue>
                </NutritionItem>
                <NutritionItem>
                  <StyledNutritionLabel>
                    <Text>Protein</Text>
                  </StyledNutritionLabel>
                  <StyledNutritionValue>
                    <Text>{(nutrients.protein * amount).toFixed(1)}g</Text>
                  </StyledNutritionValue>
                </NutritionItem>
                <NutritionItem>
                  <StyledNutritionLabel>
                    <Text>Carbs</Text>
                  </StyledNutritionLabel>
                  <StyledNutritionValue>
                    <Text>{(nutrients.carbs * amount).toFixed(1)}g</Text>
                  </StyledNutritionValue>
                </NutritionItem>
                <NutritionItem>
                  <StyledNutritionLabel>
                    <Text>Fat</Text>
                  </StyledNutritionLabel>
                  <StyledNutritionValue>
                    <Text>{(nutrients.fat * amount).toFixed(1)}g</Text>
                  </StyledNutritionValue>
                </NutritionItem>
              </NutritionRow>
            </EntryContainer>
          );
        })
      )}
    </Container>
  );
};
