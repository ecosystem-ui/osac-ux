// MISSING: all hooks in this file return mock data until the real MaaS proxy
// endpoints land in fulfillment-service.
//
// Real endpoints (Phase 3, integration.md Option 2):
//   GET    /api/fulfillment/v1/clusters/{id}/maas/models
//   GET    /api/fulfillment/v1/clusters/{id}/maas/subscriptions
//   GET    /api/fulfillment/v1/clusters/{id}/maas/keys
//   POST   /api/fulfillment/v1/clusters/{id}/maas/keys
//   DELETE /api/fulfillment/v1/clusters/{id}/maas/keys/{keyId}
//   GET    /api/fulfillment/v1/clusters/{id}/ai_grid_url

import { useMutation } from '@tanstack/react-query';

import { apiQueryKey } from '../types';
import { useApiQuery, useApiQueryClient } from '../use-api-query';

// ─── Local type definitions (no protobuf types exist yet for MaaS) ────────────

export interface MaasModel {
  id: string;
  ownedBy?: string;
}

export interface MaasSubscription {
  id: string;
  spec: {
    name?: string;
    modelRefs?: { name: string }[];
    requestsPerMinute?: number;
    tokensPerDay?: number;
  };
  status?: {
    state?: string;
    activeKeyCount?: number;
  };
}

export interface MaasApiKey {
  id: string;
  keyPreview: string;
  createdAt: string;
  subscriptionId: string;
  subscriptionName?: string;
}

export interface MaasApiKeyCreateRequest {
  clusterId: string;
  subscriptionId: string;
}

export interface MaasApiKeyRevokeRequest {
  clusterId: string;
  keyId: string;
}

export interface AiGridUrlResult {
  url: string;
  expiresAt: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_MODELS: MaasModel[] = [
  { id: 'mistral-7b-instruct', ownedBy: 'cloud-provider' },
  { id: 'llama-3-70b-instruct', ownedBy: 'cloud-provider' },
  { id: 'codestral-22b', ownedBy: 'cloud-provider' },
];

const MOCK_SUBSCRIPTIONS: MaasSubscription[] = [
  {
    id: 'sub-standard-001',
    spec: {
      name: 'Standard',
      modelRefs: [{ name: 'mistral-7b-instruct' }, { name: 'llama-3-70b-instruct' }],
      requestsPerMinute: 500,
      tokensPerDay: 500_000,
    },
    status: { state: 'ACTIVE', activeKeyCount: 2 },
  },
  {
    id: 'sub-premium-001',
    spec: {
      name: 'Premium',
      modelRefs: [
        { name: 'mistral-7b-instruct' },
        { name: 'llama-3-70b-instruct' },
        { name: 'codestral-22b' },
      ],
      requestsPerMinute: 2_000,
      tokensPerDay: 2_000_000,
    },
    status: { state: 'ACTIVE', activeKeyCount: 1 },
  },
];

const MOCK_KEYS: MaasApiKey[] = [
  {
    id: 'key-abc123',
    keyPreview: 'sk-oai-abc…123',
    createdAt: new Date(Date.now() - 86_400_000 * 3).toISOString(),
    subscriptionId: 'sub-standard-001',
    subscriptionName: 'Standard',
  },
  {
    id: 'key-def456',
    keyPreview: 'sk-oai-def…456',
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    subscriptionId: 'sub-premium-001',
    subscriptionName: 'Premium',
  },
];

// ─── Query hooks ──────────────────────────────────────────────────────────────

// MISSING: replace with real useApiQuery call once endpoint exists
export const useMaasModels = (_clusterId: string) =>
  useApiQuery<MaasModel[], MaasModel[]>({
    queryKey: apiQueryKey('v1/maas/models', [_clusterId]),
    queryFn: () => Promise.resolve(MOCK_MODELS),
    enabled: Boolean(_clusterId),
  });

// MISSING: replace with real useApiQuery call once endpoint exists
export const useMaasSubscriptions = (_clusterId: string) =>
  useApiQuery<MaasSubscription[], MaasSubscription[]>({
    queryKey: apiQueryKey('v1/maas/subscriptions', [_clusterId]),
    queryFn: () => Promise.resolve(MOCK_SUBSCRIPTIONS),
    enabled: Boolean(_clusterId),
  });

// MISSING: replace with real useApiQuery call once endpoint exists
export const useMaasApiKeys = (_clusterId: string) =>
  useApiQuery<MaasApiKey[], MaasApiKey[]>({
    queryKey: apiQueryKey('v1/maas/keys', [_clusterId]),
    queryFn: () => Promise.resolve(MOCK_KEYS),
    enabled: Boolean(_clusterId),
  });

// ─── Mutation hooks ───────────────────────────────────────────────────────────

// MISSING: replace body with real fetch once endpoint exists
export const useCreateMaasApiKey = () => {
  const qc = useApiQueryClient();
  return useMutation({
    mutationFn: async ({ clusterId: _clusterId, subscriptionId }: MaasApiKeyCreateRequest) => {
      const newKey: MaasApiKey = {
        id: `key-${Math.random().toString(36).slice(2, 8)}`,
        keyPreview: `sk-oai-new…${Math.random().toString(36).slice(2, 5)}`,
        createdAt: new Date().toISOString(),
        subscriptionId,
        subscriptionName: MOCK_SUBSCRIPTIONS.find((s) => s.id === subscriptionId)?.spec.name,
      };
      MOCK_KEYS.push(newKey);
      return newKey;
    },
    onSuccess: (_data, { clusterId }) => {
      void qc.invalidateQueries({ queryKey: apiQueryKey('v1/maas/keys', [clusterId]) });
    },
    retry: false,
  });
};

// MISSING: replace body with real fetch once endpoint exists
export const useRevokeMaasApiKey = () => {
  const qc = useApiQueryClient();
  return useMutation({
    mutationFn: async ({ clusterId: _clusterId, keyId }: MaasApiKeyRevokeRequest) => {
      const idx = MOCK_KEYS.findIndex((k) => k.id === keyId);
      if (idx !== -1) MOCK_KEYS.splice(idx, 1);
    },
    onSuccess: (_data, { clusterId }) => {
      void qc.invalidateQueries({ queryKey: apiQueryKey('v1/maas/keys', [clusterId]) });
    },
    retry: false,
  });
};

// MISSING: replace body with real fetch once endpoint exists
export const useFetchAiGridUrl = () =>
  useMutation({
    mutationFn: async (clusterId: string): Promise<AiGridUrlResult> => {
      return {
        url: `https://odh-dashboard.example.com/clusters/${clusterId}/maas`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };
    },
    retry: false,
  });
