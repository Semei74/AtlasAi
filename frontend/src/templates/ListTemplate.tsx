import { ReactNode } from 'react';
import { Page, Container, Stack, Header } from '../../design-system';
import { ScreenLoader } from '../loading/ScreenLoader';

interface ListTemplateProps {
  title: string;
  headerAction?: ReactNode;
  children: ReactNode;
  loading?: boolean;
  loadingMessage?: string;
  empty?: ReactNode;
  isEmpty?: boolean;
}

export function ListTemplate({
  title,
  headerAction,
  children,
  loading = false,
  loadingMessage,
  empty,
  isEmpty = false,
}: ListTemplateProps) {
  if (loading) {
    return <ScreenLoader message={loadingMessage} />;
  }

  return (
    <Page safeArea scroll>
      <Container>
        <Stack spacing={16}>
          <Header title={title} rightAction={headerAction} />
          {isEmpty && empty ? (
            empty
          ) : (
            children
          )}
        </Stack>
      </Container>
    </Page>
  );
}
