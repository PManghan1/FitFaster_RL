import type { Theme } from '../constants/theme';

declare module 'styled-components/native' {
  export interface DefaultTheme extends Theme {}
}
