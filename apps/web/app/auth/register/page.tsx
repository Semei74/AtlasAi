"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@atlas/auth";
import { Button, Card, Heading, Input, Stack, Text } from "@atlas/ui";
import { registerRequest } from "../../../lib/auth-api";
import { registerSchema, type RegisterValues } from "../../../lib/auth-schemas";

export default function RegisterPage(): React.ReactElement {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: "", email: "", password: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: async (values: RegisterValues) => {
      return await registerRequest(values);
    },
    onSuccess: (data) => {
      login(data.accessToken, data.user);
      router.replace("/dashboard");
    },
    onError: (error) => {
      setServerError(error instanceof Error ? error.message : "Registration failed");
    },
  });

  const submit = handleSubmit((values: RegisterValues) => {
    setServerError(null);
    void mutation.mutateAsync(values);
  });

  return (
    <Stack flex={1} alignItems="center" justifyContent="center" padding="$4">
      <Card padding="$6" width="100%" maxWidth={400} gap="$4">
        <Heading level={1}>Create your account</Heading>
        <Text color="$gray11">Start using Atlas in a few seconds.</Text>

        <form
          onSubmit={(event) => {
            void submit(event);
          }}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <Stack gap="$2">
            <Text>Name</Text>
            <Input placeholder="Jane Doe" {...register("displayName")} />
            {errors.displayName ? <Text color="$red10">{errors.displayName.message}</Text> : null}
          </Stack>

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
              autoComplete="new-password"
              secureTextEntry
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password ? <Text color="$red10">{errors.password.message}</Text> : null}
          </Stack>

          <Stack gap="$2">
            <Text>Confirm password</Text>
            <Input
              autoComplete="new-password"
              secureTextEntry
              placeholder="••••••••"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword ? (
              <Text color="$red10">{errors.confirmPassword.message}</Text>
            ) : null}
          </Stack>

          {serverError ? <Text color="$red10">{serverError}</Text> : null}

          <Button
            type="submit"
            disabled={mutation.isPending}
            opacity={mutation.isPending ? 0.6 : 1}
          >
            {mutation.isPending ? "Creating…" : "Create account"}
          </Button>
        </form>

        <Stack flexDirection="row" justifyContent="center">
          <Link href="/auth/login">
            <Text color="$blue10">Back to sign in</Text>
          </Link>
        </Stack>
      </Card>
    </Stack>
  );
}
