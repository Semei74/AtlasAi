import { useMemo, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useTheme, Text, Avatar, Badge, Row, Stack } from '../../design-system';
import { useWorkspace } from '../hooks';

interface WorkspaceHeaderProps {
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  onOrganizationSwitch?: () => void;
}

export function WorkspaceHeader({
  onNotificationPress,
  onProfilePress,
  onOrganizationSwitch,
}: WorkspaceHeaderProps) {
  const theme = useTheme();
  const { data: workspace, organization, role, isLoading } = useWorkspace();

  const userInitials = workspace?.name?.slice(0, 2).toUpperCase() ?? 'AT';

  const displayRole = useMemo(() => {
    if (!role) return 'Member';
    return role.charAt(0).toUpperCase() + role.slice(1);
  }, [role]);

  const orgName = organization?.name ?? 'Atlas AI';

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingHorizontal: theme.contentPadding.md,
            paddingVertical: theme.spacing[3],
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border.default,
          },
        ]}
      >
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.neutral[200] }} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ width: 120, height: 14, borderRadius: 4, backgroundColor: theme.colors.neutral[200] }} />
          <View style={{ height: 4 }} />
          <View style={{ width: 80, height: 12, borderRadius: 4, backgroundColor: theme.colors.neutral[200] }} />
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(theme.duration.normal)}
      exiting={FadeOutUp.duration(theme.duration.normal)}
      style={[
        styles.container,
        {
          paddingHorizontal: theme.contentPadding.md,
          paddingVertical: theme.spacing[3],
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.default,
        },
      ]}
      accessibilityLabel={`Workspace header: ${workspace?.name ?? 'Atlas AI'}`}
    >
      <Pressable
        onPress={onOrganizationSwitch}
        accessibilityRole="button"
        accessibilityLabel={`Switch organization. Current: ${orgName}`}
        hitSlop={8}
      >
        <Row spacing={12} align="center">
          <View>
            <Avatar
              size="md"
              initials={userInitials}
              fallback={
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.colors.primary[100],
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    role="bodySmall"
                    color={theme.colors.primary[700]}
                  >
                    {userInitials}
                  </Text>
                </View>
              }
            />
            <View
              style={[
                styles.onlineDot,
                {
                  backgroundColor: theme.colors.success.default,
                  borderColor: theme.colors.surface,
                },
              ]}
              accessibilityLabel="Online"
            />
          </View>
          <Stack spacing={2}>
            <Text role="bodySmall" color={theme.colors.text.secondary} numberOfLines={1}>
              {orgName}
            </Text>
            <Text role="heading5" numberOfLines={1}>
              {workspace?.name ?? 'My Workspace'}
            </Text>
            <Row spacing={6} align="center">
              <Badge color="neutral" size="sm" label={displayRole} />
            </Row>
          </Stack>
        </Row>
      </Pressable>

      <Row spacing={8} align="center">
        <Pressable
          onPress={onNotificationPress}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          hitSlop={8}
          style={[
            styles.iconBtn,
            {
              backgroundColor: theme.colors.neutral[100],
              borderRadius: theme.radius.md,
            },
          ]}
        >
          <Badge color="error" size="sm" dot />
        </Pressable>
        <Pressable
          onPress={onProfilePress}
          accessibilityRole="button"
          accessibilityLabel="Profile"
          hitSlop={8}
        >
          <Avatar size="sm" initials={userInitials} />
        </Pressable>
      </Row>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
