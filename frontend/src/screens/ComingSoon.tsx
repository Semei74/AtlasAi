import { Page, Container, Stack, Text, EmptyState } from '../../design-system';

interface ComingSoonProps {
  title?: string;
  feature?: string;
}

export function ComingSoon({
  title = 'Coming Soon',
  feature = 'This feature is under development',
}: ComingSoonProps) {
  return (
    <Page safeArea scroll>
      <Container center flex={1}>
        <EmptyState
          icon={
            <Text role="heading1" align="center" color="#9CA3AF">
              🚀
            </Text>
          }
          title={title}
          description={feature}
        />
      </Container>
    </Page>
  );
}
