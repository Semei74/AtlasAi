import { SettingsTemplate } from '../templates';

export function SettingsScreen() {
  return (
    <SettingsTemplate
      title="Settings"
      sections={[
        {
          title: 'General',
          items: [
            { label: 'Profile' },
            { label: 'Preferences' },
            { label: 'Security' },
          ],
        },
        {
          title: 'App',
          items: [
            { label: 'Notifications' },
            { label: 'About' },
            { label: 'Help' },
          ],
        },
      ]}
    />
  );
}
