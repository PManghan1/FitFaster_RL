import { useCallback } from 'react';
import { trackSupplementEvent, SupplementEvents } from '../analytics/supplement-events';
import type { Supplement } from '../types/supplement';
import { usePerformanceMonitoring } from './usePerformanceMonitoring';

export function useSupplementAnalytics() {
  const { measurePerformance } = usePerformanceMonitoring();

  const trackAddSupplement = useCallback((supplement: Supplement) => {
    trackSupplementEvent(SupplementEvents.ADD_SUPPLEMENT, {
      supplementId: supplement.id,
      supplementName: supplement.name,
      dosage: supplement.dosage,
      unit: supplement.unit,
      frequency: supplement.frequency,
      remindersEnabled: supplement.remindersEnabled,
      reminderCount: supplement.reminderTimes.length,
    });
  }, []);

  const trackDeleteSupplement = useCallback((supplement: Supplement) => {
    trackSupplementEvent(SupplementEvents.DELETE_SUPPLEMENT, {
      supplementId: supplement.id,
      supplementName: supplement.name,
    });
  }, []);

  const trackLogIntake = useCallback((supplementId: string, dosage: number, source: string) => {
    trackSupplementEvent(SupplementEvents.LOG_INTAKE, {
      supplementId,
      dosage,
      source,
    });
  }, []);

  const trackUpdateReminders = useCallback(
    (supplementId: string, enabled: boolean, reminderCount: number) => {
      trackSupplementEvent(SupplementEvents.UPDATE_REMINDERS, {
        supplementId,
        remindersEnabled: enabled,
        reminderCount,
      });
    },
    []
  );

  const trackViewDetails = useCallback(
    async (supplementId: string) => {
      const loadTime = await measurePerformance('supplement_details_load');
      trackSupplementEvent(SupplementEvents.VIEW_DETAILS, {
        supplementId,
        timeToLoad: loadTime,
      });
    },
    [measurePerformance]
  );

  const trackViewList = useCallback(async () => {
    const loadTime = await measurePerformance('supplement_list_load');
    trackSupplementEvent(SupplementEvents.VIEW_LIST, {
      timeToLoad: loadTime,
    });
  }, [measurePerformance]);

  return {
    trackAddSupplement,
    trackDeleteSupplement,
    trackLogIntake,
    trackUpdateReminders,
    trackViewDetails,
    trackViewList,
  };
}
