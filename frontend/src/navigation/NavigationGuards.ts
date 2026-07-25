import { ReactNode } from 'react';
import { Redirect } from 'expo-router';

interface AuthGuardProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  isAuthenticated = false,
  redirectTo = '/(auth)/login',
}: AuthGuardProps) {
  if (!isAuthenticated) {
    return <Redirect href={redirectTo} />;
  }
  return <>{children}</>;
}

interface GuestGuardProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  redirectTo?: string;
}

export function GuestGuard({
  children,
  isAuthenticated = false,
  redirectTo = '/(tabs)',
}: GuestGuardProps) {
  if (isAuthenticated) {
    return <Redirect href={redirectTo} />;
  }
  return <>{children}</>;
}

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  userRole?: string;
  fallbackRoute?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  userRole,
  fallbackRoute = '/(tabs)',
}: RoleGuardProps) {
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Redirect href={fallbackRoute} />;
  }
  return <>{children}</>;
}
