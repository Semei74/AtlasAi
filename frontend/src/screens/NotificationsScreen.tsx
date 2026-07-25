import { Page, Container, Stack, Text, EmptyState } from '../../design-system';

export function NotificationsScreen() {
  return (
    <Page safeArea scroll>
      <Container center flex={1}>
        <EmptyState
          title="All caught up"
          description="Notifications will appear here."
        />
      </Container>
    </Page>
  );
}
