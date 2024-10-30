import { FC } from 'react';
import { SvgProps } from 'react-native-svg';

export interface FeatherIconProps extends SvgProps {
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
}

declare module 'react-native-feather' {
  export const Activity: FC<FeatherIconProps>;
  export const Plus: FC<FeatherIconProps>;
  export const X: FC<FeatherIconProps>;
  export const Clock: FC<FeatherIconProps>;
  export const Calendar: FC<FeatherIconProps>;
  export const Award: FC<FeatherIconProps>;
  export const TrendingUp: FC<FeatherIconProps>;
  export const ChevronRight: FC<FeatherIconProps>;
  export const Star: FC<FeatherIconProps>;
  export const Shield: FC<FeatherIconProps>;
  export const AlertTriangle: FC<FeatherIconProps>;
  export const FileText: FC<FeatherIconProps>;
  export const ExternalLink: FC<FeatherIconProps>;
  export const Eye: FC<FeatherIconProps>;
  export const EyeOff: FC<FeatherIconProps>;
  export const Lock: FC<FeatherIconProps>;
}
