import { Flex, FlexItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import type { StorageBackend, StorageTier } from '@osac/types/private';

import StorageTierActionsMenu from './StorageTierActionsMenu';
import { protocolLabel } from './storageTierBackendResolution';
import { StorageTierStatusLabel } from './StorageTierStatusLabel';
import { useTranslation } from '../../hooks/useTranslation';

import './StorageTables.css';

interface StorageTiersTableProps {
  tiers: StorageTier[];
  backendsById: Map<string, StorageBackend>;
}

export const StorageTiersTable = ({ tiers, backendsById }: StorageTiersTableProps) => {
  const { t } = useTranslation();
  const protocolLabels = protocolLabel(t);

  return (
    <Table aria-label={t('Storage tiers')} variant="compact">
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th>{t('Status')}</Th>
          <Th>{t('Backends')}</Th>
          <Th>{t('Protocol')}</Th>
          <Th aria-label={t('Actions')} />
        </Tr>
      </Thead>
      <Tbody>
        {tiers.map((tier) => {
          const name = tier.metadata?.name || tier.id;
          const backendAssociations = tier.spec?.backends ?? [];
          const backendNames = backendAssociations
            .map(
              (assoc) => backendsById.get(assoc.backendId)?.metadata?.name ?? assoc.backendId,
            )
            .join(', ');

          return (
            <Tr key={tier.id}>
              <Td dataLabel={t('Name')}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <Link
                      to={`/admin/infrastructure/storage/tiers/${encodeURIComponent(tier.id)}`}
                      className="storage-tiers-table__name-link"
                    >
                      {name}
                    </Link>
                  </FlexItem>
                </Flex>
              </Td>
              <Td dataLabel={t('Status')}>
                <StorageTierStatusLabel state={tier.status?.state} />
              </Td>
              <Td dataLabel={t('Backends')}>{backendNames || '—'}</Td>
              <Td dataLabel={t('Protocol')}>
                {tier.spec?.protocol !== undefined ? protocolLabels[tier.spec.protocol] : '—'}
              </Td>
              <Td dataLabel={t('Actions')} isActionCell>
                <StorageTierActionsMenu tier={tier} />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};
