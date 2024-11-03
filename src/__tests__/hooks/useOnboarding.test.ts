import { renderHook, act } from '@testing-library/react-hooks';
import { useOnboarding } from '../../hooks/useOnboarding';
import useOnboardingStore from '../../store/onboarding.store';
import { useOnboardingAnalytics } from '../../hooks/useOnboardingAnalytics';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../hooks/useOnboardingAnalytics', () => ({
  useOnboardingAnalytics: jest.fn(),
}));

describe('useOnboarding', () => {
  const mockAnalytics = {
    startStep: jest.fn(),
    trackStartOnboarding: jest.fn(),
    trackCompleteOnboarding: jest.fn(),
    trackHealthMetrics: jest.fn(),
    trackFitnessLevel: jest.fn(),
    trackGoalTimeframes: jest.fn(),
    trackUserConsent: jest.fn(),
    trackDietaryPreferences: jest.fn(),
    trackActivityLevel: jest.fn(),
    trackValidationError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useOnboardingStore.getState().resetOnboarding();
    (useOnboardingAnalytics as jest.Mock).mockReturnValue(mockAnalytics);
  });

  it('tracks onboarding start on initial render', () => {
    renderHook(() => useOnboarding());
    expect(mockAnalytics.trackStartOnboarding).toHaveBeenCalled();
  });

  it('tracks health metrics submission with analytics', async () => {
    const { result } = renderHook(() => useOnboarding());
    const healthMetrics = {
      height: 170,
      weight: 70,
      age: 25,
      gender: 'male' as const,
      medicalConditions: [],
      medications: [],
    };

    await act(async () => {
      await result.current.handleHealthMetrics(healthMetrics);
    });

    expect(mockAnalytics.startStep).toHaveBeenCalledWith('HealthMetrics');
    expect(mockAnalytics.trackHealthMetrics).toHaveBeenCalledWith(healthMetrics);
    expect(mockNavigate).toHaveBeenCalledWith('FitnessLevel');
  });

  it('tracks validation errors', async () => {
    const { result } = renderHook(() => useOnboarding());
    const invalidHealthMetrics = {
      height: -1, // Invalid height
      weight: 70,
      age: 25,
      gender: 'male' as const,
      medicalConditions: [],
      medications: [],
    };

    await act(async () => {
      await result.current.handleHealthMetrics(invalidHealthMetrics);
    });

    expect(mockAnalytics.trackValidationError).toHaveBeenCalledWith(
      'HealthMetrics',
      expect.any(Array)
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('tracks completion of onboarding', async () => {
    const { result } = renderHook(() => useOnboarding());

    await act(async () => {
      await result.current.handleActivityLevel('moderately_active');
    });

    expect(mockAnalytics.trackActivityLevel).toHaveBeenCalledWith('moderately_active');
    expect(mockAnalytics.trackCompleteOnboarding).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('OnboardingGoals');
  });

  it('tracks step transitions', async () => {
    const { result } = renderHook(() => useOnboarding());

    await act(async () => {
      await result.current.handleHealthMetrics({
        height: 170,
        weight: 70,
        age: 25,
        gender: 'male',
        medicalConditions: [],
        medications: [],
      });
    });

    expect(mockAnalytics.startStep).toHaveBeenCalledWith('HealthMetrics');
    expect(mockNavigate).toHaveBeenCalledWith('FitnessLevel');
  });
});
