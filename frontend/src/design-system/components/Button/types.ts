import type { ViewStyle, TextStyle } from 'react-native';
import type { BaseProps } from '../shared';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onPress?: () => void;
  children?: string;
  accessibilityLabel?: string;
}

export const BUTTON_SIZES: Record<ButtonSize, { height: number; paddingH: number; fontSize: number; iconSize: number; iconGap: number }> = {
  xs: { height: 28, paddingH: 10, fontSize: 12, iconSize: 14, iconGap: 6 },
  sm: { height: 32, paddingH: 12, fontSize: 13, iconSize: 16, iconGap: 6 },
  md: { height: 40, paddingH: 16, fontSize: 14, iconSize: 18, iconGap: 8 },
  lg: { height: 48, paddingH: 20, fontSize: 16, iconSize: 20, iconGap: 10 },
  xl: { height: 56, paddingH: 24, fontSize: 18, iconSize: 22, iconGap: 12 },
};
