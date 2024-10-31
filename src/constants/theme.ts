export interface Theme {
  colors: {
    primary: {
      default: string;
      light: string;
      dark: string;
    };
    secondary: {
      default: string;
      light: string;
      dark: string;
    };
    background: {
      default: string;
      light: string;
      dark: string;
    };
    text: {
      default: string;
      light: string;
      dark: string;
    };
    error: {
      default: string;
      light: string;
      dark: string;
    };
    success: {
      default: string;
      light: string;
      dark: string;
    };
    warning: {
      default: string;
      light: string;
      dark: string;
    };
    info: {
      default: string;
      light: string;
      dark: string;
    };
    social: {
      facebook: string;
    };
    border: {
      default: string;
      light: string;
      dark: string;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
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
