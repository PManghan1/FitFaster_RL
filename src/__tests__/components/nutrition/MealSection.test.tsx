// Updated to provide all required props for MealSection
import { render } from '@testing-library/react-native';

import { MealSection } from '../../../components/nutrition/MealSection';

describe('MealSection', () => {
  it('renders correctly', () => {
    const mealType = 'BREAKFAST';
    const entries = [
      {
        date: new Date().toISOString(),
        id: '1',
        userId: 'user1',
        createdAt: new Date().toISOString(),
        foodId: 'food1',
        mealType: mealType,
        servingIndex: 0,
        servingAmount: 100,
        notes: 'Delicious',
      },
    ];
    const totals = { calories: 300, protein: 20, carbs: 40, fat: 10 };
    const { getByText } = render(
      <MealSection mealType={mealType} entries={entries} totals={totals} />,
    );
    expect(getByText('Meal Section')).toBeTruthy();
  });
});
