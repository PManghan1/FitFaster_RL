import { FeatureToggles } from '..';

/**
 * Feature toggles configuration
 * Controls granular feature settings and beta features
 */
export const featureToggles: FeatureToggles = {
  newAuthFlow: false,
  newProfilePage: false,
  enhancedAnalytics: true,
  improvedErrorHandling: true,
  optimizedBackgroundTasks: true,
  advancedGamification: false,
  betaFeatures: {
    newWorkoutPlanner: false,
    aiAssistant: false,
    socialFeatures: false,
    customizableMetrics: false,
  },
};
