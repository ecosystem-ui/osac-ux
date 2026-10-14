import { Content, Flex, FlexItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import type { ExternalIP, ExternalIPPool } from '@osac/types';
import type { ExternalIpAttachedTarget } from '@osac/ui-components/api/v1/external-ip-data';

import ExternalIpAttachedTo from './Details/ExternalIpAttachedTo';
import ExternalIpStatusLabel from './Details/ExternalIpStatusLabel';
import ExternalIpActionsMenu from './ExternalIpActionsMenu';
import { useTranslation } from '../../hooks/useTranslation';
import { Timestamp } from '../Primitives/Timestamp';

import './ExternalIpsTable.css';

interface ExternalIpsTableProps {
  externalIps: ExternalIP[];
  poolsById: Record<string, ExternalIPPool>;
  attachedTargetsByExternalIpId: Record<string, ExternalIpAttachedTarget>;
}

interface ExternalIpPoolNetworkFields {
  cidr?: string;
  cidrs?: string[];
}

const resolvePool = (
  externalIp: ExternalIP,
  poolsById: Record<string, ExternalIPPool>,
): ExternalIPPool | undefined => {
  const poolId = externalIp.spec?.pool?.id || externalIp.status?.pool;
  return poolId ? poolsById[poolId] : undefined;
};

const getPoolCidr = (pool: ExternalIPPool | undefined): string => {
  const spec = pool?.spec as (ExternalIPPool['spec'] & ExternalIpPoolNetworkFields) | undefined;
  return spec?.cidrs?.join(', ') || spec?.cidr || '—';
};

const getPoolCapacity = (pool: ExternalIPPool | undefined, allocatedCount: number): string => {
  if (pool?.status?.available === undefined) {
    return '—';
  }

  const available = pool.status.available;
  const total = available + BigInt(allocatedCount);
  return `${available.toString()} of ${total.toString()} available`;
};

const ExternalIpsTable = ({
  externalIps,
  poolsById,
  attachedTargetsByExternalIpId,
}: ExternalIpsTableProps) => {
  const { t } = useTranslation();

  return (
    <Table aria-label={t('External IPs')} variant="compact">
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th>{t('Status')}</Th>
          <Th>{t('Tenant')}</Th>
          <Th>{t('Address')}</Th>
          <Th>{t('IP pool')}</Th>
          <Th>{t('Created')}</Th>
          <Th aria-label={t('Actions')} />
        </Tr>
      </Thead>
      <Tbody>
        {externalIps.map((externalIp) => {
          const address = externalIp.status?.address || '—';
          const name = externalIp.metadata?.name;
          const pool = resolvePool(externalIp, poolsById);
          const available = pool?.status?.available;
          const inUse = externalIp.status?.attached ? 1 : 0;
          const availableForAllocation = externalIp.status?.attached ? 0 : 1;
          const poolId = externalIp.spec?.pool?.id || externalIp.status?.pool;
          const allocatedInPool = externalIps.filter(
            (item) => (item.spec?.pool?.id || item.status?.pool) === poolId,
          ).length;

          return (
            <Tr key={externalIp.id}>
              <Td dataLabel={t('Name')}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <span className="external-ips-table__name-link">{name}</span>
                  </FlexItem>
                  <FlexItem>
                    <Content component="small" className="external-ips-table__name-meta">
                      {t('{{inUse}} in use · {{available}} available', {
                        inUse,
                        available: availableForAllocation,
                      })}
                    </Content>
                  </FlexItem>
                </Flex>
              </Td>
              <Td dataLabel={t('Status')}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <ExternalIpStatusLabel
                      state={externalIp.status?.state}
                      attached={externalIp.status?.attached}
                    />
                  </FlexItem>
                  {externalIp.status?.attached && attachedTargetsByExternalIpId[externalIp.id] ? (
                    <FlexItem>
                      <ExternalIpAttachedTo
                        attached={externalIp.status.attached}
                        target={attachedTargetsByExternalIpId[externalIp.id]}
                      />
                    </FlexItem>
                  ) : null}
                </Flex>
              </Td>
              <Td dataLabel={t('Tenant')}>
                {externalIp.metadata?.tenant || externalIp.metadata?.project || t('Default')}
              </Td>
              <Td dataLabel={t('Address')}>{address}</Td>
              <Td dataLabel={t('IP pool')}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>{externalIp.spec?.pool?.name}</FlexItem>
                  <FlexItem>
                    <Content component="small" className="external-ips-table__meta">
                      {getPoolCidr(pool)}
                    </Content>
                  </FlexItem>
                </Flex>
              </Td>
              <Td dataLabel={t('Created')}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <Timestamp value={externalIp.metadata?.creationTimestamp} />
                  </FlexItem>
                  {available !== undefined ? (
                    <FlexItem>
                      <Content component="small" className="external-ips-table__meta">
                        {getPoolCapacity(pool, allocatedInPool)}
                      </Content>
                    </FlexItem>
                  ) : null}
                </Flex>
              </Td>
              <Td dataLabel={t('Actions')} isActionCell>
                <ExternalIpActionsMenu externalIp={externalIp} />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default ExternalIpsTable;
