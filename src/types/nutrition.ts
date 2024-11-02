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
