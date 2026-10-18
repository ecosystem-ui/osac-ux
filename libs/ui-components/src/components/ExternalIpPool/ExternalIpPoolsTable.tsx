import { Content, Flex, FlexItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import type { ExternalIPPool } from '@osac/types/private';

import ExternalIpPoolActionsMenu from './ExternalIpPoolActionsMenu';
import ExternalIpPoolStatusLabel from './ExternalIpPoolStatusLabel';
import { useTranslation } from '../../hooks/useTranslation';

import './ExternalIpPoolsTable.css';

interface ExternalIpPoolsTableProps {
  pools: ExternalIPPool[];
}

const formatCapacity = (pool: ExternalIPPool): string => {
  const available = pool.status?.available;
  const total = pool.status?.total;
  return available !== undefined && total !== undefined
    ? `${available.toString()} of ${total.toString()} available`
    : '—';
};

export const ExternalIpPoolsTable = ({ pools }: ExternalIpPoolsTableProps) => {
  const { t } = useTranslation();

  // Show the single CIDR inline; collapse multiple into a "<n> CIDRs" summary.
  const formatCidrs = (cidrs?: string[]): string => {
    if (!cidrs || cidrs.length === 0) {
      return '—';
    }
    if (cidrs.length === 1) {
      return cidrs[0];
    }
    return t('{{count}} CIDRs', { count: cidrs.length });
  };

  return (
    <Table aria-label={t('External IP pools')} variant="compact">
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th>{t('Status')}</Th>
          <Th>{t('CIDRs')}</Th>
          <Th>{t('Tenant')}</Th>
          <Th>{t('Capacity')}</Th>
          <Th aria-label={t('Actions')} />
        </Tr>
      </Thead>
      <Tbody>
        {pools.map((pool) => {
          const name = pool.metadata?.name || pool.id;

          return (
            <Tr key={pool.id}>
              <Td dataLabel={t('Name')}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <Link
                      to={`/admin/infrastructure/external-ip-pools/${encodeURIComponent(pool.id)}`}
                      className="external-ip-pools-table__name-link"
                    >
                      {name}
                    </Link>
                  </FlexItem>
                  <FlexItem>
                    <Content component="small" className="external-ip-pools-table__name-meta">
                      {t('{{inUse}} in use · {{available}} available', {
                        inUse: pool.status?.allocated?.toString() ?? '0',
                        available: pool.status?.available?.toString() ?? '0',
                      })}
                    </Content>
                  </FlexItem>
                </Flex>
              </Td>
              <Td dataLabel={t('Status')}>
                <ExternalIpPoolStatusLabel state={pool.status?.state} />
              </Td>
              <Td dataLabel={t('CIDRs')}>{formatCidrs(pool.spec?.cidrs)}</Td>
              <Td dataLabel={t('Tenant')}>{pool.metadata?.tenant || '—'}</Td>
              <Td dataLabel={t('Capacity')}>{formatCapacity(pool)}</Td>
              <Td dataLabel={t('Actions')} isActionCell>
                <ExternalIpPoolActionsMenu pool={pool} />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};
