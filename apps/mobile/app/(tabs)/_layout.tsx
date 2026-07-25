import { ReactElement } from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useTheme, Text } from '../../../../frontend/src/design-system';
import { useAuth } from '../../../../frontend/src/auth';

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const icons: Record<string, string> = {
    index: '🏠',
    ai: '🤖',
    workspace: '📁',
    projects: '📋',
    profile: '👤',
  };
  return (
    <View style={styles.tabIcon}>
      <Text role="body" style={{ fontSize: 22 }}>{icons[name] ?? '●'}</Text>
    </View>
  );
}

export default function TabLayout(): ReactElement {
  const theme = useTheme();
  const { isAuthenticated, isRestoring } = useAuth();

  if (isRestoring) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 56,
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border.default,
          paddingBottom: 4,
          paddingTop: 4,
        },
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: theme.fontWeight.medium,
          fontFamily: theme.fontFamily.inter,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="index" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="ai" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workspace"
        options={{
          title: 'Workspace',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="workspace" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="projects" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="profile" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
});
