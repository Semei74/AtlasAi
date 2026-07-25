import { useCallback, useState } from 'react';
import {
  View,
  Pressable,
  TextInput,
  Text as RNText,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useTheme } from '../../../design-system/hooks/useTheme';
import { Text } from '../../../design-system/components/Text';
import { Row } from '../../../design-system/components/Row';
import { Badge } from '../../../design-system/components/Badge';

interface ChatHeaderProps {
  title: string;
  model: string;
  provider: string;
  pinned: boolean;
  onBack: () => void;
  onRename: (title: string) => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
}

function RenameModal({
  visible,
  currentTitle,
  onSave,
  onClose,
}: {
  visible: boolean;
  currentTitle: string;
  onSave: (title: string) => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  const [editText, setEditText] = useState(currentTitle);

  const handleSave = useCallback(() => {
    const trimmed = editText.trim();
    if (trimmed) {
      onSave(trimmed);
    }
    onClose();
  }, [editText, onSave, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.overlay,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: theme.colors.surfaceElevated,
                borderRadius: theme.radius.xl,
                padding: theme.spacing[6],
                width: '80%',
                maxWidth: 400,
              }}
              accessibilityLabel="Rename conversation"
            >
              <Text role="heading6" color={theme.colors.text.primary}>
                Rename
              </Text>
              <View
                style={{
                  marginTop: theme.spacing[4],
                  backgroundColor: theme.colors.bg.secondary,
                  borderRadius: theme.radius.md,
                  borderWidth: 1,
                  borderColor: theme.colors.border.default,
                  paddingHorizontal: theme.spacing[3],
                  paddingVertical: theme.spacing[2],
                }}
              >
                <TextInput
                  value={editText}
                  onChangeText={setEditText}
                  placeholder="Conversation name"
                  placeholderTextColor={theme.colors.text.tertiary}
                  autoFocus
                  onSubmitEditing={handleSave}
                  returnKeyType="done"
                  style={{
                    fontSize: 16,
                    fontFamily: theme.fontFamily.inter,
                    color: theme.colors.text.primary,
                    padding: 0,
                    margin: 0,
                  }}
                  accessibilityLabel="Conversation name input"
                />
              </View>
              <Row spacing={theme.spacing[3]} justify="flex-end" style={{ marginTop: theme.spacing[5] }}>
                <Pressable
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel rename"
                  style={{
                    paddingHorizontal: theme.spacing[4],
                    paddingVertical: theme.spacing[2],
                    borderRadius: theme.radius.md,
                  }}
                >
                  <Text role="button" color={theme.colors.text.secondary}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  accessibilityRole="button"
                  accessibilityLabel="Save name"
                  style={{
                    paddingHorizontal: theme.spacing[4],
                    paddingVertical: theme.spacing[2],
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.colors.primary[500],
                  }}
                >
                  <Text role="button" color={theme.colors.text.onPrimary}>
                    Save
                  </Text>
                </Pressable>
              </Row>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export function ChatHeader({
  title,
  model,
  provider,
  pinned,
  onBack,
  onRename,
  onTogglePin,
  onToggleArchive,
  onDelete,
}: ChatHeaderProps) {
  const theme = useTheme();
  const [renameVisible, setRenameVisible] = useState(false);

  const handleTitlePress = useCallback(() => {
    setRenameVisible(true);
  }, []);

  const handleRename = useCallback(
    (newTitle: string) => {
      onRename(newTitle);
    },
    [onRename],
  );

  const handleCloseRename = useCallback(() => {
    setRenameVisible(false);
  }, []);

  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
      <View
        style={{
          paddingHorizontal: theme.spacing[4],
          paddingVertical: theme.spacing[3],
          backgroundColor: theme.colors.bg.primary,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.default,
        }}
        accessibilityLabel="Conversation header"
        accessibilityRole="header"
      >
        <Row spacing={theme.spacing[3]} align="center" justify="space-between">
          <Row spacing={theme.spacing[3]} align="center" style={{ flex: 1 }}>
            <Pressable
              onPress={onBack}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <RNText
                style={{
                  fontSize: 22,
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.inter,
                  lineHeight: 24,
                }}
              >
                {'\u2190'}
              </RNText>
            </Pressable>
            <Pressable
              onPress={handleTitlePress}
              style={{ flex: 1 }}
              accessibilityRole="button"
              accessibilityLabel="Tap to rename conversation"
            >
              <Text
                role="heading6"
                color={theme.colors.text.primary}
                numberOfLines={1}
              >
                {title}
              </Text>
            </Pressable>
          </Row>
          <Row spacing={theme.spacing[2]} align="center">
            <Badge
              label={`${provider} / ${model}`}
              size="sm"
              color="outline"
              accessibilityLabel={`Model: ${provider} ${model}`}
            />
          </Row>
        </Row>
        <Row spacing={theme.spacing[1]} justify="flex-end" style={{ marginTop: theme.spacing[2] }}>
          <Pressable
            onPress={onTogglePin}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={pinned ? 'Unpin conversation' : 'Pin conversation'}
            style={{
              width: 36,
              height: 36,
              borderRadius: theme.radius.md,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pinned ? theme.colors.primary[50] : 'transparent',
            }}
          >
            <RNText
              style={{
                fontSize: 14,
                color: pinned ? theme.colors.primary[600] : theme.colors.text.secondary,
                fontFamily: theme.fontFamily.inter,
                fontWeight: theme.fontWeight.medium,
              }}
            >
              {pinned ? 'Unpin' : 'Pin'}
            </RNText>
          </Pressable>
          <Pressable
            onPress={onToggleArchive}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Archive conversation"
            style={{
              width: 36,
              height: 36,
              borderRadius: theme.radius.md,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RNText
              style={{
                fontSize: 12,
                color: theme.colors.text.secondary,
                fontFamily: theme.fontFamily.inter,
                fontWeight: theme.fontWeight.medium,
              }}
            >
              Archive
            </RNText>
          </Pressable>
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Delete conversation"
            style={{
              width: 36,
              height: 36,
              borderRadius: theme.radius.md,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RNText
              style={{
                fontSize: 12,
                color: theme.colors.error.default,
                fontFamily: theme.fontFamily.inter,
                fontWeight: theme.fontWeight.medium,
              }}
            >
              Delete
            </RNText>
          </Pressable>
        </Row>
      </View>
      <RenameModal
        visible={renameVisible}
        currentTitle={title}
        onSave={handleRename}
        onClose={handleCloseRename}
      />
    </Animated.View>
  );
}
