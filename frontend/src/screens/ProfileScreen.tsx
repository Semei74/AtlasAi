import { Page, Container, Stack, Text, Card, Avatar, Row } from '../../design-system';
import { SettingsTemplate } from '../templates';

export function ProfileScreen() {
  return (
    <SettingsTemplate
      title="Profile"
      sections={[
        {
          title: 'Account',
          items: [
            { label: 'Name', value: 'User' },
            { label: 'Email', value: 'user@atlas.ai' },
            { label: 'Role', value: 'Member' },
          ],
        },
        {
          title: 'Preferences',
          items: [
            { label: 'Theme', value: 'System' },
            { label: 'Language', value: 'English' },
          ],
        },
      ]}
    />
  );
}
