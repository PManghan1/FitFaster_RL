import { renderHook, act } from '@testing-library/react-native';
import { useOnboardingAnalytics } from '../../hooks/useOnboardingAnalytics';
import { trackOnboardingEvent, OnboardingEvents } from '../../analytics/onboarding-events';

jest.mock('../../analytics/onboarding-events', () => ({
  OnboardingEvents: {
    START_ONBOARDING: 'start_onboarding',
    COMPLETE_ONBOARDING: 'complete_onboarding',
    SUBMIT_HEALTH_METRICS: 'submit_health_metrics',
    STEP_VIEW: 'onboarding_step_view',
    VALIDATION_ERROR: 'validation_error',
  },
  trackOnboardingEvent: jest.fn(),
}));

describe('useOnboardingAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('tracks onboarding start', async () => {
    const { result } = renderHook(() => useOnboardingAnalytics());

    await act(async () => {
      result.current.trackStartOnboarding();
    });

    expect(trackOnboardingEvent).toHaveBeenCalledWith(OnboardingEvents.START_ONBOARDING);
  });

  it('tracks step time when changing steps', async () => {
    const { result } = renderHook(() => useOnboardingAnalytics());

    await act(async () => {
      result.current.startStep('HealthMetrics');
    });

    // Advance timers inside act to ensure state updates are handled properly
    await act(async () => {
      jest.advanceTimersByTime(5000); // 5 seconds
      result.current.startStep('FitnessLevel');
    });

    expect(trackOnboardingEvent).toHaveBeenCalledWith(
      OnboardingEvents.STEP_VIEW,
      expect.objectContaining({
        stepName: 'HealthMetrics',
        timeSpent: 5000,
      })
    );
  });

  it('tracks health metrics submission', async () => {
    const { result } = renderHook(() => useOnboardingAnalytics());
    const metrics = {
      height: 170,
      weight: 70,
      age: 25,
      gender: 'male' as const,
      medicalConditions: [],
      medications: [],
    };

    await act(async () => {
      result.current.trackHealthMetrics(metrics);
    });

    expect(trackOnboardingEvent).toHaveBeenCalledWith(
      OnboardingEvents.SUBMIT_HEALTH_METRICS,
      expect.objectContaining({
        healthMetrics: {
          height: 170,
          weight: 70,
          age: 25,
          gender: 'male',
        },
      })
    );
  });

  it('tracks validation errors', async () => {
    const { result } = renderHook(() => useOnboardingAnalytics());
    const errors = ['Invalid height', 'Invalid weight'];

    await act(async () => {
      result.current.trackValidationError('HealthMetrics', errors);
    });

    expect(trackOnboardingEvent).toHaveBeenCalledWith(
      OnboardingEvents.VALIDATION_ERROR,
      expect.objectContaining({
        stepName: 'HealthMetrics',
        validationErrors: errors,
      })
    );
  });

  it('tracks final step time on completion', async () => {
    const { result } = renderHook(() => useOnboardingAnalytics());

    await act(async () => {
      result.current.startStep('FinalStep');
    });

    await act(async () => {
      jest.advanceTimersByTime(3000);
      result.current.trackCompleteOnboarding();
    });

    expect(trackOnboardingEvent).toHaveBeenCalledWith(
      OnboardingEvents.STEP_VIEW,
      expect.objectContaining({
        stepName: 'FinalStep',
        timeSpent: 3000,
      })
    );

    expect(trackOnboardingEvent).toHaveBeenCalledWith(OnboardingEvents.COMPLETE_ONBOARDING);
  });
});
