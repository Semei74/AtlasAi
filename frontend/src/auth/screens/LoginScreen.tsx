import { useCallback } from 'react';
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
import { loginSchema, type LoginFormData } from '../schemas';
import { useAuth } from '../auth-context';
import { useLoginMutation } from '../auth-hooks';
import { AuthApiError } from '../auth-api';

interface LoginScreenProps {
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
  onSuccess: () => void;
}

export function LoginScreen({
  onNavigateRegister,
  onNavigateForgotPassword,
  onSuccess,
}: LoginScreenProps) {
  const theme = useTheme();
  const { setAuthState } = useAuth();
  const loginMutation = useLoginMutation();
  const reducedMotion = useReducedMotion();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
    mode: 'onBlur',
  });

  const serverError =
    loginMutation.error instanceof AuthApiError
      ? loginMutation.error.code === 'ACCOUNT_LOCKED'
        ? 'Account locked. Contact your administrator.'
        : loginMutation.error.status === 429
          ? 'Too many attempts. Try again later.'
          : 'Invalid email or password.'
      : loginMutation.error
        ? 'Unable to connect. Check your internet connection and try again.'
        : null;

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      try {
        const response = await loginMutation.mutateAsync({
          email: data.email,
          password: data.password,
          deviceName: 'mobile',
          devicePlatform: 'ios',
          rememberMe: data.rememberMe,
        });
        await setAuthState(response.user, response.accessToken);
        onSuccess();
      } catch (err) {
        if (err instanceof AuthApiError && err.status === 422) {
          setError('email', { message: 'Enter a valid email address' });
        }
      }
    },
    [loginMutation, setAuthState, onSuccess, setError],
  );

  const animDuration = reducedMotion ? 0 : 300;

  return (
    <AuthTemplate
      title="Welcome back"
      subtitle="Sign in to your Atlas AI account"
      footer={
        <Text role="caption" color={theme.colors.text.tertiary} align="center">
          By signing in, you agree to our Terms of Service
        </Text>
      }
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
                textContentType="emailAddress"
                returnKeyType="next"
                accessibilityLabel="Email address"
                accessibilityHint="Enter your registered email address"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="Enter your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorMessage={errors.password?.message}
                state={errors.password ? 'error' : 'default'}
                type="password"
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={() => handleSubmit(onSubmit)()}
                accessibilityLabel="Password"
                accessibilityHint="Enter your password"
              />
            )}
          />

          {serverError && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
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
            loading={loginMutation.isPending}
            disabled={loginMutation.isPending}
            onPress={handleSubmit(onSubmit)}
            accessibilityLabel="Sign in"
            accessibilityHint="Tap to sign in to your account"
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
          </Button>

          <Stack spacing={3} align="center">
            <Button
              variant="ghost"
              size="sm"
              onPress={onNavigateForgotPassword}
              accessibilityLabel="Forgot password"
              accessibilityHint="Tap to reset your password"
            >
              Forgot password?
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onPress={onNavigateRegister}
              accessibilityLabel="Create account"
              accessibilityHint="Tap to create a new account"
            >
              Don't have an account? Sign up
            </Button>
          </Stack>
        </Stack>
      </Animated.View>
    </AuthTemplate>
  );
}

const styles = { errorBanner: { textAlign: 'center' as const, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, overflow: 'hidden' as const } };
