import { z } from 'zod';
import { VALIDATION_RANGES, GENDER_OPTIONS, UNIT_SYSTEM_OPTIONS } from '../types/onboarding';
import type { Gender, UnitSystem } from '../types/onboarding';

const createHeightValidation = (unitSystem: UnitSystem) => {
  const range = VALIDATION_RANGES.height[unitSystem];
  return z
    .number()
    .min(range.min, `Height must be at least ${range.min}${unitSystem === 'metric' ? 'cm' : 'in'}`)
    .max(
      range.max,
      `Height must be less than ${range.max}${unitSystem === 'metric' ? 'cm' : 'in'}`
    );
};

const createWeightValidation = (unitSystem: UnitSystem) => {
  const range = VALIDATION_RANGES.weight[unitSystem];
  return z
    .number()
    .min(range.min, `Weight must be at least ${range.min}${unitSystem === 'metric' ? 'kg' : 'lbs'}`)
    .max(
      range.max,
      `Weight must be less than ${range.max}${unitSystem === 'metric' ? 'kg' : 'lbs'}`
    );
};

const genderEnum = z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say', 'other'] as const);
const unitSystemEnum = z.enum(['metric', 'imperial'] as const);

export const createBasicInfoSchema = (unitSystem: UnitSystem) => {
  return z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .regex(/^[a-zA-Z\s-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

    age: z
      .number()
      .min(VALIDATION_RANGES.age.min, 'Must be at least 13 years old')
      .max(VALIDATION_RANGES.age.max, 'Age must be less than 120'),

    gender: genderEnum.refine(
      (val): val is Gender => GENDER_OPTIONS.some(option => option.value === val),
      {
        message: 'Invalid gender option selected',
      }
    ),

    height: createHeightValidation(unitSystem),
    weight: createWeightValidation(unitSystem),

    unitSystem: unitSystemEnum.refine(
      (val): val is UnitSystem => UNIT_SYSTEM_OPTIONS.some(option => option.value === val),
      {
        message: 'Invalid unit system selected',
      }
    ),
  });
};

export type BasicInfoSchema = ReturnType<typeof createBasicInfoSchema>;
export type BasicInfoFormData = z.infer<BasicInfoSchema>;

export const validateBasicInfo = (data: unknown, unitSystem: UnitSystem) => {
  const schema = createBasicInfoSchema(unitSystem);
  return schema.safeParse(data);
};

// Helper functions for unit conversion
export const convertHeight = {
  toMetric: (inches: number) => Math.round(inches * 2.54), // inches to cm
  toImperial: (cm: number) => Math.round(cm / 2.54), // cm to inches
};

export const convertWeight = {
  toMetric: (lbs: number) => Math.round(lbs * 0.45359237), // lbs to kg
  toImperial: (kg: number) => Math.round(kg / 0.45359237), // kg to lbs
};

// Format display values
export const formatHeight = (value: number, unitSystem: UnitSystem) => {
  if (unitSystem === 'metric') {
    return `${value} cm`;
  }
  const feet = Math.floor(value / 12);
  const inches = value % 12;
  return `${feet}'${inches}"`;
};

export const formatWeight = (value: number, unitSystem: UnitSystem) => {
  return `${value} ${unitSystem === 'metric' ? 'kg' : 'lbs'}`;
};
