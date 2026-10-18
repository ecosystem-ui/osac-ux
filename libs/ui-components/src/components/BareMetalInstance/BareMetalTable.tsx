import { Flex, FlexItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import type { BareMetalInstance } from '@osac/types';

import { BareMetalActionsMenu } from './BareMetalActionsMenu';
import { BareMetalStatusLabel } from './BareMetalStatusLabel';
import { useTranslation } from '../../hooks/useTranslation';
import { Timestamp } from '../Primitives/Timestamp';

import './BareMetalTable.css';

interface BareMetalTableProps {
  instances: BareMetalInstance[];
}

export const BareMetalTable = ({ instances }: BareMetalTableProps) => {
  const { t } = useTranslation();

  return (
    <Table aria-label={t('Bare metal instances')} variant="compact">
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th>{t('Status')}</Th>
          <Th>{t('Catalog item')}</Th>
          <Th>{t('Created')}</Th>
          <Th aria-label={t('Actions')} />
        </Tr>
      </Thead>
      <Tbody>
        {instances.map((instance) => {
          const name = instance.metadata?.name || instance.id;

          return (
            <Tr key={instance.id}>
              <Td dataLabel={t('Name')}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <Link
                      to={`/bare-metal/${encodeURIComponent(instance.id)}`}
                      className="bare-metal-table__name-link"
                    >
                      {name}
                    </Link>
                  </FlexItem>
                </Flex>
              </Td>
              <Td dataLabel={t('Status')}>
                <BareMetalStatusLabel state={instance.status?.state} />
              </Td>
              <Td dataLabel={t('Catalog item')}>{instance.spec?.catalogItem?.name ?? '—'}</Td>
              <Td dataLabel={t('Created')}>
                <Timestamp value={instance.metadata?.creationTimestamp} />
              </Td>
              <Td dataLabel={t('Actions')} isActionCell>
                <BareMetalActionsMenu instance={instance} />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};
