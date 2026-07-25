import { useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useSpacing } from '../../hooks/useSpacing';
import type { BaseProps } from '../shared';

export interface CardProps extends BaseProps {
  variant?: 'default' | 'elevated' | 'outline' | 'flat' | 'interactive';
  padding?: number;
  onPress?: () => void;
  selected?: boolean;
  children: React.ReactNode;
}

export function Card({
  variant = 'default',
  padding,
  onPress,
  selected = false,
  children,
  testID,
  ...accessibilityProps
}: CardProps) {
  const theme = useTheme();
  const { colors, radius, elevation: elev } = theme;
  const spacing = useSpacing();
  const isDark = theme.colorScheme === 'dark';

  const cardPadding = padding ?? spacing.spacing[4];

  const cardStyle = useMemo(() => {
    const base: any = {
      padding: cardPadding,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    };

    switch (variant) {
      case 'elevated':
        base.borderWidth = 0;
        if (isDark) {
          base.borderTopWidth = 1;
          base.borderTopColor = 'rgba(255,255,255,0.06)';
          base.shadowColor = '#000';
          base.shadowOffset = { width: 0, height: 4 };
          base.shadowOpacity = 0.4;
          base.shadowRadius = 12;
          base.elevation = 4;
        } else {
          base.shadowColor = '#000';
          base.shadowOffset = { width: 0, height: 1 };
          base.shadowOpacity = 0.06;
          base.shadowRadius = 2;
          base.elevation = 2;
        }
        break;
      case 'outline':
        base.borderWidth = 1;
        base.borderColor = colors.neutral[200];
        break;
      case 'flat':
        base.borderWidth = 0;
        base.borderRadius = 0;
        break;
      case 'interactive':
        base.borderWidth = 1;
        base.borderColor = selected ? colors.primary[500] : colors.neutral[200];
        base.backgroundColor = selected ? colors.primary[50] : colors.surface;
        break;
      default:
        base.borderWidth = 1;
        base.borderColor = colors.neutral[200];
    }

    if (variant !== 'elevated') {
      delete base.shadowColor;
      delete base.shadowOffset;
      delete base.shadowOpacity;
      delete base.shadowRadius;
      delete base.elevation;
    }

    return base;
  }, [variant, cardPadding, radius.md, colors, selected, isDark]);

  if (onPress || variant === 'interactive') {
    return (
      <Pressable
        onPress={onPress}
        style={cardStyle}
        testID={testID}
        accessibilityRole="button"
        {...accessibilityProps}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} testID={testID} {...accessibilityProps}>
      {children}
    </View>
  );
}
