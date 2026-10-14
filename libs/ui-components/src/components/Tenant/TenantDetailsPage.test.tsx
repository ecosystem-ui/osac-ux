import { Route, Routes } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  ConditionStatus,
  TenantConditionType,
  TenantState,
} from '@osac/types/private';
import type { Tenant } from '@osac/types/private';

import TenantDetailsPage from './TenantDetailsPage';
import { renderWithProviders } from '../../test-utils/TestProviders';

const makeTenant = (): Tenant =>
  ({
    id: 'tenant-acme',
    metadata: {
      name: 'Acme Corp',
      creationTimestamp: { seconds: BigInt(1717000000), nanos: 0 },
      creator: 'cloud-provider-admin',
      description: 'Primary tenant for Acme Corporation workloads.',
    },
    spec: {
      domains: ['acme.example.com', 'acme-corp.example.com'],
      breakGlassCredentialsSecret: {
        id: 'secret-acme-break-glass',
        name: 'acme-break-glass-credentials',
      },
    },
    status: {
      state: TenantState.SYNCED,
      message: 'Tenant synced to the identity provider.',
      idpTenantName: 'acme-corp',
      breakGlassUserId: 'acme-break-glass-admin',
      conditions: [
        {
          type: TenantConditionType.DEFAULT_NETWORKING_READY,
          status: ConditionStatus.TRUE,
          message: 'Default networking resources are ready.',
        },
        {
          type: TenantConditionType.VAULT_READY,
          status: ConditionStatus.TRUE,
          message: 'The tenant vault namespace is ready.',
        },
        {
          type: TenantConditionType.COMPUTE_INFRASTRUCTURE_READY,
          status: ConditionStatus.TRUE,
          message: 'Compute infrastructure is ready.',
        },
      ],
    },
  }) as Tenant;

const renderPage = (tenant?: Tenant) =>
  renderWithProviders(
    <Routes>
      <Route path="/admin/tenants/:id" element={<TenantDetailsPage />} />
    </Routes>,
    {
      apiFixtures: { tenants: tenant ? [tenant] : [] },
      routerEntries: [`/admin/tenants/${tenant?.id ?? 'missing'}`],
    },
  );

describe('TenantDetailsPage', () => {
  it('renders tenant overview and setup progress from the API model', async () => {
    renderPage(makeTenant());

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Acme Corp' })).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tenant setup' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Resource usage' })).toBeInTheDocument();
    expect(screen.getByText('Instances by service')).toBeInTheDocument();
    expect(screen.getByText('Instances by project')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Roles' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Assign roles' })).toHaveAttribute(
      'href',
      '/tenant/role-binding/create',
    );
    expect(screen.getByRole('heading', { name: 'Acme Corp' })).toBeInTheDocument();
    expect(screen.getByText('acme.example.com')).toBeInTheDocument();
    expect(screen.getByText('acme-corp.example.com')).toBeInTheDocument();
    expect(screen.getByText('acme-break-glass-credentials')).toBeInTheDocument();
    expect(screen.getByText('Default networking')).toBeInTheDocument();
    expect(screen.getByText('Compute infrastructure')).toBeInTheDocument();
    expect(screen.getByText('Primary tenant for Acme Corporation workloads.')).toBeInTheDocument();
  });

  it('renders the not-found state for an unknown tenant', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Tenant not found')).toBeInTheDocument();
    });
  });
});
