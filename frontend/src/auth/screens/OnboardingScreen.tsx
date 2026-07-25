import { useState, useCallback } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import {
  useTheme,
  Text,
  Button,
  Stack,
  Row,
  Container,
  Surface,
  useReducedMotion,
} from '../../../design-system';

const STEPS = [
  {
    title: 'Welcome to Atlas AI',
    description: 'Your AI-powered workspace for enterprise material management. Manage, track, and optimize your materials with intelligence.',
    emoji: '🚀',
  },
  {
    title: 'Manage Materials',
    description: 'Track, issue, and return materials with ease. Scan QR codes for instant updates and real-time inventory visibility.',
    emoji: '📦',
  },
  {
    title: 'AI-Powered Insights',
    description: 'Get smart recommendations, automate workflows, and chat with Atlas AI to make data-driven decisions faster.',
    emoji: '🤖',
  },
  {
    title: 'Your Workspace',
    description: 'Select your role, customize your workspace, and invite your team to collaborate on material management.',
    emoji: '⚙️',
  },
  {
    title: "You're All Set!",
    description: 'Your workspace is ready. Start managing materials, collaborating with your team, and leveraging AI insights.',
    emoji: '🎉',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingScreen({ onComplete, onSkip }: OnboardingScreenProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [showConfirmSkip, setShowConfirmSkip] = useState(false);

  const isLastStep = step === STEPS.length - 1;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      setStep((prev) => prev + 1);
    }
  }, [isLastStep, onComplete]);

  const handleSkip = useCallback(() => {
    setShowConfirmSkip(true);
  }, []);

  const confirmSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  const cancelSkip = useCallback(() => {
    setShowConfirmSkip(false);
  }, []);

  const currentStep = STEPS[step];
  const animDuration = reducedMotion ? 0 : 300;

  return (
    <Container flex={1}>
      <Row justify="space-between" align="center" style={styles.topBar}>
        <Text role="label" color={theme.colors.text.tertiary}>
          Atlas AI
        </Text>
        {!showConfirmSkip && (
          <Button variant="ghost" size="sm" onPress={handleSkip}>
            Skip
          </Button>
        )}
      </Row>

      <Stack flex={1} align="center" justify="center" spacing={8}>
        <Animated.View
          key={`step-${step}`}
          entering={reducedMotion ? FadeIn.duration(0) : SlideInRight.duration(animDuration)}
          exiting={reducedMotion ? FadeOut.duration(0) : SlideOutLeft.duration(animDuration)}
          style={styles.stepContent}
        >
          <Stack spacing={6} align="center">
            <Surface
              variant="elevated"
              padding="xl"
              style={[styles.illustration, { backgroundColor: theme.colors.primary[50] }]}
            >
              <Text role="display" style={styles.emoji}>
                {currentStep.emoji}
              </Text>
            </Surface>

            <Text role="heading3" color={theme.colors.text.primary} align="center">
              {currentStep.title}
            </Text>

            <Text role="body" color={theme.colors.text.secondary} align="center">
              {currentStep.description}
            </Text>
          </Stack>
        </Animated.View>

        <Row spacing={4} justify="center" style={styles.dots}>
          {STEPS.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === step
                      ? theme.colors.primary[500]
                      : theme.colors.neutral[300],
                  width: index === step ? 24 : 8,
                },
              ]}
            />
          ))}
        </Row>
      </Stack>

      {showConfirmSkip ? (
        <Surface padding="md" variant="outlined" style={styles.confirmSkip}>
          <Stack spacing={4}>
            <Text role="body" color={theme.colors.text.primary}>
              Are you sure? You can always access onboarding from Settings.
            </Text>
            <Row spacing={3}>
              <Button variant="ghost" size="sm" onPress={cancelSkip}>
                Stay
              </Button>
              <Button variant="primary" size="sm" onPress={confirmSkip}>
                Skip
              </Button>
            </Row>
          </Stack>
        </Surface>
      ) : (
        <Row spacing={3} style={styles.actions}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleNext}
          >
            {isLastStep ? 'Get Started' : 'Next'}
          </Button>
        </Row>
      )}
    </Container>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  topBar: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  stepContent: {
    width: width - 64,
    maxWidth: 480,
    alignItems: 'center',
  },
  illustration: {
    width: 200,
    height: 200,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 64,
  },
  dots: {
    marginTop: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  actions: {
    paddingVertical: 24,
  },
  confirmSkip: {
    marginVertical: 16,
  },
});
