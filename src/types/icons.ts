import { ViewProps } from 'react-native';

export interface IconProps extends ViewProps {
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  fill?: string;
  stroke?: string;
}
