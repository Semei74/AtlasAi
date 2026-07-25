import { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { BaseProps } from '../shared';

export interface AvatarProps extends BaseProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  src?: string;
  initials?: string;
  fallback?: React.ReactNode;
  borderColor?: string;
}

export const AVATAR_SIZES: Record<string, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 96,
};

function getInitialFontSize(size: number): number {
  if (size <= 24) return 10;
  if (size <= 32) return 12;
  if (size <= 40) return 14;
  if (size <= 48) return 16;
  if (size <= 64) return 20;
  return 28;
}

export function Avatar({
  size = 'md',
  src,
  initials,
  fallback,
  borderColor,
  testID,
  ...accessibilityProps
}: AvatarProps) {
  const theme = useTheme();
  const { colors, radius } = theme;
  const avatarSize = AVATAR_SIZES[size];
  const fontSize = getInitialFontSize(avatarSize);
  const border = borderColor ?? colors.surface;

  const containerStyle = useMemo(
    () => ({
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor: colors.primary[100],
      borderWidth: 2,
      borderColor: border,
      overflow: 'hidden' as const,
    }),
    [avatarSize, colors.primary, border],
  );

  const initialsStyle = useMemo(
    () => ({
      fontSize,
      fontWeight: theme.fontWeight.semiBold,
      color: colors.primary[700],
      fontFamily: theme.fontFamily.inter,
    }),
    [fontSize, theme.fontWeight.semiBold, colors.primary, theme.fontFamily.inter],
  );

  if (src) {
    return (
      <View style={containerStyle} testID={testID} {...accessibilityProps}>
        <Image
          source={{ uri: src }}
          style={styles.image}
          accessibilityRole="image"
          accessibilityLabel="User avatar"
        />
      </View>
    );
  }

  if (initials) {
    return (
      <View style={[containerStyle, styles.initialsContainer]} testID={testID} {...accessibilityProps}>
        <Text style={initialsStyle}>{initials.slice(0, 2).toUpperCase()}</Text>
      </View>
    );
  }

  return (
    <View style={containerStyle} testID={testID} {...accessibilityProps}>
      {fallback ?? (
        <View style={styles.fallbackContainer}>
          <Text style={[initialsStyle, { fontSize: avatarSize * 0.4 }]}>?</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
