import { Flex, FlexItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import type { Volume } from '@osac/types';

import { VolumeAccessModeLabel } from './VolumeAccessModeLabel';
import VolumeActionsMenu from './VolumeActionsMenu';
import { VolumeStatusLabel } from './VolumeStatusLabel';
import { useTranslation } from '../../hooks/useTranslation';
import { Timestamp } from '../Primitives/Timestamp';

import './VolumeTable.css';

interface VolumeTableProps {
  volumes: Volume[];
}

const formatSizeGib = (sizeGib: bigint | undefined): string => {
  if (sizeGib === undefined) {
    return '—';
  }
  return `${Number(sizeGib)} GiB`;
};

export const VolumeTable = ({ volumes }: VolumeTableProps) => {
  const { t } = useTranslation();

  return (
    <Table aria-label={t('Volumes')} variant="compact">
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th>{t('State')}</Th>
          <Th>{t('Storage Tier')}</Th>
          <Th>{t('Size')}</Th>
          <Th>{t('Access Mode')}</Th>
          <Th>{t('Created')}</Th>
          <Th aria-label={t('Actions')} />
        </Tr>
      </Thead>
      <Tbody>
        {volumes.map((volume) => {
          const name = volume.metadata?.name || volume.id;

          return (
            <Tr key={volume.id}>
              <Td dataLabel={t('Name')}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <Link
                      to={`/storage/volumes/${encodeURIComponent(volume.id)}`}
                      className="volumes-table__name-link"
                    >
                      {name}
                    </Link>
                  </FlexItem>
                </Flex>
              </Td>
              <Td dataLabel={t('State')}>
                <VolumeStatusLabel state={volume.status?.state} />
              </Td>
              <Td dataLabel={t('Storage Tier')}>{volume.spec?.storageTier ?? '—'}</Td>
              <Td dataLabel={t('Size')}>{formatSizeGib(volume.spec?.sizeGib)}</Td>
              <Td dataLabel={t('Access Mode')}>
                <VolumeAccessModeLabel accessMode={volume.spec?.accessMode} />
              </Td>
              <Td dataLabel={t('Created')}>
                <Timestamp value={volume.metadata?.creationTimestamp} />
              </Td>
              <Td dataLabel={t('Actions')} isActionCell>
                <VolumeActionsMenu volume={volume} />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};
