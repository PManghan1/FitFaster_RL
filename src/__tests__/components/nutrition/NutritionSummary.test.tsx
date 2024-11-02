// Updated to provide all required props for NutritionSummary
import { render } from '@testing-library/react-native';

import { NutritionSummary } from '../../../components/nutrition/NutritionSummary';

describe('NutritionSummary', () => {
  it('renders correctly', () => {
    const date = new Date();
    const totals = { calories: 2000, protein: 150, carbs: 250, fat: 70 };
    const { getByText } = render(<NutritionSummary date={date} totals={totals} />);
    expect(getByText('Nutrition Summary')).toBeTruthy();
  });
});
