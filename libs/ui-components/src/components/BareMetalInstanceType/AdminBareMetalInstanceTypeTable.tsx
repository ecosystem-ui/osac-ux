import { Flex, FlexItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import type { BareMetalInstanceType as PrivateBareMetalInstanceType } from '@osac/types/private';

import AdminBareMetalInstanceTypeActionsMenu from './AdminBareMetalInstanceTypeActionsMenu';
import { BAREMETAL_INSTANCE_TYPES_LIST_ROUTE } from './AdminBareMetalInstanceTypeListPage';
import { useTranslation } from '../../hooks/useTranslation';

import './AdminBareMetalInstanceTypeTable.css';

interface AdminBareMetalInstanceTypeTableProps {
  bareMetalInstanceTypes: PrivateBareMetalInstanceType[];
}

const AdminBareMetalInstanceTypeTable = ({
  bareMetalInstanceTypes,
}: AdminBareMetalInstanceTypeTableProps) => {
  const { t } = useTranslation();

  return (
    <Table aria-label={t('Bare metal instance types')} variant="compact">
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th>{t('CPU')}</Th>
          <Th>{t('Memory (GiB)')}</Th>
          <Th>{t('Accelerators')}</Th>
          <Th aria-label={t('Actions')} />
        </Tr>
      </Thead>
      <Tbody>
        {bareMetalInstanceTypes.map((bareMetalInstanceType) => {
          const name = bareMetalInstanceType.metadata?.name || bareMetalInstanceType.id;
          const cpu = bareMetalInstanceType.spec?.hardware?.cpu;
          const memory = bareMetalInstanceType.spec?.hardware?.memory;
          const acceleratorCount =
            bareMetalInstanceType.spec?.hardware?.accelerators.length ?? 0;

          return (
            <Tr key={bareMetalInstanceType.id}>
              <Td dataLabel={t('Name')}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <Link
                      to={`${BAREMETAL_INSTANCE_TYPES_LIST_ROUTE}/${encodeURIComponent(bareMetalInstanceType.id)}`}
                      className="bare-metal-instance-types-table__name-link"
                    >
                      {name}
                    </Link>
                  </FlexItem>
                </Flex>
              </Td>
              <Td dataLabel={t('CPU')}>
                {cpu ? `${cpu.cores} (${cpu.architecture})` : '—'}
              </Td>
              <Td dataLabel={t('Memory (GiB)')}>
                {memory ? memory.totalGb.toString() : '—'}
              </Td>
              <Td dataLabel={t('Accelerators')}>
                {acceleratorCount > 0 ? acceleratorCount : '—'}
              </Td>
              <Td dataLabel={t('Actions')} isActionCell>
                <AdminBareMetalInstanceTypeActionsMenu instanceType={bareMetalInstanceType} />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default AdminBareMetalInstanceTypeTable;
