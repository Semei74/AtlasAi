import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Row } from '../../design-system';

interface HeaderProps {
  title?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  onBack?: () => void;
}

export function Header({ title, leftAction, rightAction, onBack }: HeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          height: 56,
          paddingTop: insets.top > 0 ? 0 : 0,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.default,
        },
      ]}
    >
      <Row align="center" justify="space-between" flex={1}>
        <View style={styles.left}>
          {leftAction}
          {onBack && (
            <Pressable
              onPress={onBack}
              hitSlop={8}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Text style={{ fontSize: 24, color: theme.colors.text.primary }}>
                ←
              </Text>
            </Pressable>
          )}
        </View>
        {title && (
          <Text
            style={[
              styles.title,
              {
                fontFamily: theme.fontFamily.inter,
                fontWeight: theme.fontWeight.semiBold,
                fontSize: 18,
                color: theme.colors.text.primary,
              },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
        <View style={styles.right}>
          {rightAction}
        </View>
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 44,
  },
  title: {
    textAlign: 'center',
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 44,
    justifyContent: 'flex-end',
  },
});
