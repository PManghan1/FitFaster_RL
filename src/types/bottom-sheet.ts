import { BottomSheetProps as BaseBottomSheetProps } from '@gorhom/bottom-sheet';
import { SharedValue } from 'react-native-reanimated';

export type BottomSheetProps = Omit<BaseBottomSheetProps, 'children'> & {
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
};

export interface BottomSheetRefProps {
  expand: () => void;
  collapse: () => void;
  close: () => void;
  snapToIndex: (index: number) => void;
}

// Common bottom sheet configurations
export const DEFAULT_SNAP_POINTS = ['25%', '50%', '90%'] as const;
export const SHEET_BACKDROP_OPACITY = 0.5;

// Helper type for animated values
export type AnimatedSnapPoints = SharedValue<(string | number)[]>;
