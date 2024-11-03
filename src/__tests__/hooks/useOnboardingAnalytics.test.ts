import { renderHook, act } from '@testing-library/react-hooks';
import { useOnboardingAnalytics } from '../../hooks/useOnboardingAnalytics';
import { trackOnboardingEvent, OnboardingEvents } from '../../analytics/onboarding-events';

jest.mock('../../analytics/onboarding-events', () => ({
  OnboardingEvents: {
    START_ONBOARDING: 'start_onboarding',
    COMPLETE_ONBOARDING: 'complete_onboarding',
    SUBMIT_HEALTH_METRICS: 'submit_health_metrics',
    STEP_VIEW: 'onboarding_step_view',
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

  it('tracks onboarding start', () => {
    const { result } = renderHook(() => useOnboardingAnalytics());

    act(() => {
      result.current.trackStartOnboarding();
    });

    expect(trackOnboardingEvent).toHaveBeenCalledWith(OnboardingEvents.START_ONBOARDING);
  });

  it('tracks step time when changing steps', () => {
    const { result } = renderHook(() => useOnboardingAnalytics());

    act(() => {
      result.current.startStep('HealthMetrics');
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

  it('tracks health metrics submission', () => {
    const { result } = renderHook(() => useOnboardingAnalytics());
    const metrics = {
      height: 170,
      weight: 70,
      age: 25,
      gender: 'male' as const,
      medicalConditions: [],
      medications: [],
    };

    act(() => {
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

  it('tracks validation errors', () => {
    const { result } = renderHook(() => useOnboardingAnalytics());
    const errors = ['Invalid height', 'Invalid weight'];

    act(() => {
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

  it('tracks final step time on completion', () => {
    const { result } = renderHook(() => useOnboardingAnalytics());

    act(() => {
      result.current.startStep('FinalStep');
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
