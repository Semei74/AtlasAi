import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import {
  useTheme,
  Text,
  Button,
  Input,
  Stack,
  useReducedMotion,
} from '../../../design-system';
import { AuthTemplate } from '../../templates';
import { registerSchema, type RegisterFormData } from '../schemas';
import { useAuth } from '../auth-context';
import { useRegisterMutation } from '../auth-hooks';
import { AuthApiError } from '../auth-api';

interface RegisterScreenProps {
  onNavigateLogin: () => void;
  onSuccess: () => void;
}

const PASSWORD_STRENGTH_LABELS = ['Weak', 'Medium', 'Strong', 'Very Strong'];
const PASSWORD_STRENGTH_COLORS = {
  weak: '#EF4444',
  medium: '#F59E0B',
  strong: '#10B981',
  veryStrong: '#059669',
};

function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(Math.floor(score / 2), 3);
}

function getStrengthColor(strength: number): string {
  const colors = [
    PASSWORD_STRENGTH_COLORS.weak,
    PASSWORD_STRENGTH_COLORS.medium,
    PASSWORD_STRENGTH_COLORS.strong,
    PASSWORD_STRENGTH_COLORS.veryStrong,
  ];
  return colors[strength] ?? PASSWORD_STRENGTH_COLORS.weak;
}

export function RegisterScreen({
  onNavigateLogin,
  onSuccess,
}: RegisterScreenProps) {
  const theme = useTheme();
  const { setAuthState } = useAuth();
  const registerMutation = useRegisterMutation();
  const reducedMotion = useReducedMotion();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
    mode: 'onBlur',
  });

  const passwordValue = watch('password');
  const strength = passwordValue ? getPasswordStrength(passwordValue) : -1;
  const strengthColor = strength >= 0 ? getStrengthColor(strength) : undefined;
  const serverError =
    registerMutation.error instanceof AuthApiError
      ? registerMutation.error.status === 409
        ? 'An account with this email already exists. Sign in instead.'
        : registerMutation.error.message
      : registerMutation.error
        ? 'Unable to connect. Check your internet connection and try again.'
        : null;

  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      try {
        const response = await registerMutation.mutateAsync({
          displayName: data.displayName,
          email: data.email,
          password: data.password,
          deviceName: 'mobile',
          devicePlatform: 'ios',
        });
        await setAuthState(response.user, response.accessToken);
        onSuccess();
      } catch (err) {
        if (err instanceof AuthApiError && err.status === 422) {
          setError('email', { message: 'Enter a valid email address' });
        }
      }
    },
    [registerMutation, setAuthState, onSuccess, setError],
  );

  return (
    <AuthTemplate
      title="Create account"
      subtitle="Join Atlas AI"
      footer={
        <Button variant="ghost" size="sm" onPress={onNavigateLogin}>
          Already have an account? Sign in
        </Button>
      }
    >
      <Animated.View entering={FadeIn.duration(reducedMotion ? 0 : 300)}>
        <Stack spacing={6}>
          <Controller
            control={control}
            name="displayName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorMessage={errors.displayName?.message}
                state={errors.displayName ? 'error' : 'default'}
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Work Email"
                placeholder="Enter your work email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorMessage={errors.email?.message}
                state={errors.email ? 'error' : 'default'}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="Create a password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorMessage={errors.password?.message}
                state={errors.password ? 'error' : 'default'}
                type="password"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
              />
            )}
          />

          {strength >= 0 && (
            <Stack spacing={2}>
              <Stack spacing={1} style={styles.strengthBarRow}>
                {[0, 1, 2, 3].map((i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.strengthSegment,
                      {
                        backgroundColor:
                          i <= strength ? strengthColor : theme.colors.neutral[200],
                      },
                    ]}
                  />
                ))}
              </Stack>
              <Text role="caption" color={strengthColor}>
                {PASSWORD_STRENGTH_LABELS[strength]}
              </Text>
            </Stack>
          )}

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorMessage={errors.confirmPassword?.message}
                state={errors.confirmPassword ? 'error' : 'default'}
                type="password"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
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
            loading={registerMutation.isPending}
            disabled={registerMutation.isPending}
            onPress={handleSubmit(onSubmit)}
          >
            {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
          </Button>
        </Stack>
      </Animated.View>
    </AuthTemplate>
  );
}

const styles = {
  strengthBarRow: { flexDirection: 'row' as const, gap: 4 },
  strengthSegment: { flex: 1, height: 4, borderRadius: 2 },
  errorBanner: { textAlign: 'center' as const, paddingVertical: 8, borderRadius: 8, overflow: 'hidden' as const },
};
