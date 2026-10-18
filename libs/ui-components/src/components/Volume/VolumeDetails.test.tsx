import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { type Volume, VolumeAccessMode, VolumeState } from '@osac/types';

import VolumeDetails from './VolumeDetails';
import { renderWithProviders } from '../../test-utils/TestProviders';

const makeVolume = (state: VolumeState, overrides: Partial<{ message: string }> = {}): Volume =>
  ({
    $typeName: 'osac.public.v1.Volume',
    id: 'vol-test-1',
    metadata: {
      $typeName: 'osac.public.v1.Metadata',
      name: 'test-volume',
      tenant: 'test-tenant',
      project: 'test-project',
      creator: 'alice',
      creationTimestamp: {
        $typeName: 'google.protobuf.Timestamp',
        seconds: 1767225600n,
        nanos: 0,
      },
      displayName: '',
      description: '',
      annotations: {},
      labels: {},
      version: 1,
    },
    spec: {
      $typeName: 'osac.public.v1.VolumeSpec',
      storageTier: 'balanced',
      sizeGib: 50n,
      accessMode: VolumeAccessMode.READ_WRITE_ONCE,
    },
    status: {
      $typeName: 'osac.public.v1.VolumeStatus',
      state,
      ...(overrides.message !== undefined ? { message: overrides.message } : {}),
    },
  }) as Volume;

const renderDetails = (volume: Volume) => renderWithProviders(<VolumeDetails volume={volume} />);

const openActionsMenu = async (
  user: ReturnType<typeof renderWithProviders>['user'],
  name = 'test-volume',
) => {
  await user.click(screen.getByRole('button', { name: `Actions for ${name}` }));
};

describe('VolumeDetails', () => {
  describe('header and breadcrumb', () => {
    it('renders the header with volume name and breadcrumb', () => {
      renderDetails(makeVolume(VolumeState.AVAILABLE));

      expect(screen.getByRole('heading', { name: 'test-volume' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Volumes' })).toHaveAttribute(
        'href',
        '/storage/volumes',
      );
    });

    it('falls back to volume id when name is missing', () => {
      const volume = {
        $typeName: 'osac.public.v1.Volume',
        id: 'vol-no-name',
        status: {
          $typeName: 'osac.public.v1.VolumeStatus',
          state: VolumeState.AVAILABLE,
        },
      } as Volume;

      renderDetails(volume);

      expect(screen.getByRole('heading', { name: 'vol-no-name' })).toBeInTheDocument();
    });
  });

  describe('detail fields', () => {
    it('renders name, storage tier, size, access mode, tenant, and created', () => {
      renderDetails(makeVolume(VolumeState.AVAILABLE));

      expect(screen.getAllByText('test-volume').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('balanced')).toBeInTheDocument();
      expect(screen.getByText('50 GiB')).toBeInTheDocument();
      expect(screen.getByText('ReadWriteOnce')).toBeInTheDocument();
      expect(screen.getByText('test-tenant')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
    });

    it('does not render an ID field', () => {
      renderDetails(makeVolume(VolumeState.AVAILABLE));

      expect(screen.queryByText('ID')).not.toBeInTheDocument();
    });

    it('shows the status message when present', () => {
      renderDetails(makeVolume(VolumeState.FAILED, { message: 'Provisioning timed out' }));

      expect(screen.getByText('Message')).toBeInTheDocument();
      expect(screen.getByText('Provisioning timed out')).toBeInTheDocument();
    });

    it('hides the message row when status.message is absent', () => {
      renderDetails(makeVolume(VolumeState.CREATING));

      expect(screen.queryByText('Message')).not.toBeInTheDocument();
    });

    it('renders dash fallbacks when optional fields are missing', () => {
      const minimalVolume = {
        $typeName: 'osac.public.v1.Volume',
        id: 'vol-minimal',
        status: {
          $typeName: 'osac.public.v1.VolumeStatus',
          state: VolumeState.AVAILABLE,
        },
      } as Volume;

      renderDetails(minimalVolume);

      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('action buttons', () => {
    it('renders an Actions menu', () => {
      renderDetails(makeVolume(VolumeState.AVAILABLE));

      expect(
        screen.getByRole('button', { name: 'Actions for test-volume' }),
      ).toBeInTheDocument();
    });

    it('shows Delete enabled when state is AVAILABLE', async () => {
      const { user } = renderDetails(makeVolume(VolumeState.AVAILABLE));
      await openActionsMenu(user);

      expect(screen.getByRole('menuitem', { name: 'Delete' })).not.toBeDisabled();
    });

    it('shows Delete enabled when state is FAILED', async () => {
      const { user } = renderDetails(makeVolume(VolumeState.FAILED));
      await openActionsMenu(user);

      expect(screen.getByRole('menuitem', { name: 'Delete' })).not.toBeDisabled();
    });

    it('shows Delete disabled when state is CREATING', async () => {
      const { user } = renderDetails(makeVolume(VolumeState.CREATING));
      await openActionsMenu(user);

      expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeDisabled();
    });

    it('shows Delete disabled when state is DELETING', async () => {
      const { user } = renderDetails(makeVolume(VolumeState.DELETING));
      await openActionsMenu(user);

      expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeDisabled();
    });

    it('shows Delete disabled when state is DELETED', async () => {
      const { user } = renderDetails(makeVolume(VolumeState.DELETED));
      await openActionsMenu(user);

      expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeDisabled();
    });

    it('shows Delete disabled when state is UNSPECIFIED', async () => {
      const { user } = renderDetails(makeVolume(VolumeState.UNSPECIFIED));
      await openActionsMenu(user);

      expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeDisabled();
    });

    it('does not show an Edit action', async () => {
      const { user } = renderDetails(makeVolume(VolumeState.AVAILABLE));
      await openActionsMenu(user);

      expect(screen.queryByRole('menuitem', { name: 'Edit' })).not.toBeInTheDocument();
    });
  });
});
