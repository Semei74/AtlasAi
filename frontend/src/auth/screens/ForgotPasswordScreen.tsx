import { useState, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
} from 'react-native-reanimated';
import {
  useTheme,
  Text,
  Button,
  Input,
  Stack,
  Icon,
  useReducedMotion,
} from '../../../design-system';
import { AuthTemplate } from '../../templates';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../schemas';
import { useForgotPasswordMutation } from '../auth-hooks';
import { AuthApiError } from '../auth-api';
import { tokenStorage } from '../token-storage';

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordScreen({
  onBackToLogin,
}: ForgotPasswordScreenProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const serverError =
    forgotPasswordMutation.error instanceof AuthApiError
      ? forgotPasswordMutation.error.status === 429
        ? 'Too many requests. Try again later.'
        : 'No account found with this email.'
      : forgotPasswordMutation.error
        ? 'Unable to connect. Check your internet connection and try again.'
        : null;

  const onSubmit = useCallback(
    async (data: ForgotPasswordFormData) => {
      try {
        await forgotPasswordMutation.mutateAsync({ email: data.email });
        setSubmittedEmail(data.email);
        await tokenStorage.setLastEmail(data.email);
        setStep('success');
        setResendCooldown(60);
      } catch {
        // Error handled by mutation state
      }
    },
    [forgotPasswordMutation],
  );

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || forgotPasswordMutation.isPending) return;
    try {
      await forgotPasswordMutation.mutateAsync({ email: submittedEmail });
      setResendCooldown(60);
    } catch {
      // Error handled by mutation state
    }
  }, [resendCooldown, forgotPasswordMutation, submittedEmail]);

  const animDuration = reducedMotion ? 0 : 300;

  if (step === 'success') {
    return (
      <AuthTemplate
        title="Check your email"
        subtitle={`We sent a reset link to ${submittedEmail}`}
      >
        <Animated.View
          entering={reducedMotion ? FadeIn.duration(0) : SlideInUp.duration(animDuration)}
          exiting={reducedMotion ? FadeOut.duration(0) : SlideOutDown.duration(animDuration)}
        >
          <Stack spacing={6} align="center">
            <Icon size={48} color={theme.colors.success[500]} />

            <Text role="body" color={theme.colors.text.secondary} align="center">
              Can't find the email? Check your spam folder.
            </Text>

            {serverError && (
              <Text role="caption" color={theme.colors.error[700]}>
                {serverError}
              </Text>
            )}

            <Button
              variant="ghost"
              size="sm"
              onPress={handleResend}
              disabled={resendCooldown > 0 || forgotPasswordMutation.isPending}
              loading={forgotPasswordMutation.isPending}
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend'}
            </Button>

            <Button
              variant="outline"
              size="md"
              fullWidth
              onPress={onBackToLogin}
            >
              Back to Login
            </Button>
          </Stack>
        </Animated.View>
      </AuthTemplate>
    );
  }

  return (
    <AuthTemplate
      title="Reset password"
      subtitle="Enter your email and we'll send you a reset link."
    >
      <Animated.View
        entering={FadeIn.duration(animDuration)}
        exiting={FadeOut.duration(animDuration)}
      >
        <Stack spacing={6}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="Enter your email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorMessage={errors.email?.message}
                state={errors.email ? 'error' : 'default'}
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="done"
                onSubmitEditing={() => handleSubmit(onSubmit)()}
              />
            )}
          />

          {serverError && (
            <Animated.View entering={FadeIn}>
              <Text
                role="caption"
                color={theme.colors.error[700]}
                style={[
                  styles.errorBanner,
                  { backgroundColor: theme.colors.error[50] },
                ]}
              >
                {serverError}
              </Text>
            </Animated.View>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={forgotPasswordMutation.isPending}
            disabled={forgotPasswordMutation.isPending}
            onPress={handleSubmit(onSubmit)}
          >
            {forgotPasswordMutation.isPending ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <Button variant="ghost" size="sm" onPress={onBackToLogin}>
            Back to Login
          </Button>
        </Stack>
      </Animated.View>
    </AuthTemplate>
  );
}

const styles = {
  errorBanner: { textAlign: 'center' as const, paddingVertical: 8, borderRadius: 8, overflow: 'hidden' as const },
};
