import { useRouter } from 'expo-router';
import { Page, Container, Stack, Text, Button } from '../../design-system';

export function Unauthorized() {
  const router = useRouter();

  return (
    <Page safeArea scroll>
      <Container center flex={1}>
        <Stack spacing={16} align="center">
          <Text role="display" align="center" color="#DC2626">
            403
          </Text>
          <Text role="heading5" align="center">
            Access denied
          </Text>
          <Text role="body" align="center" color="#6B7280">
            You don't have permission to view this page.
          </Text>
          <Button variant="primary" size="md" onPress={() => router.replace('/(tabs)')}>
            Go Home
          </Button>
        </Stack>
      </Container>
    </Page>
  );
}
