import type { TextInputProps as RNTextInputProps } from 'react-native';
import type { BaseProps } from '../shared';

export type InputVariant = 'outlined' | 'filled';

export type InputSize = 'sm' | 'md' | 'lg';

export type InputType = 'text' | 'password' | 'phone' | 'search' | 'otp' | 'multiline';

export type InputState = 'default' | 'error' | 'success' | 'disabled' | 'readonly';

export interface InputProps extends BaseProps {
  variant?: InputVariant;
  size?: InputSize;
  type?: InputType;
  state?: InputState;
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  errorMessage?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  autoComplete?: RNTextInputProps['autoComplete'];
  keyboardType?: RNTextInputProps['keyboardType'];
  textContentType?: RNTextInputProps['textContentType'];
  returnKeyType?: RNTextInputProps['returnKeyType'];
  onSubmitEditing?: () => void;
}

export const INPUT_SIZES: Record<InputSize, { height: number; fontSize: number; paddingH: number }> = {
  sm: { height: 32, fontSize: 14, paddingH: 10 },
  md: { height: 40, fontSize: 14, paddingH: 12 },
  lg: { height: 48, fontSize: 16, paddingH: 14 },
};
