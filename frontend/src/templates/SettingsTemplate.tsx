import { ReactNode } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Page, Container, Stack, Text, Section, Card, Row } from '../../design-system';

interface SettingsSection {
  title: string;
  items: { label: string; value?: string; onPress?: () => void; icon?: ReactNode }[];
}

interface SettingsTemplateProps {
  title: string;
  sections: SettingsSection[];
  footer?: ReactNode;
}

export function SettingsTemplate({ title, sections, footer }: SettingsTemplateProps) {
  return (
    <Page safeArea scroll>
      <Container>
        <Stack spacing={8}>
          <View style={{ paddingVertical: 16 }}>
            <Text role="heading4">{title}</Text>
          </View>
          {sections.map((section, idx) => (
            <Section key={idx} title={section.title}>
              <Card variant="default" padding={0}>
                <Stack spacing={0}>
                  {section.items.map((item, i) => (
                    <View
                      key={i}
                      style={[
                        styles.settingRow,
                        i < section.items.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: '#E5E7EB',
                        },
                      ]}
                    >
                      <Row flex={1} align="center" spacing={12}>
                        {item.icon && <View style={styles.iconWrap}>{item.icon}</View>}
                        <View style={{ flex: 1 }}>
                          <Text role="body">{item.label}</Text>
                        </View>
                        {item.value && (
                          <Text role="bodySmall" color="#9CA3AF">
                            {item.value}
                          </Text>
                        )}
                      </Row>
                    </View>
                  ))}
                </Stack>
              </Card>
            </Section>
          ))}
          {footer && (
            <View style={styles.footer}>
              {footer}
            </View>
          )}
        </Stack>
      </Container>
    </Page>
  );
}

const styles = StyleSheet.create({
  settingRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconWrap: {
    width: 24,
    alignItems: 'center',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
});
