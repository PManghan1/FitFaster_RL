import React from 'react';
import { StyleSheet, Text } from 'react-native';
import styled from 'styled-components/native';

import { colors, shadows } from '../../theme';
import { Nutrients, NutritionGoal } from '../../types/nutrition';

const Container = styled.View`
  background-color: ${colors.background.default};
  border-radius: 12px;
  padding: 16px;
  margin-vertical: 8px;
  shadow-color: ${shadows.sm.shadowColor};
  shadow-offset: ${`${shadows.sm.shadowOffset.width}px ${shadows.sm.shadowOffset.height}px`};
  shadow-opacity: ${shadows.sm.shadowOpacity};
  shadow-radius: ${shadows.sm.shadowRadius}px;
  elevation: ${shadows.sm.elevation};
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const StyledTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.text.default};
`;

const StyledDate = styled.Text`
  font-size: 14px;
  color: ${colors.text.light};
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

const StyledProgressLabel = styled.Text`
  font-size: 14px;
  color: ${colors.text.default};
`;

const StyledProgressValue = styled.Text`
  font-size: 14px;
  color: ${colors.text.light};
`;

const ProgressBarContainer = styled.View`
  height: 8px;
  background-color: ${colors.background.dark};
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

const StyledMacroValue = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: ${colors.text.default};
  margin-bottom: 4px;
`;

const StyledMacroLabel = styled.Text`
  font-size: 12px;
  color: ${colors.text.light};
`;

const StyledMacroProgress = styled.Text`
  font-size: 12px;
  color: ${colors.text.light};
  margin-top: 2px;
`;

const styles = StyleSheet.create({
  additionalMacros: {
    marginTop: 16,
  },
});

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
        <StyledTitle>
          <Text>Daily Summary</Text>
        </StyledTitle>
        <StyledDate>
          <Text>{formatDate(date)}</Text>
        </StyledDate>
      </Header>

      {goal && (
        <ProgressContainer>
          <ProgressHeader>
            <StyledProgressLabel>
              <Text>Calories</Text>
            </StyledProgressLabel>
            <StyledProgressValue>
              <Text>{`${totals.calories} / ${goal.calories} kcal`}</Text>
            </StyledProgressValue>
          </ProgressHeader>
          <ProgressBarContainer>
            <ProgressBar
              progress={calculateProgress(totals.calories, goal.calories)}
              color={colors.primary.default}
              testID={`${testID}-calories-progress`}
            />
          </ProgressBarContainer>
        </ProgressContainer>
      )}

      <MacroGrid>
        <MacroItem>
          <StyledMacroValue testID={`${testID}-protein`}>
            <Text>{`${totals.protein}g`}</Text>
          </StyledMacroValue>
          <StyledMacroLabel>
            <Text>Protein</Text>
          </StyledMacroLabel>
          {goal && (
            <StyledMacroProgress>
              <Text>{formatProgress(totals.protein, goal.protein)}</Text>
            </StyledMacroProgress>
          )}
        </MacroItem>
        <MacroItem>
          <StyledMacroValue testID={`${testID}-carbs`}>
            <Text>{`${totals.carbs}g`}</Text>
          </StyledMacroValue>
          <StyledMacroLabel>
            <Text>Carbs</Text>
          </StyledMacroLabel>
          {goal && (
            <StyledMacroProgress>
              <Text>{formatProgress(totals.carbs, goal.carbs)}</Text>
            </StyledMacroProgress>
          )}
        </MacroItem>
        <MacroItem>
          <StyledMacroValue testID={`${testID}-fat`}>
            <Text>{`${totals.fat}g`}</Text>
          </StyledMacroValue>
          <StyledMacroLabel>
            <Text>Fat</Text>
          </StyledMacroLabel>
          {goal && (
            <StyledMacroProgress>
              <Text>{formatProgress(totals.fat, goal.fat)}</Text>
            </StyledMacroProgress>
          )}
        </MacroItem>
      </MacroGrid>

      {totals.fiber !== undefined && (
        <MacroGrid style={styles.additionalMacros}>
          <MacroItem>
            <StyledMacroValue testID={`${testID}-fiber`}>
              <Text>{`${totals.fiber}g`}</Text>
            </StyledMacroValue>
            <StyledMacroLabel>
              <Text>Fiber</Text>
            </StyledMacroLabel>
            {goal?.fiber && (
              <StyledMacroProgress>
                <Text>{formatProgress(totals.fiber, goal.fiber)}</Text>
              </StyledMacroProgress>
            )}
          </MacroItem>
          {totals.sugar !== undefined && (
            <MacroItem>
              <StyledMacroValue testID={`${testID}-sugar`}>
                <Text>{`${totals.sugar}g`}</Text>
              </StyledMacroValue>
              <StyledMacroLabel>
                <Text>Sugar</Text>
              </StyledMacroLabel>
            </MacroItem>
          )}
          {totals.sodium !== undefined && (
            <MacroItem>
              <StyledMacroValue testID={`${testID}-sodium`}>
                <Text>{`${totals.sodium}mg`}</Text>
              </StyledMacroValue>
              <StyledMacroLabel>
                <Text>Sodium</Text>
              </StyledMacroLabel>
            </MacroItem>
          )}
        </MacroGrid>
      )}
    </Container>
  );
};
