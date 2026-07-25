"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@atlas/auth";
import { Button, Card, Heading, Input, Stack, Text } from "@atlas/ui";
import { loginRequest } from "../../../lib/auth-api";
import { loginSchema, type LoginValues } from "../../../lib/auth-schemas";

export default function LoginPage(): React.ReactElement {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: async (values: LoginValues) => {
      return await loginRequest(values);
    },
    onSuccess: (data) => {
      login(data.accessToken, data.user);
      router.replace("/dashboard");
    },
    onError: (error) => {
      setServerError(error instanceof Error ? error.message : "Login failed");
    },
  });

  const submit = handleSubmit((values: LoginValues) => {
    setServerError(null);
    void mutation.mutateAsync(values);
  });

  return (
    <Stack flex={1} alignItems="center" justifyContent="center" padding="$4">
      <Card padding="$6" width="100%" maxWidth={400} gap="$4">
        <Heading level={1}>Sign in to Atlas</Heading>
        <Text color="$gray11">Use your email and password to continue.</Text>

        <form
          onSubmit={(event) => {
            void submit(event);
          }}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <Stack gap="$2">
            <Text>Email</Text>
            <Input
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email ? <Text color="$red10">{errors.email.message}</Text> : null}
          </Stack>

          <Stack gap="$2">
            <Text>Password</Text>
            <Input
              autoComplete="current-password"
              secureTextEntry
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password ? <Text color="$red10">{errors.password.message}</Text> : null}
          </Stack>

          {serverError ? <Text color="$red10">{serverError}</Text> : null}

          <Button
            type="submit"
            disabled={mutation.isPending}
            opacity={mutation.isPending ? 0.6 : 1}
          >
            {mutation.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <Stack flexDirection="row" justifyContent="space-between">
          <Link href="/auth/forgot-password">
            <Text color="$blue10">Forgot password?</Text>
          </Link>
          <Link href="/auth/register">
            <Text color="$blue10">Create account</Text>
          </Link>
        </Stack>
      </Card>
    </Stack>
  );
}
