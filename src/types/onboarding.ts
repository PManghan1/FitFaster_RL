export type UnitSystem = 'metric' | 'imperial';

export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' | 'other';

export interface BasicUserInfo {
  name: string;
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  unitSystem: UnitSystem;
}

export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  basicInfo?: BasicUserInfo;
  isCompleted: boolean;
}

// Validation ranges
export const VALIDATION_RANGES = {
  age: {
    min: 13,
    max: 120,
  },
  height: {
    metric: {
      min: 100, // cm
      max: 250,
    },
    imperial: {
      min: 39, // inches
      max: 98,
    },
  },
  weight: {
    metric: {
      min: 30, // kg
      max: 300,
    },
    imperial: {
      min: 66, // lbs
      max: 660,
    },
  },
} as const;

export const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-binary', value: 'non_binary' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
  { label: 'Other', value: 'other' },
];

export const UNIT_SYSTEM_OPTIONS: { label: string; value: UnitSystem }[] = [
  { label: 'Metric (kg, cm)', value: 'metric' },
  { label: 'Imperial (lbs, ft/in)', value: 'imperial' },
];
