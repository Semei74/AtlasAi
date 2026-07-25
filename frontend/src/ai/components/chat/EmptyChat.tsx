import { useCallback } from 'react';
import { View, Text as RNText } from 'react-native';
import { useTheme } from '../../../design-system/hooks/useTheme';
import { Text } from '../../../design-system/components/Text';
import { Stack } from '../../../design-system/components/Stack';
import { Row } from '../../../design-system/components/Row';
import { Chip } from '../../../design-system/components/Chip';

interface EmptyChatProps {
  onSuggestion?: (text: string) => void;
}

const SUGGESTIONS = [
  'Help me write code',
  'Summarize this',
  'Explain this concept',
  'Write a poem',
  'Debug my code',
  'Generate a recipe',
] as const;

function SuggestionChip({
  label,
  onPress,
}: {
  label: string;
  onPress: (label: string) => void;
}) {
  const handlePress = useCallback(() => {
    onPress(label);
  }, [label, onPress]);

  return (
    <Chip
      label={label}
      color="outline"
      size="md"
      onPress={handlePress}
      accessibilityLabel={`Suggestion: ${label}`}
    />
  );
}

export function EmptyChat({ onSuggestion }: EmptyChatProps) {
  const theme = useTheme();

  const handleSuggestionPress = useCallback(
    (text: string) => {
      onSuggestion?.(text);
    },
    [onSuggestion],
  );

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing[8],
        paddingVertical: theme.spacing[12],
      }}
      accessibilityLabel="Empty chat"
      accessibilityRole="alert"
    >
      <Stack spacing={theme.spacing[6]} align="center">
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.primary[50],
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityRole="image"
          accessibilityLabel="Chat illustration"
        >
          <RNText
            style={{
              fontSize: 36,
              color: theme.colors.primary[400],
              fontFamily: theme.fontFamily.inter,
            }}
          >
            {'\u2726'}
          </RNText>
        </View>
        <Stack spacing={theme.spacing[2]} align="center">
          <Text role="heading5" color={theme.colors.text.primary} align="center">
            Start a conversation
          </Text>
          <Text
            role="body"
            color={theme.colors.text.secondary}
            align="center"
          >
            Send a message to begin chatting with AI
          </Text>
        </Stack>
        {onSuggestion && (
          <View
            style={{
              marginTop: theme.spacing[4],
              maxWidth: 400,
            }}
            accessibilityLabel="Suggestions"
          >
            <Row spacing={theme.spacing[2]} justify="center" wrap>
              {SUGGESTIONS.map((suggestion) => (
                <SuggestionChip
                  key={suggestion}
                  label={suggestion}
                  onPress={handleSuggestionPress}
                />
              ))}
            </Row>
          </View>
        )}
      </Stack>
    </View>
  );
}
