import React from 'react';
import { View, TouchableOpacity, ActivityIndicator, FlatList, ListRenderItem } from 'react-native';
import styled from 'styled-components/native';
import { Heart, Plus } from 'react-native-feather';
import { FoodItem } from '../../types/nutrition';

const Container = styled.View`
  flex: 1;
`;

const ItemContainer = styled.View`
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

const ItemHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const ItemTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  flex: 1;
  margin-right: 8px;
`;

const Brand = styled.Text`
  font-size: 12px;
  color: #6B7280;
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
  color: #6B7280;
`;

const NutritionValue = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: #1F2937;
`;

const ServingInfo = styled.Text`
  font-size: 12px;
  color: #6B7280;
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
  color: #6B7280;
  text-align: center;
  margin-top: 12px;
`;

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
  const renderItem: ListRenderItem<FoodItem> = React.useCallback(({ item }) => {
    const defaultServing = item.servings[item.defaultServing];
    const nutrients = defaultServing.nutrients;

    return (
      <ItemContainer testID={`${testID}-item-${item.id}`}>
        <ItemHeader>
          <ItemTitle numberOfLines={1}>{item.name}</ItemTitle>
          <View style={{ flexDirection: 'row' }}>
            {onToggleFavorite && (
              <ActionButton
                onPress={() => onToggleFavorite(item)}
                testID={`${testID}-favorite-${item.id}`}
              >
                <Heart
                  width={20}
                  height={20}
                  color={favorites.has(item.id) ? '#EF4444' : '#9CA3AF'}
                  fill={favorites.has(item.id) ? '#EF4444' : 'none'}
                />
              </ActionButton>
            )}
            {onAddItem && (
              <ActionButton
                onPress={() => onAddItem(item)}
                testID={`${testID}-add-${item.id}`}
              >
                <Plus width={20} height={20} color="#3B82F6" />
              </ActionButton>
            )}
          </View>
        </ItemHeader>

        {item.brand && <Brand>{item.brand}</Brand>}

        <NutritionRow>
          <NutritionItem>
            <NutritionLabel>Calories</NutritionLabel>
            <NutritionValue>{nutrients.calories}</NutritionValue>
          </NutritionItem>
          <NutritionItem>
            <NutritionLabel>Protein</NutritionLabel>
            <NutritionValue>{nutrients.protein}g</NutritionValue>
          </NutritionItem>
          <NutritionItem>
            <NutritionLabel>Carbs</NutritionLabel>
            <NutritionValue>{nutrients.carbs}g</NutritionValue>
          </NutritionItem>
          <NutritionItem>
            <NutritionLabel>Fat</NutritionLabel>
            <NutritionValue>{nutrients.fat}g</NutritionValue>
          </NutritionItem>
        </NutritionRow>

        <ServingInfo>
          Per {defaultServing.amount} {defaultServing.unit.toLowerCase()}
        </ServingInfo>
      </ItemContainer>
    );
  }, [favorites, onAddItem, onToggleFavorite, testID]);

  if (isLoading) {
    return (
      <EmptyState testID={`${testID}-loading`}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </EmptyState>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState testID={`${testID}-empty`}>
        <EmptyStateText>{emptyMessage}</EmptyStateText>
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
        contentContainerStyle={{ padding: 8 }}
      />
    </Container>
  );
};
