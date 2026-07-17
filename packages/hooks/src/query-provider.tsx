"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import type { ReactNode, ReactElement } from "react";
import { createQueryClient } from "./query-client";

interface QueryProviderProps {
  children: ReactNode;
  showDevtools?: boolean;
}

export function QueryProvider({
  children,
  showDevtools = false,
}: QueryProviderProps): ReactElement {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showDevtools && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
