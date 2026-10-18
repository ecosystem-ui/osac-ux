import { Route, Routes } from 'react-router-dom';
import { create } from '@bufbuild/protobuf';
import { screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  InstanceTypeSchema,
  InstanceTypeState,
  InstanceTypesDeleteResponseSchema,
  type InstanceTypesGetResponse,
  InstanceTypesGetResponseSchema,
  type InstanceType as PrivateInstanceType,
} from '@osac/types/private';
import { mockQueryResult } from '@osac/ui-components/test-utils/query';

import AdminInstanceTypeDetailPage from './AdminInstanceTypeDetailPage';
import type { MockTransportOverrides } from '../../test-utils/createMockConnectTransport';
import { renderWithProviders } from '../../test-utils/TestProviders';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@osac/ui-components/api/use-resource', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@osac/ui-components/api/use-resource')>();
  return { ...actual, useGetResource: vi.fn() };
});

const { useGetResource } = await import('@osac/ui-components/api/use-resource');

const LIST_ROUTE = '/admin/infrastructure/instance-types';
const DETAIL_ROUTE = `${LIST_ROUTE}/gp-small`;

const makeInstanceType = (
  state: InstanceTypeState = InstanceTypeState.ACTIVE,
  gpu?: { pciDeviceSelector: string; resourceName: string; count: number },
): PrivateInstanceType =>
  create(InstanceTypeSchema, {
    id: 'gp-small',
    metadata: {
      name: 'gp-small',
      creationTimestamp: { seconds: BigInt(1717000000), nanos: 0 },
    },
    spec: {
      vcpus: 4,
      memoryGib: 16,
      description: 'General purpose instance type',
      state,
      gpu,
    },
  });

const renderDetailPage = (
  instanceType: PrivateInstanceType,
  transportOverrides?: MockTransportOverrides,
) => {
  vi.mocked(useGetResource).mockReturnValue(
    mockQueryResult<InstanceTypesGetResponse>({
      data: create(InstanceTypesGetResponseSchema, { object: instanceType }),
    }),
  );
  return renderWithProviders(
    <Routes>
      <Route path={`${LIST_ROUTE}/:id`} element={<AdminInstanceTypeDetailPage />} />
    </Routes>,
    { routerEntries: [DETAIL_ROUTE], transportOverrides },
  );
};

describe('AdminInstanceTypeDetailPage', () => {
  afterEach(() => {
    mockNavigate.mockReset();
    vi.mocked(useGetResource).mockReset();
  });

  it('renders the breadcrumb, title, description, and details', () => {
    renderDetailPage(makeInstanceType());

    expect(screen.getByRole('heading', { name: 'gp-small' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Instance types' })).toBeInTheDocument();
    expect(screen.getByText('General purpose instance type')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
    expect(screen.getByText('This instance type has no GPU attached.')).toBeInTheDocument();
  });

  it('renders GPU details when the instance type has a GPU', () => {
    renderDetailPage(
      makeInstanceType(InstanceTypeState.ACTIVE, {
        pciDeviceSelector: '10DE:20B0',
        resourceName: 'nvidia.com/A100',
        count: 2,
      }),
    );

    expect(screen.getByText('10DE:20B0')).toBeInTheDocument();
    expect(screen.getByText('nvidia.com/A100')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('has a breadcrumb link back to the instance types list', () => {
    renderDetailPage(makeInstanceType());

    const link = screen.getByRole('link', { name: 'Instance types' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', LIST_ROUTE);
  });

  it('shows a loading spinner while the query is in flight', () => {
    vi.mocked(useGetResource).mockReturnValue(
      mockQueryResult<InstanceTypesGetResponse>({ data: undefined, isLoading: true }),
    );

    renderWithProviders(
      <Routes>
        <Route path={`${LIST_ROUTE}/:id`} element={<AdminInstanceTypeDetailPage />} />
      </Routes>,
      { routerEntries: [DETAIL_ROUTE] },
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('uses the page-level error state when the query fails', () => {
    vi.mocked(useGetResource).mockReturnValue(
      mockQueryResult<InstanceTypesGetResponse>({
        data: undefined,
        error: new Error('Instance type unavailable'),
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path={`${LIST_ROUTE}/:id`} element={<AdminInstanceTypeDetailPage />} />
      </Routes>,
      { routerEntries: [DETAIL_ROUTE] },
    );

    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    expect(screen.getByText('Instance type unavailable')).toBeInTheDocument();
  });

  it('shows an Actions menu with Deprecate and Obsolete for an active instance type', async () => {
    const { user } = renderDetailPage(makeInstanceType(InstanceTypeState.ACTIVE));

    await user.click(screen.getByRole('button', { name: /Actions for/ }));

    expect(screen.getByRole('menuitem', { name: 'Deprecate' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Obsolete' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Reactivate' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Delete' })).not.toBeInTheDocument();
  });

  it('shows Reactivate and Delete in the Actions menu for an obsolete instance type', async () => {
    const { user } = renderDetailPage(makeInstanceType(InstanceTypeState.OBSOLETE));

    await user.click(screen.getByRole('button', { name: /Actions for/ }));

    expect(screen.getByRole('menuitem', { name: 'Deprecate' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Reactivate' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Obsolete' })).not.toBeInTheDocument();
  });

  it('deletes the instance type and navigates back to the list', async () => {
    let deleteCalled = false;
    const { user } = renderDetailPage(makeInstanceType(InstanceTypeState.OBSOLETE), {
      onInstanceTypeDelete: (req) => {
        deleteCalled = true;
        expect(req.id).toBe('gp-small');
        return create(InstanceTypesDeleteResponseSchema);
      },
    });

    await user.click(screen.getByRole('button', { name: /Actions for/ }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(LIST_ROUTE));
    expect(deleteCalled).toBe(true);
  });
});
