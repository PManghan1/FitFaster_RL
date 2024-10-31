import React from 'react';
import { ActivityIndicator, FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native';
import { Heart, Plus } from 'react-native-feather';
import styled from 'styled-components/native';

import { colors, shadows } from '../../theme';
import { FoodItem } from '../../types/nutrition';

const Container = styled.View`
  flex: 1;
`;

const ItemContainer = styled.View`
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

const ItemHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const ItemTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.text.default};
  flex: 1;
  margin-right: 8px;
`;

const Brand = styled.Text`
  font-size: 12px;
  color: ${colors.text.light};
  margin-bottom: 8px;
`;

const NutritionRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 4px;
`;

const NutritionItem = styled.View`
  align-items: center;
`;

const NutritionLabel = styled.Text`
  font-size: 12px;
  color: ${colors.text.light};
`;

const NutritionValue = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${colors.text.default};
`;

const ServingInfo = styled.Text`
  font-size: 12px;
  color: ${colors.text.light};
  font-style: italic;
  margin-top: 8px;
`;

const ActionButton = styled.TouchableOpacity`
  padding: 8px;
  margin-left: 8px;
`;

const EmptyState = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const EmptyStateText = styled.Text`
  font-size: 16px;
  color: ${colors.text.light};
  text-align: center;
  margin-top: 12px;
`;

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
  },
  listContent: {
    padding: 8,
  },
});

interface FoodItemListProps {
  items: FoodItem[];
  isLoading?: boolean;
  onAddItem?: (item: FoodItem) => void;
  onToggleFavorite?: (item: FoodItem) => void;
  favorites?: Set<string>;
  emptyMessage?: string;
  testID?: string;
}

export const FoodItemList: React.FC<FoodItemListProps> = ({
  items,
  isLoading,
  onAddItem,
  onToggleFavorite,
  favorites = new Set(),
  emptyMessage = 'No items found',
  testID,
}) => {
  const renderItem: ListRenderItem<FoodItem> = React.useCallback(
    ({ item }) => {
      const defaultServing = item.servings[item.defaultServing];
      const nutrients = defaultServing.nutrients;

      return (
        <ItemContainer testID={`${testID}-item-${item.id}`}>
          <ItemHeader>
            <ItemTitle numberOfLines={1}>{item.name}</ItemTitle>
            <View style={styles.actionRow}>
              {onToggleFavorite && (
                <ActionButton
                  onPress={() => onToggleFavorite(item)}
                  testID={`${testID}-favorite-${item.id}`}
                >
                  <Heart
                    width={20}
                    height={20}
                    color={favorites.has(item.id) ? colors.error.default : colors.border.dark}
                    fill={favorites.has(item.id) ? colors.error.default : 'none'}
                  />
                </ActionButton>
              )}
              {onAddItem && (
                <ActionButton onPress={() => onAddItem(item)} testID={`${testID}-add-${item.id}`}>
                  <Plus width={20} height={20} color={colors.primary.default} />
                </ActionButton>
              )}
            </View>
          </ItemHeader>

          {item.brand && <Brand>{item.brand}</Brand>}

          <NutritionRow>
            <NutritionItem>
              <NutritionLabel>
                <Text>Calories</Text>
              </NutritionLabel>
              <NutritionValue>
                <Text>{nutrients.calories}</Text>
              </NutritionValue>
            </NutritionItem>
            <NutritionItem>
              <NutritionLabel>
                <Text>Protein</Text>
              </NutritionLabel>
              <NutritionValue>
                <Text>{nutrients.protein}g</Text>
              </NutritionValue>
            </NutritionItem>
            <NutritionItem>
              <NutritionLabel>
                <Text>Carbs</Text>
              </NutritionLabel>
              <NutritionValue>
                <Text>{nutrients.carbs}g</Text>
              </NutritionValue>
            </NutritionItem>
            <NutritionItem>
              <NutritionLabel>
                <Text>Fat</Text>
              </NutritionLabel>
              <NutritionValue>
                <Text>{nutrients.fat}g</Text>
              </NutritionValue>
            </NutritionItem>
          </NutritionRow>

          <ServingInfo>
            <Text>
              Per {defaultServing.amount} {defaultServing.unit.toLowerCase()}
            </Text>
          </ServingInfo>
        </ItemContainer>
      );
    },
    [favorites, onAddItem, onToggleFavorite, testID],
  );

  if (isLoading) {
    return (
      <EmptyState testID={`${testID}-loading`}>
        <ActivityIndicator size="large" color={colors.primary.default} />
      </EmptyState>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState testID={`${testID}-empty`}>
        <EmptyStateText>
          <Text>{emptyMessage}</Text>
        </EmptyStateText>
      </EmptyState>
    );
  }

  return (
    <Container testID={testID}>
      <FlatList<FoodItem>
        data={items}
        renderItem={renderItem}
        keyExtractor={(item: FoodItem) => item.id}
        showsVerticalScrollIndicator={false}
        testID={`${testID}-list`}
        contentContainerStyle={styles.listContent}
      />
    </Container>
  );
};
