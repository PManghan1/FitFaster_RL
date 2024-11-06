import type { Supplement, SupplementIntake } from '../../types/supplement';

export const createMockSupplement = (overrides?: Partial<Supplement>): Supplement => ({
  id: '1',
  name: 'Vitamin D',
  dosage: 1000,
  unit: 'mg',
  frequency: 'daily',
  startDate: new Date('2024-01-01'),
  remindersEnabled: true,
  reminderTimes: ['09:00'],
  notes: 'Test supplement',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockIntake = (overrides?: Partial<SupplementIntake>): SupplementIntake => ({
  id: 'intake1',
  supplementId: '1',
  intakeDateTime: new Date('2024-01-01T09:00:00'),
  dosageTaken: 1000,
  notes: 'Test intake',
  createdAt: new Date('2024-01-01T09:00:00'),
  ...overrides,
});

export const mockSupplementStore = {
  supplements: [createMockSupplement()],
  intakes: [createMockIntake()],
  addSupplement: jest.fn(),
  updateSupplement: jest.fn(),
  deleteSupplement: jest.fn(),
  logIntake: jest.fn(),
  deleteIntake: jest.fn(),
  toggleReminders: jest.fn(),
  updateReminderTimes: jest.fn(),
  calculateStats: jest.fn(),
  calculateAllStats: jest.fn(),
  setFilter: jest.fn(),
  setSort: jest.fn(),
  clearError: jest.fn(),
};
