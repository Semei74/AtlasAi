import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "./store";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps): ReactNode {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isRestoring = useAuthStore((s) => s.isRestoring);
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  if (isRestoring) return null;

  if (!isAuthenticated) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
