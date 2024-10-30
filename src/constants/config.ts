import { APP_ENV } from '@env';

export const IS_DEV = APP_ENV === 'development';
export const IS_PROD = APP_ENV === 'production';

export const API_ENDPOINTS = {
  AUTH: {
    SIGN_UP: '/auth/signup',
    SIGN_IN: '/auth/signin',
    SIGN_OUT: '/auth/signout',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    PROFILE: '/user/profile',
    SETTINGS: '/user/settings',
    UPDATE_PROFILE: '/user/profile/update',
  },
  WORKOUTS: {
    LIST: '/workouts',
    CREATE: '/workouts/create',
    UPDATE: '/workouts/update',
    DELETE: '/workouts/delete',
  },
  MEALS: {
    LIST: '/meals',
    CREATE: '/meals/create',
    UPDATE: '/meals/update',
    DELETE: '/meals/delete',
  },
  SUPPLEMENTS: {
    LIST: '/supplements',
    CREATE: '/supplements/create',
    UPDATE: '/supplements/update',
    DELETE: '/supplements/delete',
  },
  PROGRESS: {
    STATS: '/progress/stats',
    HISTORY: '/progress/history',
  },
} as const;

export const APP_CONSTANTS = {
  STORAGE_KEYS: {
    AUTH_TOKEN: '@fitfaster_auth_token',
    USER_SETTINGS: '@fitfaster_user_settings',
    THEME_PREFERENCE: '@fitfaster_theme_preference',
  },
  ANIMATION: {
    DURATION: {
      FAST: 200,
      NORMAL: 300,
      SLOW: 500,
    },
  },
  LIMITS: {
    MAX_WORKOUT_DURATION: 240, // minutes
    MAX_MEAL_ITEMS: 20,
    MAX_SUPPLEMENTS_PER_DAY: 10,
    MAX_PROGRESS_PHOTOS: 30,
  },
  DEFAULT_PAGINATION: {
    LIMIT: 10,
    OFFSET: 0,
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
export type AppConstants = typeof APP_CONSTANTS;
