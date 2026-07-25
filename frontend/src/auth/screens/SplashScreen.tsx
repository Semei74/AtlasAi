import { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useTheme, Text, Stack, Container } from '../../../design-system';
import { useAuth } from '../auth-context';
import { tokenStorage } from '../token-storage';

const STATUS_MESSAGES = [
  'Loading resources...',
  'Connecting to server...',
  'Preparing your workspace...',
  'Almost ready...',
];

interface SplashScreenProps {
  onComplete: (destination: 'login' | 'onboarding' | 'tabs') => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const theme = useTheme();
  const { isAuthenticated, isRestoring } = useAuth();
  const [statusIndex, setStatusIndex] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const logoScale = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
    progressWidth.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimedOut(true);
    }, 10000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isRestoring) {
      const dest = isAuthenticated ? 'tabs' : 'login';
      const timer = setTimeout(() => onComplete(dest), 500);
      return () => clearTimeout(timer);
    }
  }, [isRestoring, isAuthenticated, onComplete]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoScale.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  return (
    <Container flex={1} center>
      <Stack spacing={8} align="center" style={styles.container}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.logoContainer}>
          <Animated.View style={[styles.logo, { backgroundColor: theme.colors.primary[500] }, logoStyle]}>
            <Text role="display" color={theme.colors.neutral[50]} style={styles.logoText}>
              A
            </Text>
          </Animated.View>
        </Animated.View>

        <Text role="heading2" color={theme.colors.text.primary} style={styles.title}>
          Atlas AI
        </Text>
        <Text role="bodySmall" color={theme.colors.text.secondary}>
          Enterprise Material Management
        </Text>

        <Stack spacing={4} align="center" style={styles.progressSection}>
          <Animated.View
            style={[
              styles.progressTrack,
              { backgroundColor: theme.colors.neutral[200] },
            ]}
          >
            <Animated.View
              style={[
                styles.progressBar,
                { backgroundColor: theme.colors.primary[500] },
                progressStyle,
              ]}
            />
          </Animated.View>

          <Animated.View key={statusIndex} entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
            <Text role="caption" color={theme.colors.text.tertiary}>
              {timedOut ? 'Taking longer than expected...' : STATUS_MESSAGES[statusIndex]}
            </Text>
          </Animated.View>
        </Stack>

        <Text role="caption" color={theme.colors.text.tertiary} style={styles.version}>
          Version 1.0.0
        </Text>
      </Stack>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
  },
  title: {
    marginBottom: 4,
  },
  progressSection: {
    marginTop: 48,
    width: 240,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  version: {
    position: 'absolute',
    bottom: 40,
  },
});
