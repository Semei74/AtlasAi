import { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import {
  useTheme,
  Text,
  Button,
  Stack,
  useReducedMotion,
} from '../../../design-system';
import { AuthTemplate } from '../../templates';
import { useVerifyEmailMutation } from '../auth-hooks';
import { AuthApiError } from '../auth-api';

interface OTPVerificationScreenProps {
  email: string;
  context: 'registration' | 'password_reset';
  onVerified: () => void;
  onBack: () => void;
}

const OTP_LENGTH = 6;

export function OTPVerificationScreen({
  email,
  context,
  onVerified,
  onBack,
}: OTPVerificationScreenProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const verifyMutation = useVerifyEmailMutation();
  const [otpValues, setOtpValues] = useState<string[]>(
    Array(OTP_LENGTH).fill(''),
  );
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeValue = useSharedValue(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeValue.value }],
  }));

  const triggerShake = useCallback(() => {
    shakeValue.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [shakeValue]);

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  const handleInputChange = useCallback(
    (text: string, index: number) => {
      const digit = text.replace(/[^0-9]/g, '');
      if (digit.length > 1) {
        // Handle paste — fill all boxes
        const pastedDigits = digit.slice(0, OTP_LENGTH).split('');
        const newValues = [...otpValues];
        pastedDigits.forEach((d, i) => {
          if (i < OTP_LENGTH) newValues[i] = d;
        });
        setOtpValues(newValues);
        inputRefs.current[Math.min(pastedDigits.length, OTP_LENGTH - 1)]?.focus();
        return;
      }

      const newValues = [...otpValues];
      newValues[index] = digit;
      setOtpValues(newValues);

      if (digit && index < OTP_LENGTH - 1) {
        focusInput(index + 1);
      }
    },
    [otpValues, focusInput],
  );

  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
      if (e.nativeEvent.key === 'Backspace' && !otpValues[index] && index > 0) {
        const newValues = [...otpValues];
        newValues[index - 1] = '';
        setOtpValues(newValues);
        focusInput(index - 1);
      }
    },
    [otpValues, focusInput],
  );

  const code = otpValues.join('');
  const isComplete = code.length === OTP_LENGTH;

  const serverError =
    verifyMutation.error instanceof AuthApiError
      ? verifyMutation.error.code === 'TOKEN_EXPIRED'
        ? 'Code expired. Request a new one.'
        : verifyMutation.error.status === 429
          ? 'Too many attempts. Request a new code.'
          : 'Invalid code. Try again.'
      : verifyMutation.error
        ? 'Unable to connect. Check your internet connection and try again.'
        : null;

  const onSubmit = useCallback(async () => {
    if (!isComplete || verifyMutation.isPending) return;
    try {
      await verifyMutation.mutateAsync({ token: code });
      onVerified();
    } catch {
      triggerShake();
      setOtpValues(Array(OTP_LENGTH).fill(''));
      focusInput(0);
    }
  }, [code, isComplete, verifyMutation, onVerified, triggerShake, focusInput]);

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || verifyMutation.isPending) return;
    setOtpValues(Array(OTP_LENGTH).fill(''));
    focusInput(0);
    setResendCooldown(60);
  }, [resendCooldown, verifyMutation.isPending, focusInput]);

  const title =
    context === 'registration' ? 'Verify your email' : 'Reset password';
  const subtitle = `Enter the 6-digit code sent to ${email}`;

  return (
    <AuthTemplate title={title} subtitle={subtitle}>
      <Stack spacing={6} align="center">
        <Animated.View style={[styles.otpRow, shakeStyle]}>
          {otpValues.map((digit, index) => (
            <Animated.View
              key={index}
              entering={
                reducedMotion
                  ? FadeIn.duration(0)
                  : FadeIn.duration(200).delay(index * 50)
              }
            >
              <TextInput
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  {
                    borderColor: digit
                      ? theme.colors.primary[500]
                      : theme.colors.border.default,
                    backgroundColor: theme.colors.bg.primary,
                    color: theme.colors.text.primary,
                  },
                ]}
                value={digit}
                onChangeText={(text) => handleInputChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                selectTextOnFocus
                accessibilityLabel={`Verification code input ${index + 1} of ${OTP_LENGTH}`}
                accessibilityHint="Enter the digit shown in your verification code"
              />
            </Animated.View>
          ))}
        </Animated.View>

        {serverError && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <Text
              role="caption"
              color={theme.colors.error[700]}
              style={[
                styles.errorText,
                { backgroundColor: theme.colors.error[50] },
              ]}
            >
              {serverError}
            </Text>
          </Animated.View>
        )}

        <Button
          variant="ghost"
          size="sm"
          onPress={handleResend}
          disabled={resendCooldown > 0 || verifyMutation.isPending}
        >
          {resendCooldown > 0
            ? `Resend in ${resendCooldown}s`
            : "Didn't receive it? Resend"}
        </Button>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isComplete || verifyMutation.isPending}
          loading={verifyMutation.isPending}
          onPress={onSubmit}
        >
          Verify Code
        </Button>

        <Button variant="ghost" size="sm" onPress={onBack}>
          Back
        </Button>
      </Stack>
    </AuthTemplate>
  );
}

const styles = StyleSheet.create({
  otpRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  otpInput: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 12,
  },
});
