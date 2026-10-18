import { screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { StorageBackend, StorageTier } from '@osac/types/private';
import { StorageBackendState, StorageProtocol, StorageTierState } from '@osac/types/private';
import { cel } from '@osac/ui-components/api/cel';
import { mockQueryResult } from '@osac/ui-components/test-utils/query';

import { StorageManagementPage } from './StorageManagementPage';
import { renderWithProviders } from '../../test-utils/TestProviders';

vi.mock('@osac/ui-components/api/v1/private/storage-backends', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@osac/ui-components/api/v1/private/storage-backends')>();
  return { ...actual, usePrivateStorageBackends: vi.fn() };
});

vi.mock('@osac/ui-components/api/v1/private/storage-tiers', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@osac/ui-components/api/v1/private/storage-tiers')>();
  return { ...actual, usePrivateStorageTiers: vi.fn() };
});

const { usePrivateStorageBackends } =
  await import('@osac/ui-components/api/v1/private/storage-backends');
const { usePrivateStorageTiers } = await import('@osac/ui-components/api/v1/private/storage-tiers');

const makeBackend = (id: string, name: string): StorageBackend =>
  ({
    id,
    metadata: { name },
    spec: { provider: 'vast', endpoint: `${id}.example.com` },
    status: { state: StorageBackendState.READY },
  }) as StorageBackend;

const makeTier = (id: string, name: string, backendId: string): StorageTier =>
  ({
    id,
    metadata: { name },
    spec: {
      description: '',
      protocol: StorageProtocol.NFS,
      backends: [
        {
          backendId,
          maxReadBandwidthMbs: 0,
          maxWriteBandwidthMbs: 0,
          encryptionEnabled: false,
        },
      ],
    },
    status: { state: StorageTierState.ACTIVE },
  }) as StorageTier;

describe('StorageManagementPage', () => {
  afterEach(() => {
    vi.mocked(usePrivateStorageBackends).mockReset();
    vi.mocked(usePrivateStorageTiers).mockReset();
  });

  it('renders backends and tiers sections on the unified page', () => {
    vi.mocked(usePrivateStorageBackends).mockReturnValue(
      mockQueryResult<StorageBackend[]>({ data: [] }),
    );
    vi.mocked(usePrivateStorageTiers).mockReturnValue(
      mockQueryResult<StorageTier[]>({ data: [] }),
    );

    renderWithProviders(<StorageManagementPage />);

    expect(screen.getByRole('heading', { name: 'Storage' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Backends' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tiers' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create backend' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create tier' })).toBeInTheDocument();
    expect(
      screen.getByText('No storage backends yet. Create one to get started.'),
    ).toBeInTheDocument();
    expect(screen.getByText('No storage tiers yet. Create one to get started.')).toBeInTheDocument();
  });

  it('renders backend and tier rows when data is present', () => {
    const backend = makeBackend('backend-a', 'vast-prod');
    const tier = makeTier('tier-1', 'fast', 'backend-a');

    vi.mocked(usePrivateStorageBackends).mockImplementation((params) => {
      if (params?.filter) {
        return mockQueryResult<StorageBackend[]>({ data: [backend] });
      }
      return mockQueryResult<StorageBackend[]>({ data: [backend] });
    });
    vi.mocked(usePrivateStorageTiers).mockReturnValue(
      mockQueryResult<StorageTier[]>({ data: [tier] }),
    );

    renderWithProviders(<StorageManagementPage />);

    expect(screen.getByRole('link', { name: 'vast-prod' })).toHaveAttribute(
      'href',
      '/admin/infrastructure/storage/backends/backend-a',
    );
    expect(screen.getByRole('link', { name: 'fast' })).toHaveAttribute(
      'href',
      '/admin/infrastructure/storage/tiers/tier-1',
    );
  });

  it('composes a backend name-search filter and re-queries', async () => {
    vi.mocked(usePrivateStorageBackends).mockReturnValue(
      mockQueryResult<StorageBackend[]>({ data: [] }),
    );
    vi.mocked(usePrivateStorageTiers).mockReturnValue(
      mockQueryResult<StorageTier[]>({ data: [] }),
    );

    const { user } = renderWithProviders(<StorageManagementPage />);

    await user.type(screen.getByRole('textbox', { name: 'Search storage backends' }), 'vast');

    expect(usePrivateStorageBackends).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: cel<StorageBackend>((f) => f.field('metadata.name').contains('vast')),
      }),
    );
  });

  it('composes a tier name-search filter and re-queries', async () => {
    vi.mocked(usePrivateStorageBackends).mockReturnValue(
      mockQueryResult<StorageBackend[]>({ data: [] }),
    );
    vi.mocked(usePrivateStorageTiers).mockReturnValue(
      mockQueryResult<StorageTier[]>({ data: [] }),
    );

    const { user } = renderWithProviders(<StorageManagementPage />);

    await user.type(screen.getByRole('textbox', { name: 'Search storage tiers' }), 'fast');

    await waitFor(() => {
      expect(usePrivateStorageTiers).toHaveBeenCalledWith({
        filter: cel<StorageTier>((f) => f.field('metadata.name').contains('fast')),
      });
    });
  });
});
