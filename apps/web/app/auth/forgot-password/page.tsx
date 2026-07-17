"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Heading, Input, Stack, Text } from "@atlas/ui";
import { forgotPasswordRequest } from "../../../lib/auth-api";
import { forgotPasswordSchema, type ForgotPasswordValues } from "../../../lib/auth-schemas";

export default function ForgotPasswordPage(): React.ReactElement {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: async (values: ForgotPasswordValues) => {
      return await forgotPasswordRequest(values);
    },
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const submit = handleSubmit((values: ForgotPasswordValues) => {
    void mutation.mutateAsync(values);
  });

  if (submitted) {
    return (
      <Stack flex={1} alignItems="center" justifyContent="center" padding="$4">
        <Card padding="$6" width="100%" maxWidth={400} gap="$4">
          <Heading level={1}>Check your inbox</Heading>
          <Text color="$gray11">
            If an account exists for that email, we sent instructions to reset your password.
          </Text>
          <Link href="/auth/login">
            <Text color="$blue10">Back to sign in</Text>
          </Link>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack flex={1} alignItems="center" justifyContent="center" padding="$4">
      <Card padding="$6" width="100%" maxWidth={400} gap="$4">
        <Heading level={1}>Reset your password</Heading>
        <Text color="$gray11">Enter your email and we'll send reset instructions.</Text>

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

          <Button
            type="submit"
            disabled={mutation.isPending}
            opacity={mutation.isPending ? 0.6 : 1}
          >
            {mutation.isPending ? "Sending…" : "Send reset link"}
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
