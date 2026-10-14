import { Link } from 'react-router-dom';
import { Content } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { type Tenant } from '@osac/types/private';
import { Timestamp } from '@osac/ui-components/components/Primitives/Timestamp';
import TenantActionsMenu from '@osac/ui-components/components/Tenant/TenantActionsMenu';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import TenantStatusLabel from './TenantStatusLabel';

import './TenantTable.css';

interface TenantTableProps {
  tenants: Tenant[];
}

const TenantTable = ({ tenants }: TenantTableProps) => {
  const { t } = useTranslation();
  const nameLabel = t('Name');
  const statusLabel = t('Status');
  const domainLabel = t('Primary domain');
  const billingAccountLabel = t('Billing account');
  const registeredLabel = t('Registered');
  const actionsLabel = t('Actions');

  return (
    <Table aria-label={t('Tenants')} borders={false} className="tenant-table" variant="compact">
      <Thead>
        <Tr>
          <Th>{nameLabel}</Th>
          <Th>{statusLabel}</Th>
          <Th>{domainLabel}</Th>
          <Th>{billingAccountLabel}</Th>
          <Th>{registeredLabel}</Th>
          <Th aria-label={actionsLabel} />
        </Tr>
      </Thead>
      <Tbody>
        {tenants.map((tenant) => (
          <Tr key={tenant.id}>
            <Td dataLabel={nameLabel}>
              <Link className="tenant-table__name-link" to={`/admin/tenants/${tenant.id}`}>
                {tenant.metadata?.name ?? tenant.id}
              </Link>
            </Td>
            <Td dataLabel={statusLabel}>
              <TenantStatusLabel state={tenant.status?.state} />
            </Td>
            <Td dataLabel={domainLabel}>{tenant.spec?.domains?.[0] ?? '—'}</Td>
            <Td dataLabel={billingAccountLabel}>
              <Content component="p" className="tenant-table__billing-account-primary">
                {tenant.metadata?.annotations?.['osac.io/billing-account'] ?? '—'}
              </Content>
              {tenant.metadata?.annotations?.['osac.io/billing-account-id'] ? (
                <Content component="p" className="tenant-table__billing-account-secondary">
                  <code>{tenant.metadata.annotations['osac.io/billing-account-id']}</code>
                </Content>
              ) : null}
            </Td>
            <Td dataLabel={registeredLabel}>
              <Timestamp value={tenant.metadata?.creationTimestamp} format="Time" />
            </Td>
            <Td dataLabel={actionsLabel} isActionCell>
              <TenantActionsMenu tenant={tenant} />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default TenantTable;
