import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Tenant } from '@osac/types/private';

import BillingPage from './BillingPage';
import { renderWithProviders } from '../../test-utils/TestProviders';

describe('BillingPage', () => {
  it('renders billing KPIs and linked tenant accounts', async () => {
    renderWithProviders(<BillingPage />, {
      apiFixtures: {
        tenants: [
          {
            id: 'tenant-acme',
            metadata: { name: 'Acme Corp' },
          } as unknown as Tenant,
        ],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Billing' })).toBeInTheDocument();
    expect(screen.getByText('Active M360 accounts')).toBeInTheDocument();
    expect(screen.getAllByText('Linked OSAC tenants')).toHaveLength(2);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('acme-enterprise-billing')).toBeInTheDocument();
    expect(screen.getByText('M360-10001')).toBeInTheDocument();
  });
});
