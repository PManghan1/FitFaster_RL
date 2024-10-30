import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { Nutrients, NutritionGoal } from '../../types/nutrition';

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

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
`;

const Date = styled.Text`
  font-size: 14px;
  color: #6B7280;
`;

const ProgressContainer = styled.View`
  margin-bottom: 16px;
`;

const ProgressHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
`;

const ProgressLabel = styled.Text`
  font-size: 14px;
  color: #374151;
`;

const ProgressValue = styled.Text`
  font-size: 14px;
  color: #6B7280;
`;

const ProgressBarContainer = styled.View`
  height: 8px;
  background-color: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBar = styled.View<{ progress: number; color: string }>`
  height: 100%;
  width: ${props => Math.min(Math.max(props.progress, 0), 100)}%;
  background-color: ${props => props.color};
  border-radius: 4px;
`;

const MacroGrid = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const MacroItem = styled.View`
  align-items: center;
  flex: 1;
`;

const MacroValue = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4px;
`;

const MacroLabel = styled.Text`
  font-size: 12px;
  color: #6B7280;
`;

const MacroProgress = styled.Text`
  font-size: 12px;
  color: #6B7280;
  margin-top: 2px;
`;

interface NutritionSummaryProps {
  date: Date;
  totals: Nutrients;
  goal?: NutritionGoal;
  testID?: string;
}

export const NutritionSummary: React.FC<NutritionSummaryProps> = ({
  date,
  totals,
  goal,
  testID,
}) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateProgress = (current: number, target: number): number => {
    if (!target) return 0;
    return (current / target) * 100;
  };

  const formatProgress = (current: number, target: number): string => {
    if (!target) return '-';
    return `${Math.round((current / target) * 100)}%`;
  };

  return (
    <Container testID={testID}>
      <Header>
        <Title>Daily Summary</Title>
        <Date>{formatDate(date)}</Date>
      </Header>

      {goal && (
        <ProgressContainer>
          <ProgressHeader>
            <ProgressLabel>Calories</ProgressLabel>
            <ProgressValue>
              {totals.calories} / {goal.calories} kcal
            </ProgressValue>
          </ProgressHeader>
          <ProgressBarContainer>
            <ProgressBar
              progress={calculateProgress(totals.calories, goal.calories)}
              color="#3B82F6"
              testID={`${testID}-calories-progress`}
            />
          </ProgressBarContainer>
        </ProgressContainer>
      )}

      <MacroGrid>
        <MacroItem>
          <MacroValue testID={`${testID}-protein`}>{totals.protein}g</MacroValue>
          <MacroLabel>Protein</MacroLabel>
          {goal && (
            <MacroProgress>
              {formatProgress(totals.protein, goal.protein)}
            </MacroProgress>
          )}
        </MacroItem>
        <MacroItem>
          <MacroValue testID={`${testID}-carbs`}>{totals.carbs}g</MacroValue>
          <MacroLabel>Carbs</MacroLabel>
          {goal && (
            <MacroProgress>
              {formatProgress(totals.carbs, goal.carbs)}
            </MacroProgress>
          )}
        </MacroItem>
        <MacroItem>
          <MacroValue testID={`${testID}-fat`}>{totals.fat}g</MacroValue>
          <MacroLabel>Fat</MacroLabel>
          {goal && (
            <MacroProgress>
              {formatProgress(totals.fat, goal.fat)}
            </MacroProgress>
          )}
        </MacroItem>
      </MacroGrid>

      {totals.fiber !== undefined && (
        <MacroGrid style={{ marginTop: 16 }}>
          <MacroItem>
            <MacroValue testID={`${testID}-fiber`}>{totals.fiber}g</MacroValue>
            <MacroLabel>Fiber</MacroLabel>
            {goal?.fiber && (
              <MacroProgress>
                {formatProgress(totals.fiber, goal.fiber)}
              </MacroProgress>
            )}
          </MacroItem>
          {totals.sugar !== undefined && (
            <MacroItem>
              <MacroValue testID={`${testID}-sugar`}>{totals.sugar}g</MacroValue>
              <MacroLabel>Sugar</MacroLabel>
            </MacroItem>
          )}
          {totals.sodium !== undefined && (
            <MacroItem>
              <MacroValue testID={`${testID}-sodium`}>{totals.sodium}mg</MacroValue>
              <MacroLabel>Sodium</MacroLabel>
            </MacroItem>
          )}
        </MacroGrid>
      )}
    </Container>
  );
};
