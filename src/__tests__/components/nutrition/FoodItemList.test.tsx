// Updated to provide all required props for FoodItemList
import { render } from '@testing-library/react-native';

import { FoodItemList } from '../../../components/nutrition/FoodItemList';

describe('FoodItemList', () => {
  it('renders correctly', () => {
    const items = [
      {
        id: '1',
        name: 'Apple',
        servings: [
          {
            amount: 100,
            unit: 'G',
            nutrients: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
          },
        ],
        defaultServing: 0,
        isCustom: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Banana',
        servings: [
          {
            amount: 100,
            unit: 'G',
            nutrients: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
          },
        ],
        defaultServing: 0,
        isCustom: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    const { getByText } = render(<FoodItemList items={items} />);
    expect(getByText('Food Items')).toBeTruthy();
  });
});
