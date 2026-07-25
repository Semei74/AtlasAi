import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, StyleSheet } from 'react-native';
import { Page, Container, Stack, Text, Row, Button } from '../../design-system';

interface FormTemplateProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  onCancel?: () => void;
  cancelLabel?: string;
  loading?: boolean;
}

export function FormTemplate({
  title,
  subtitle,
  children,
  onSubmit,
  submitLabel = 'Save',
  onCancel,
  cancelLabel = 'Cancel',
  loading = false,
}: FormTemplateProps) {
  return (
    <Page safeArea scroll={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Container>
            <Stack spacing={24}>
              <Stack spacing={4}>
                <Text role="heading4">{title}</Text>
                {subtitle && (
                  <Text role="bodySmall" color="#6B7280">
                    {subtitle}
                  </Text>
                )}
              </Stack>
              {children}
            </Stack>
          </Container>
        </ScrollView>
        {(onSubmit || onCancel) && (
          <View style={styles.footer}>
            <Row justify="flex-end" spacing={12}>
              {onCancel && (
                <Button variant="ghost" size="md" onPress={onCancel}>
                  {cancelLabel}
                </Button>
              )}
              {onSubmit && (
                <Button
                  variant="primary"
                  size="md"
                  onPress={onSubmit}
                  loading={loading}
                >
                  {submitLabel}
                </Button>
              )}
            </Row>
          </View>
        )}
      </KeyboardAvoidingView>
    </Page>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
