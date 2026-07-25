"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@atlas/auth";
import { Avatar, Button, Heading, Stack, Text } from "@atlas/ui";
import { logoutRequest } from "../../lib/auth-api";
import { trackEvent } from "@atlas/observability";

export function Header(): React.ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logoutRequest();
    },
    onSettled: () => {
      trackEvent("user_logged_out");
      queryClient.clear();
      logout();
      router.replace("/auth/login");
    },
  });

  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      padding="$4"
      borderBottomWidth={1}
      borderColor="$border"
      backgroundColor="$background"
    >
      <Heading level={2}>Dashboard</Heading>
      <Stack flexDirection="row" alignItems="center" gap="$3">
        <Stack flexDirection="row" alignItems="center" gap="$2">
          <Avatar circular size="$3" />
          <Stack gap="$0">
            <Text fontWeight="700">{user?.displayName ?? "User"}</Text>
            <Text color="$gray11" fontSize={12}>
              {user?.email ?? ""}
            </Text>
          </Stack>
        </Stack>
        <Button
          aria-label="Sign out"
          color="$red10"
          disabled={logoutMutation.isPending}
          onPress={() => {
            logoutMutation.mutate();
          }}
        >
          {logoutMutation.isPending ? "Signing out…" : "Sign out"}
        </Button>
      </Stack>
    </Stack>
  );
}
