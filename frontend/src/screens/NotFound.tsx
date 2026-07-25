import { useRouter } from 'expo-router';
import { Page, Container, Stack, Text, Button } from '../../design-system';

export function NotFound() {
  const router = useRouter();

  return (
    <Page safeArea scroll>
      <Container center flex={1}>
        <Stack spacing={16} align="center">
          <Text role="display" align="center" color="#9CA3AF">
            404
          </Text>
          <Text role="heading5" align="center">
            Page not found
          </Text>
          <Text role="body" align="center" color="#6B7280">
            The page you're looking for doesn't exist.
          </Text>
          <Button variant="primary" size="md" onPress={() => router.replace('/(tabs)')}>
            Go Home
          </Button>
        </Stack>
      </Container>
    </Page>
  );
}
