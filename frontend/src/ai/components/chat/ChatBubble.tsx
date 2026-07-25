import { useMemo, useCallback, useState } from 'react';
import { View, Pressable, Text as RNText } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../../design-system/hooks/useTheme';
import { Text } from '../../../design-system/components/Text';
import { Stack } from '../../../design-system/components/Stack';
import { Row } from '../../../design-system/components/Row';
import { Surface } from '../../../design-system/components/Surface';
import { Divider } from '../../../design-system/components/Divider';
import type { ChatMessage } from '../../types';

interface ChatBubbleProps {
  message: ChatMessage;
}

function parseBoldSegments(text: string): Array<{ type: 'text' | 'bold'; content: string }> {
  const segments: Array<{ type: 'text' | 'bold'; content: string }> = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'bold', content: match[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }
  return segments;
}

function extractCodeBlocks(
  content: string,
): Array<{ type: 'text' | 'code'; language?: string; code: string }> {
  const blocks: Array<{ type: 'text' | 'code'; language?: string; code: string }> = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', code: content.slice(lastIndex, match.index) });
    }
    blocks.push({ type: 'code', language: match[1] || undefined, code: match[2] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    blocks.push({ type: 'text', code: content.slice(lastIndex) });
  }
  return blocks;
}

function TimestampDisplay({ timestamp }: { timestamp: string }) {
  const theme = useTheme();
  const formatted = useMemo(() => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [timestamp]);

  return (
    <Text role="caption" color={theme.colors.text.tertiary}>
      {formatted}
    </Text>
  );
}

function TokenUsageDisplay({ tokens }: { tokens: ChatMessage['tokens'] }) {
  const theme = useTheme();
  if (!tokens) return null;
  return (
    <Text role="caption" color={theme.colors.text.tertiary}>
      {tokens.totalTokens} tokens · ${tokens.estimatedCost?.toFixed(4)}
    </Text>
  );
}

function CodeBlock({ language, code }: { language?: string; code: string }) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <Surface
      variant="default"
      padding={theme.spacing[3]}
      testID="code-block"
      accessibilityLabel={`Code block${language ? ` in ${language}` : ''}`}
    >
      <Stack spacing={theme.spacing[2]}>
        <Row justify="space-between" align="center">
          {language ? (
            <Text role="caption" color={theme.colors.text.secondary}>
              {language}
            </Text>
          ) : (
            <View />
          )}
          <Pressable
            onPress={handleCopy}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={copied ? 'Copied' : 'Copy code'}
          >
            <Row spacing={theme.spacing[1]} align="center">
              <RNText
                style={{
                  fontSize: 12,
                  color: copied ? theme.colors.success.default : theme.colors.text.tertiary,
                  fontFamily: theme.fontFamily.inter,
                }}
              >
                {copied ? '\u2713' : '\u2398'}
              </RNText>
              <Text
                role="caption"
                color={copied ? theme.colors.success.default : theme.colors.text.tertiary}
              >
                {copied ? 'Copied' : 'Copy'}
              </Text>
            </Row>
          </Pressable>
        </Row>
        <View
          style={{
            backgroundColor:
              theme.colorScheme === 'dark' ? theme.colors.neutral[900] : theme.colors.neutral[100],
            borderRadius: theme.radius.sm,
            padding: theme.spacing[3],
          }}
        >
          <RNText
            style={{
              fontSize: 13,
              fontFamily: theme.fontFamily.jetBrainsMono,
              color: theme.colors.text.primary,
              lineHeight: 20,
            }}
          >
            {code}
          </RNText>
        </View>
      </Stack>
    </Surface>
  );
}

function AnimatedCursor() {
  const theme = useTheme();
  return (
    <RNText
      style={{
        fontSize: 16,
        color: theme.colors.text.primary,
      }}
      accessibilityLabel="Streaming"
    >
      {'\u258A'}
    </RNText>
  );
}

function InlineContent({ text }: { text: string }) {
  const theme = useTheme();
  const segments = useMemo(() => parseBoldSegments(text), [text]);

  return (
    <RNText
      style={{
        fontSize: 16,
        fontFamily: theme.fontFamily.inter,
        lineHeight: 24,
        color: theme.colors.text.primary,
        flexShrink: 1,
      }}
    >
      {segments.map((seg, i) => (
        <RNText
          key={i}
          style={{
            fontWeight: seg.type === 'bold' ? theme.fontWeight.bold : theme.fontWeight.regular,
          }}
        >
          {seg.content}
        </RNText>
      ))}
    </RNText>
  );
}

function TextContent({ content }: { content: string }) {
  const theme = useTheme();
  const blocks = useMemo(() => extractCodeBlocks(content), [content]);

  return (
    <Stack spacing={theme.spacing[2]}>
      {blocks.map((block, i) => {
        if (block.type === 'code') {
          return <CodeBlock key={i} language={block.language} code={block.code} />;
        }
        const trimmed = block.code.trim();
        if (!trimmed) return null;
        return <InlineContent key={i} text={trimmed} />;
      })}
    </Stack>
  );
}

function UserBubble({ message }: { message: ChatMessage }) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: 'flex-end',
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[1],
      }}
      accessibilityLabel={`User message: ${message.content.substring(0, 100)}`}
      accessibilityRole="text"
    >
      <View
        style={{
          maxWidth: '80%',
          backgroundColor: theme.colors.primary[500],
          padding: theme.spacing[3],
          borderTopRightRadius: theme.radius.xs,
          borderTopLeftRadius: theme.radius.lg,
          borderBottomLeftRadius: theme.radius.lg,
          borderBottomRightRadius: theme.radius.lg,
        }}
      >
        <RNText
          style={{
            fontSize: 16,
            fontFamily: theme.fontFamily.inter,
            lineHeight: 24,
            color: theme.colors.text.onPrimary,
            flexShrink: 1,
          }}
        >
          {message.content}
        </RNText>
      </View>
      <Row spacing={theme.spacing[2]} align="center" style={{ marginTop: theme.spacing[0.5] }}>
        <TimestampDisplay timestamp={message.timestamp} />
      </Row>
    </View>
  );
}

function AssistantBubble({ message }: { message: ChatMessage }) {
  const theme = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[1],
      }}
      accessibilityLabel={`Assistant message: ${message.content.substring(0, 100)}`}
      accessibilityRole="text"
    >
      <View
        style={{
          maxWidth: '80%',
          backgroundColor: theme.colors.surface,
          padding: theme.spacing[3],
          borderTopLeftRadius: theme.radius.xs,
          borderTopRightRadius: theme.radius.lg,
          borderBottomRightRadius: theme.radius.lg,
          borderBottomLeftRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border.default,
        }}
      >
        <Stack spacing={theme.spacing[2]}>
          {message.status === 'error' ? (
            <Stack spacing={theme.spacing[2]}>
              <Text role="body" color={theme.colors.text.error}>
                {message.error || 'An error occurred'}
              </Text>
            </Stack>
          ) : (
            <>
              <TextContent content={message.content} />
              {message.status === 'streaming' && <AnimatedCursor />}
              {message.tokens && message.status === 'done' && (
                <>
                  <Divider />
                  <Row spacing={theme.spacing[2]} align="center">
                    <TokenUsageDisplay tokens={message.tokens} />
                  </Row>
                </>
              )}
            </>
          )}
        </Stack>
      </View>
      <Row spacing={theme.spacing[2]} align="center" style={{ marginTop: theme.spacing[0.5] }}>
        <TimestampDisplay timestamp={message.timestamp} />
        {message.status === 'streaming' && (
          <Text role="caption" color={theme.colors.text.tertiary}>
            Streaming...
          </Text>
        )}
        {message.status === 'sent' && (
          <Text role="caption" color={theme.colors.text.tertiary}>
            Sent
          </Text>
        )}
      </Row>
    </View>
  );
}

export function ChatBubble({ message }: ChatBubbleProps) {
  if (message.role === 'user') {
    return <UserBubble message={message} />;
  }
  return <AssistantBubble message={message} />;
}
