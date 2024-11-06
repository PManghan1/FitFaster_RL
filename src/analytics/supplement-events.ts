import { AnalyticsEvent } from '../types/analytics';

export const SupplementEvents = {
  ADD_SUPPLEMENT: 'add_supplement',
  DELETE_SUPPLEMENT: 'delete_supplement',
  LOG_INTAKE: 'log_supplement_intake',
  UPDATE_REMINDERS: 'update_supplement_reminders',
  VIEW_DETAILS: 'view_supplement_details',
  VIEW_LIST: 'view_supplement_list',
} as const;

export type SupplementEventName = (typeof SupplementEvents)[keyof typeof SupplementEvents];

export interface SupplementEventProperties {
  supplementId?: string;
  supplementName?: string;
  dosage?: number;
  unit?: string;
  frequency?: string;
  remindersEnabled?: boolean;
  reminderCount?: number;
  error?: string;
  source?: string;
  timeToLoad?: number;
}

export function trackSupplementEvent(
  name: SupplementEventName,
  properties?: SupplementEventProperties
): void {
  try {
    const event: AnalyticsEvent = {
      name,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        platform: 'mobile',
      },
    };

    // Log event for debugging in development
    if (__DEV__) {
      console.log('Analytics Event:', event);
    }

    // Send to analytics service
    analytics.track(event);
  } catch (error) {
    console.error('Failed to track supplement event:', error);
    // Don't throw - analytics should never break the app
  }
}
