"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Stack, Text, Button } from "@atlas/ui";
import type { ReactNode, ReactElement } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx === null) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }): ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const bgColor = (type: ToastType): string => {
    if (type === "success") return "$green8";
    if (type === "error") return "$red8";
    return "$blue8";
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <Stack
          position="fixed"
          bottom={16}
          right={16}
          gap="$2"
          zIndex={1000}
        >
          {toasts.map((toast) => (
            <Stack
              key={toast.id}
              flexDirection="row"
              alignItems="center"
              gap="$2"
              padding="$3"
              borderRadius={8}
              backgroundColor={bgColor(toast.type)}
              minWidth={280}
              elevation={4}
            >
              <Text color="white" flex={1} fontSize={14}>{toast.message}</Text>
              <Button
                size="$1"
                backgroundColor="transparent"
                color="white"
                onPress={() => { dismiss(toast.id); }}
              >
                ✕
              </Button>
            </Stack>
          ))}
        </Stack>
      )}
    </ToastContext.Provider>
  );
}
