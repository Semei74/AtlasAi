"use client";

import { useAuthStore } from "@atlas/auth";
import { useAuthMe, useUserPreferences } from "../../lib/queries";
import { Avatar, Card, Heading, Stack, Text, Spinner } from "@atlas/ui";
import { ErrorState } from "./states";

export function UserProfileCard(): React.ReactElement {
  const storeUser = useAuthStore((s) => s.user);
  const { data: profile, isPending: profilePending, isError: profileError, error: profileErrorObj, refetch } = useAuthMe();
  const { data: preferences, isPending: prefsPending, isError: prefsError, error: prefsErrorObj, refetch: refetchPrefs } = useUserPreferences();

  const displayName = profile?.displayName ?? storeUser?.displayName ?? "User";
  const email = profile?.email ?? storeUser?.email ?? "";

  if (profileError) {
    return (
      <Card padding="$4">
        <ErrorState message={profileErrorObj.message} onRetry={() => void refetch()} />
      </Card>
    );
  }

  if (profilePending && !storeUser) {
    return (
      <Card padding="$4" gap="$3">
        <Spinner size="small" />
      </Card>
    );
  }

  return (
    <Card padding="$4" gap="$3">
      <Stack flexDirection="row" alignItems="center" gap="$3">
        <Avatar circular size="$6" />
        <Stack gap="$1">
          <Heading level={3}>{displayName}</Heading>
          <Text color="$gray11">{email}</Text>
        </Stack>
      </Stack>
      <Stack gap="$1">
        <Text color="$gray11">Status</Text>
        <Text fontWeight="600" textTransform="capitalize">
          {profile ? profile.status : storeUser ? storeUser.status : "active"}
        </Text>
      </Stack>
      {prefsPending ? (
        <Spinner size="small" />
      ) : prefsError ? (
        <ErrorState message={prefsErrorObj.message} onRetry={() => void refetchPrefs()} />
      ) : (
        <Stack gap="$1">
          <Text color="$gray11">Preferences</Text>
          <Text fontSize={12}>
            Theme: {preferences.theme} · Locale: {preferences.locale}
          </Text>
        </Stack>
      )}
    </Card>
  );
}
