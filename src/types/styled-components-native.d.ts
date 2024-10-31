/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ComponentType } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

import type { Theme } from '../constants/theme';

declare module 'styled-components/native' {
  export interface StyledComponentProps<Props = any> {
    theme?: Theme;
    children?: React.ReactNode;
    style?: ViewStyle | TextStyle | ImageStyle;
  }

  export type StyledComponent<Props = any> = ComponentType<Props & StyledComponentProps>;

  export interface StyledFunction<Props = any, Style = any> {
    (strings: TemplateStringsArray, ...interpolations: any[]): StyledComponent<Props>;
    attrs<Attrs extends object>(
      attrs: Attrs | ((props: Props) => Attrs),
    ): StyledFunction<Props & Attrs, Style>;
  }

  export interface StyledInterface {
    View: StyledFunction<ViewStyle>;
    Text: StyledFunction<TextStyle>;
    Image: StyledFunction<ImageStyle>;
    TouchableOpacity: StyledFunction<ViewStyle>;
    ScrollView: StyledFunction<ViewStyle>;
    FlatList: StyledFunction<ViewStyle>;
    SectionList: StyledFunction<ViewStyle>;
    TextInput: StyledFunction<TextStyle>;
    SafeAreaView: StyledFunction<ViewStyle>;
    (component: ComponentType<any>): StyledFunction;
  }

  export interface DefaultTheme extends Theme {}

  export interface ThemeProviderProps {
    theme: Theme;
    children?: React.ReactNode;
  }

  export class ThemeProvider extends React.Component<ThemeProviderProps> {}

  const styled: StyledInterface;
  export default styled;

  export function useTheme(): Theme;

  export type Interpolation<Props = any> =
    | ((props: Props & StyledComponentProps) => string | number)
    | StyledComponent
    | string
    | number;

  export const css: (
    strings: TemplateStringsArray,
    ...interpolations: Array<Interpolation>
  ) => Array<Interpolation>;
}
