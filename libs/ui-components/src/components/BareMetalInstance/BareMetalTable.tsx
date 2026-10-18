import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import type { BareMetalInstance } from '@osac/types';

import { BareMetalActionsMenu } from './BareMetalActionsMenu';
import { BareMetalStatusLabel } from './BareMetalStatusLabel';
import { useTranslation } from '../../hooks/useTranslation';
import { Timestamp } from '../Primitives/Timestamp';
import ResourceNameField from '../Resource/ResourceNameField';

interface BareMetalTableProps {
  instances: BareMetalInstance[];
}

export const BareMetalTable = ({ instances }: BareMetalTableProps) => {
  const { t } = useTranslation();

  return (
    <Table aria-label={t('Bare metal instances')} variant="compact" borders>
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
        {instances.map((instance) => (
          <Tr key={instance.id}>
            <Td dataLabel={t('Name')}>
              <ResourceNameField
                resource={instance}
                detailsUrl={`/bare-metal/${encodeURIComponent(instance.id)}`}
              />
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
        ))}
      </Tbody>
    </Table>
  );
};
