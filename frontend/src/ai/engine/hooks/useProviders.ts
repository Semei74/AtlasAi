import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProviderRegistry, createDefaultRegistry } from '../providers/ProviderRegistry';
import type { ProviderId, ProviderHealth, ModelInfo } from '../providers/types';

let registry: ProviderRegistry | null = null;

function getRegistry(): ProviderRegistry {
  if (!registry) {
    registry = createDefaultRegistry();
  }
  return registry;
}

export const PROVIDER_QUERY_KEYS = {
  all: ['engine', 'providers'] as const,
  health: ['engine', 'providers', 'health'] as const,
  models: ['engine', 'providers', 'models'] as const,
  active: ['engine', 'providers', 'active'] as const,
};

export function useProviders() {
  const [providerList] = useState(() => getRegistry().getAll());

  return {
    providers: providerList,
    providerIds: providerList.map((p) => p.id),
  };
}

export function useActiveProvider() {
  const queryClient = useQueryClient();

  const { data: activeId } = useQuery({
    queryKey: PROVIDER_QUERY_KEYS.active,
    queryFn: () => getRegistry().getActiveId(),
    staleTime: Infinity,
  });

  const switchProvider = useMutation({
    mutationFn: async (providerId: ProviderId) => {
      getRegistry().setActive(providerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROVIDER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROVIDER_QUERY_KEYS.active });
    },
  });

  return {
    activeProviderId: activeId,
    activeProvider: activeId ? getRegistry().get(activeId) : null,
    switchProvider,
  };
}

export function useProviderHealth() {
  return useQuery({
    queryKey: PROVIDER_QUERY_KEYS.health,
    queryFn: () => getRegistry().checkAllHealth(),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  });
}

export function useProviderModels() {
  return useQuery({
    queryKey: PROVIDER_QUERY_KEYS.models,
    queryFn: () => getRegistry().getModels(),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useProviderCapabilities(providerId: ProviderId) {
  return useQuery({
    queryKey: ['engine', 'providers', providerId, 'capabilities'],
    queryFn: () => getRegistry().getProviderCapabilities(providerId),
    enabled: !!providerId,
    staleTime: Infinity,
  });
}

export { getRegistry as getProviderRegistry };
