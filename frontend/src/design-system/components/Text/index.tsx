import { useMemo } from 'react';
import { Text as RNText } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useTypography } from '../../hooks/useTypography';
import { typeRoles } from '../../theme/typography';
import type { BaseProps } from '../shared';

export type TextRole = keyof typeof typeRoles;

export interface TextProps extends BaseProps {
  role?: TextRole;
  color?: string;
  align?: 'left' | 'center' | 'right';
  children: string | string[];
  numberOfLines?: number;
}

export function Text({
  role = 'body',
  color,
  align = 'left',
  children,
  numberOfLines,
  testID,
  ...accessibilityProps
}: TextProps) {
  const theme = useTheme();
  const typography = useTypography();
  const typeRole = typography.getRole(role);

  const textColor = color ?? theme.colors.text.primary;

  const textStyle = {
    fontSize: typeRole.fontSize,
    fontWeight: typeRole.fontWeight as any,
    lineHeight: typeRole.fontSize * typeRole.lineHeight,
    color: textColor,
    textAlign: align,
    fontFamily: theme.fontFamily.inter,
  };

  return (
    <RNText
      style={textStyle}
      numberOfLines={numberOfLines}
      testID={testID}
      {...accessibilityProps}
    >
      {children}
    </RNText>
  );
}
