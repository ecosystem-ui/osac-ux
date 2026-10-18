import { Content, Flex, FlexItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import type { SecurityGroup, VirtualNetwork } from '@osac/types';

import { SecurityGroupStatusLabel } from './SecurityGroupStatusLabel';
import { resourceDisplayName } from '../../api/v1/networking';
import { useTranslation } from '../../hooks/useTranslation';

import './SecurityGroupsTable.css';

interface SecurityGroupsTableProps {
  securityGroups: SecurityGroup[];
  virtualNetworks: VirtualNetwork[];
}

export const SecurityGroupsTable = ({
  securityGroups,
  virtualNetworks,
}: SecurityGroupsTableProps) => {
  const { t } = useTranslation();

  return (
    <Table aria-label={t('Security groups')} variant="compact">
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th>{t('Status')}</Th>
          <Th>{t('Virtual Network')}</Th>
          <Th>{t('Inbound Rules')}</Th>
          <Th>{t('Outbound Rules')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {securityGroups.map((sg) => {
          const name = sg.metadata?.name || sg.id;
          const vnId = sg.spec?.virtualNetwork?.id ?? '';
          const vn = virtualNetworks.find((v) => v.id === vnId);
          const vnName = resourceDisplayName(vn?.metadata, vnId);
          const vnCidr = vn?.spec?.ipv4Cidr;
          const ingressCount = sg.spec?.ingress?.length ?? 0;
          const egressCount = sg.spec?.egress?.length ?? 0;

          return (
            <Tr key={sg.id}>
              <Td dataLabel={t('Name')}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <Link
                      to={`/networking/security-groups/${encodeURIComponent(sg.id)}`}
                      className="security-groups-table__name-link"
                    >
                      {name}
                    </Link>
                  </FlexItem>
                </Flex>
              </Td>
              <Td dataLabel={t('Status')}>
                <SecurityGroupStatusLabel state={sg.status?.state} />
              </Td>
              <Td dataLabel={t('Virtual Network')}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    {vnId ? (
                      <Link
                        to={`/networking/virtual-networks/${encodeURIComponent(vnId)}`}
                        className="security-groups-table__name-link"
                      >
                        {vnName}
                      </Link>
                    ) : (
                      vnName
                    )}
                  </FlexItem>
                  {vnCidr ? (
                    <FlexItem>
                      <Content component="small" className="security-groups-table__meta">
                        {vnCidr}
                      </Content>
                    </FlexItem>
                  ) : null}
                </Flex>
              </Td>
              <Td dataLabel={t('Inbound Rules')}>{ingressCount}</Td>
              <Td dataLabel={t('Outbound Rules')}>{egressCount}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};
