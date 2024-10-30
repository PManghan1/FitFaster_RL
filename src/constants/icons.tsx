import React from 'react';
import { Activity } from 'react-native-feather';
import type { IconProps } from '../types/icons';

// Using Activity icon as a replacement for Dumbbell since react-native-feather doesn't have a dumbbell icon
export const Dumbbell: React.FC<IconProps> = ({
  color = 'black',
  width = 24,
  height = 24,
  strokeWidth = 2,
  ...props
}) => (
  <Activity
    stroke={color}
    width={width}
    height={height}
    strokeWidth={strokeWidth}
    {...props}
  />
);
