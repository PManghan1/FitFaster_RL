import React from 'react';
import { View, ViewProps } from 'react-native';

interface IconProps extends ViewProps {
  color?: string;
  size?: number;
  strokeWidth?: number;
}

const createIconMock = (name: string) => {
  const IconComponent = React.forwardRef<View, IconProps>((props, ref) => {
    return React.createElement(View, {
      ...props,
      ref,
      testID: `${name}-icon`,
    });
  });
  IconComponent.displayName = `${name}Icon`;
  return IconComponent;
};

export const Shield = createIconMock('Shield');
export const Lock = createIconMock('Lock');
export const Check = createIconMock('Check');
export const AlertTriangle = createIconMock('AlertTriangle');
export const Info = createIconMock('Info');
export const Play = createIconMock('Play');
export const Pause = createIconMock('Pause');
export const RotateCcw = createIconMock('RotateCcw');
