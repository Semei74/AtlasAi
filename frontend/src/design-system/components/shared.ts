import type { ViewStyle, TextStyle, AccessibilityProps, GestureResponderEvent } from 'react-native';

export type ColorScheme = 'light' | 'dark';

export type DensityMode = 'comfortable' | 'compact' | 'touch';

export interface BaseProps extends AccessibilityProps {
  testID?: string;
}

export interface PressableProps extends BaseProps {
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
}

export type VariantProp<T extends string> = T | T[];

export type SizeProp<T extends string> = T | T[];
