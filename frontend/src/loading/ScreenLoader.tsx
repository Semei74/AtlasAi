import { Page, Container, Stack, Loader, Text } from '../../design-system';

interface ScreenLoaderProps {
  message?: string;
}

export function ScreenLoader({ message = 'Loading...' }: ScreenLoaderProps) {
  return (
    <Page safeArea scroll={false}>
      <Container center flex={1}>
        <Stack spacing={16} align="center">
          <Loader size={40} />
          <Text role="body" color="#6B7280">
            {message}
          </Text>
        </Stack>
      </Container>
    </Page>
  );
}
