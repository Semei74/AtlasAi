import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Loader, Text } from '../../design-system';

interface OverlayLoaderProps {
  visible: boolean;
  message?: string;
}

export function OverlayLoader({ visible, message = 'Please wait...' }: OverlayLoaderProps) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={styles.overlay}
    >
      <View style={styles.content}>
        <Loader size={40} color="#FFFFFF" />
        {message && (
          <>
            <View style={{ height: 12 }} />
            <Text role="body" color="#FFFFFF">
              {message}
            </Text>
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
