import { Theme } from '../constants/theme';

// Helper function to add opacity to hex color
export const withOpacity = (hexColor: string, opacity: number): string => {
  // Convert opacity (0-1) to hex (00-FF)
  const opacityHex = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hexColor}${opacityHex}`;
};

export const theme: Theme = {
  colors: {
    primary: {
      default: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
    secondary: {
      default: '#6B7280',
      light: '#9CA3AF',
      dark: '#4B5563',
    },
    background: {
      default: '#FFFFFF',
      light: '#F3F4F6',
      dark: '#E5E7EB',
    },
    text: {
      default: '#1F2937',
      light: '#6B7280',
      dark: '#111827',
    },
    error: {
      default: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    success: {
      default: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      default: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    info: {
      default: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
    social: {
      facebook: '#1877F2',
    },
    border: {
      default: '#D1D5DB',
      light: '#E5E7EB',
      dark: '#9CA3AF',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};

// Export commonly used theme values for easier access
export const { colors, spacing, typography, borderRadius, shadows } = theme;
