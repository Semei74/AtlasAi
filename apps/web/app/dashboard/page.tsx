"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore, AuthGuard } from "@atlas/auth";
import { Avatar, Button, Card, Heading, Stack, Text } from "@atlas/ui";
import { logoutRequest } from "../../lib/auth-api";

function DashboardContent(): React.ReactElement {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logoutRequest();
    },
    onSettled: () => {
      logout();
      router.replace("/auth/login");
    },
  });

  return (
    <Stack flex={1} padding="$6" gap="$4" maxWidth={720} alignSelf="center" width="100%">
      <Stack flexDirection="row" alignItems="center" justifyContent="space-between" gap="$4">
        <Heading level={1}>Dashboard</Heading>
        <Button
          color="$red10"
          disabled={logoutMutation.isPending}
          onPress={() => {
            logoutMutation.mutate();
          }}
        >
          {logoutMutation.isPending ? "Signing out…" : "Sign out"}
        </Button>
      </Stack>

      <Card padding="$5" gap="$3">
        <Stack flexDirection="row" alignItems="center" gap="$3">
          <Avatar circular size="$5" />
          <Stack gap="$1">
            <Text fontWeight="700">{user?.displayName ?? "User"}</Text>
            <Text color="$gray11">{user?.email ?? ""}</Text>
          </Stack>
        </Stack>
        <Text color="$gray11">
          You are signed in to Atlas. This area is protected by AuthGuard.
        </Text>
      </Card>
    </Stack>
  );
}

export default function DashboardPage(): React.ReactElement {
  return (
    <AuthGuard
      fallback={
        <Stack flex={1} alignItems="center" justifyContent="center">
          <Text color="$gray11">Redirecting to sign in…</Text>
        </Stack>
      }
    >
      <DashboardContent />
    </AuthGuard>
  );
}
