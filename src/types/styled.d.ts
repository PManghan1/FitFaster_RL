import 'styled-components/native';

declare module 'styled-components/native' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      border: string;
      error: string;
      success: string;
      warning: string;
    };
    darkColors: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      border: string;
      error: string;
      success: string;
      warning: string;
    };
    spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    borderRadius: {
      sm: number;
      md: number;
      lg: number;
      xl: number;
      full: number;
    };
    typography: {
      sizes: {
        xs: number;
        sm: number;
        base: number;
        lg: number;
        xl: number;
        '2xl': number;
        '3xl': number;
        '4xl': number;
      };
      weights: {
        normal: string;
        medium: string;
        semibold: string;
        bold: string;
      };
    };
    shadows: {
      sm: {
        shadowColor: string;
        shadowOffset: {
          width: number;
          height: number;
        };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
      };
      md: {
        shadowColor: string;
        shadowOffset: {
          width: number;
          height: number;
        };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
      };
      lg: {
        shadowColor: string;
        shadowOffset: {
          width: number;
          height: number;
        };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
      };
    };
  }
}
