import { ReactNode } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Page, Container, Stack, Text } from '../../design-system';

interface AuthTemplateProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthTemplate({ title, subtitle, children, footer }: AuthTemplateProps) {
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
          <Container center flex={1}>
            <View style={styles.formContainer}>
              <Stack spacing={8} align="center">
                <Text role="heading3" align="center">
                  {title}
                </Text>
                {subtitle && (
                  <Text role="body" align="center" color="#6B7280">
                    {subtitle}
                  </Text>
                )}
              </Stack>
              <View style={{ height: 32 }} />
              {children}
            </View>
          </Container>
        </ScrollView>
        {footer && (
          <View style={styles.footer}>
            {footer}
          </View>
        )}
      </KeyboardAvoidingView>
    </Page>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
});
