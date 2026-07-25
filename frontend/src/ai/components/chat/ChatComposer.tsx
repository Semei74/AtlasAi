import { useRef, useState, useCallback, useEffect } from 'react';
import { View, TextInput, Pressable, Text as RNText } from 'react-native';
import { useTheme } from '../../../design-system/hooks/useTheme';
import { Row } from '../../../design-system/components/Row';
import { Text } from '../../../design-system/components/Text';

interface ChatComposerProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function ChatComposer({
  onSend,
  onStop,
  isStreaming,
  disabled = false,
}: ChatComposerProps) {
  const theme = useTheme();
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setText('');
  }, [text, disabled, isStreaming, onSend]);

  const handleChangeText = useCallback((val: string) => {
    setText(val);
  }, []);

  const isEmpty = text.trim().length === 0;
  const sendDisabled = isEmpty || disabled || isStreaming;

  return (
    <View
      style={{
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[3],
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.default,
        backgroundColor: theme.colors.bg.primary,
      }}
      accessibilityLabel="Message composer"
    >
      <Row spacing={theme.spacing[3]} align="flex-end">
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.bg.secondary,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.border.default,
            paddingHorizontal: theme.spacing[4],
            paddingVertical: theme.spacing[2],
            maxHeight: 120,
          }}
        >
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={handleChangeText}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            editable={!disabled}
            returnKeyType="default"
            blurOnSubmit
            onSubmitEditing={handleSend}
            style={{
              fontSize: 16,
              fontFamily: theme.fontFamily.inter,
              color: disabled ? theme.colors.text.disabled : theme.colors.text.primary,
              lineHeight: 22,
              padding: 0,
              margin: 0,
              minHeight: 22,
            }}
            accessibilityLabel="Message input"
            accessibilityState={{ disabled }}
          />
        </View>
        {isStreaming ? (
          <Pressable
            onPress={onStop}
            accessibilityRole="button"
            accessibilityLabel="Stop generating"
            style={{
              height: 44,
              width: 44,
              borderRadius: theme.radius.full,
              backgroundColor: theme.colors.error.default,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 16,
                height: 16,
                backgroundColor: '#FFFFFF',
                borderRadius: theme.radius.xs,
              }}
            />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleSend}
            disabled={sendDisabled}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: sendDisabled }}
            style={{
              height: 44,
              width: 44,
              borderRadius: theme.radius.full,
              backgroundColor: sendDisabled
                ? theme.colors.neutral[300]
                : theme.colors.primary[500],
              alignItems: 'center',
              justifyContent: 'center',
              opacity: sendDisabled ? theme.opacity.disabled : 1,
            }}
          >
            <RNText
              style={{
                fontSize: 18,
                color: sendDisabled
                  ? theme.colors.text.tertiary
                  : theme.colors.text.onPrimary,
                fontFamily: theme.fontFamily.inter,
              }}
            >
              {'\u2191'}
            </RNText>
          </Pressable>
        )}
      </Row>
      {disabled && (
        <View style={{ marginTop: theme.spacing[2] }}>
          <Text role="caption" color={theme.colors.text.tertiary} align="center">
            Composer is disabled
          </Text>
        </View>
      )}
    </View>
  );
}
