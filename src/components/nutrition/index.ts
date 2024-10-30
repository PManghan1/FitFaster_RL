export * from './FoodItemList';
export * from './MealSection';
export * from './NutritionSummary';
export * from './PortionSelector';
export * from './FoodSearchInput';

// Re-export presets for easy access
export { SEARCH_PRESETS } from './FoodSearchInput';

// Example usage of nutrition components:
/*
import {
  FoodItemList,
  MealSection,
  NutritionSummary,
  PortionSelector,
  FoodSearchInput,
  SEARCH_PRESETS,
} from '@/components/nutrition';

// Using FoodSearchInput with presets
<FoodSearchInput
  {...SEARCH_PRESETS.FOOD_DATABASE}
  onSearch={handleSearch}
  isLoading={isSearching}
/>

// Using FoodItemList
<FoodItemList
  items={foodItems}
  onAddItem={handleAddItem}
  onToggleFavorite={handleToggleFavorite}
  favorites={favoriteIds}
/>

// Using MealSection
<MealSection
  mealType="BREAKFAST"
  entries={breakfastEntries}
  totals={breakfastTotals}
  onEditEntry={handleEditEntry}
  onDeleteEntry={handleDeleteEntry}
/>

// Using NutritionSummary
<NutritionSummary
  date={currentDate}
  totals={dailyTotals}
  goals={nutritionGoals}
/>

// Using PortionSelector
<PortionSelector
  foodItem={selectedFood}
  onChange={handlePortionChange}
  initialPortions={1}
/>
*/
