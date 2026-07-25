import { ReactNode } from 'react';
import { Page, Container, Stack, Header, Section, Card } from '../../design-system';
import { ScreenLoader } from '../loading/ScreenLoader';

interface DetailTemplateProps {
  title: string;
  headerAction?: ReactNode;
  onBack?: () => void;
  children: ReactNode;
  loading?: boolean;
  sections?: { title?: string; content: ReactNode }[];
}

export function DetailTemplate({
  title,
  headerAction,
  onBack,
  children,
  loading = false,
  sections,
}: DetailTemplateProps) {
  if (loading) {
    return <ScreenLoader />;
  }

  return (
    <Page safeArea scroll>
      <Container>
        <Stack spacing={16}>
          <Header
            title={title}
            onBack={onBack}
            rightAction={headerAction}
          />
          {sections ? (
            sections.map((section, i) => (
              <Section key={i} title={section.title}>
                <Card variant="default" padding={16}>
                  {section.content}
                </Card>
              </Section>
            ))
          ) : (
            children
          )}
        </Stack>
      </Container>
    </Page>
  );
}
