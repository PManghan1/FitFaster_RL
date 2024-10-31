import type { ComponentType, ReactNode } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

import type { Theme } from '../constants/theme';

declare module 'styled-components/native' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type AnyStyledComponent = ComponentType<any>;

  export type StyledComponent<P = unknown> = ComponentType<P & { theme?: Theme }>;

  export interface StyledComponentProps {
    theme?: Theme;
    children?: ReactNode;
    style?: ViewStyle | TextStyle | ImageStyle;
  }

  export interface StyledFunction<Props = unknown, Style = unknown> {
    (
      strings: TemplateStringsArray,
      ...interpolations: Array<Interpolation<Props>>
    ): StyledComponent<Props>;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (component: ComponentType<any>): StyledFunction;
  }

  export interface DefaultTheme extends Theme {}

  export interface ThemeProviderProps {
    theme: Theme;
    children?: ReactNode;
  }

  export class ThemeProvider extends React.Component<ThemeProviderProps> {}

  export type Interpolation<Props = unknown> =
    | ((props: Props & StyledComponentProps) => string | number)
    | StyledComponent
    | string
    | number;

  export const css: (
    strings: TemplateStringsArray,
    ...interpolations: Array<Interpolation>
  ) => Array<Interpolation>;
}
