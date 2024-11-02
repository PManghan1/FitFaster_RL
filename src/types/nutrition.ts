export interface NutritionLogEntry {
  id: string;
  userId: string;
  type: 'meal' | 'supplement';
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  timestamp: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Nutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Serving {
  amount: number;
  unit: string;
  nutrients: Nutrients;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servings: Record<string, Serving>;
  defaultServing: string;
  createdAt: string;
  updatedAt?: string;
}
