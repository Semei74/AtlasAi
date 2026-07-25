"use client";

import type { ReactNode, ReactElement } from "react";
import { Stack, Card } from "@atlas/ui";

interface DialogOverlayProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function DialogOverlay({ open, onClose, children }: DialogOverlayProps): ReactElement | null {
  if (!open) return null;

  return (
    <Stack
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0,0,0,0.4)"
      alignItems="center"
      justifyContent="center"
      zIndex={500}
      onPress={onClose}
    >
      <Card
        padding="$5"
        gap="$4"
        width="100%"
        maxWidth={480}
        onPress={(e: { stopPropagation: () => void }) => { e.stopPropagation(); }}
      >
        {children}
      </Card>
    </Stack>
  );
}
