import { FC } from 'react';
import { Content, Flex, FlexItem, Label } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import CatalogItemLaunchButton from '@osac/ui-components/components/catalog/CatalogItemLaunchButton';
import type { CatalogItemResourceLookups } from '@osac/ui-components/components/catalog/catalogItemResourceLookups';
import CatalogItemResources from '@osac/ui-components/components/catalog/CatalogItemResources';
import CatalogItemTenant from '@osac/ui-components/components/catalog/CatalogItemTenant';
import { Timestamp } from '@osac/ui-components/components/Primitives/Timestamp';
import { useSession } from '@osac/ui-components/hooks/use-session';

import CatalogItemActionsMenu from './CatalogItemActionsMenu';
import {
  type CatalogItem,
  catalogItemDetailsPath,
  catalogItemTypeBadgeLabel,
} from './catalogItemDisplay';
import { useTranslation } from '../../hooks/useTranslation';

import './CatalogItemTable.css';

interface CatalogItemTableProps {
  items: CatalogItem[];
  resourceLookups: CatalogItemResourceLookups;
}

const CatalogItemTable: FC<CatalogItemTableProps> = ({ items, resourceLookups }) => {
  const { t } = useTranslation();
  const { role } = useSession();
  const nameLabel = t('Name');
  const statusLabel = t('Status');
  const configurationLabel = t('Configuration');
  const tenantLabel = t('Visibility');
  const createdLabel = t('Created');
  const sourceLabel = t('Source');
  const addedLabel = t('Added');
  const actionsLabel = t('Actions');

  return (
    <Table aria-label={t('Catalog items')} variant="compact">
      <Thead>
        <Tr>
          <Th>{nameLabel}</Th>
          <Th>{statusLabel}</Th>
          <Th>{configurationLabel}</Th>
          {role === 'admin' ? (
            <>
              <Th>{tenantLabel}</Th>
              <Th>{createdLabel}</Th>
            </>
          ) : role === 'tenant-admin' ? (
            <>
              <Th>{sourceLabel}</Th>
              <Th>{addedLabel}</Th>
            </>
          ) : null}
          <Th aria-label={actionsLabel} />
        </Tr>
      </Thead>
      <Tbody>
        {items.map((item) => {
          const name = item.metadata?.name || item.id;
          const typeLabel = catalogItemTypeBadgeLabel(item, t);

          return (
            <Tr key={item.id}>
              <Td dataLabel={nameLabel}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <Link
                      to={catalogItemDetailsPath(item)}
                      className="catalog-items-table__name-link"
                    >
                      {name}
                    </Link>
                  </FlexItem>
                  {typeLabel ? (
                    <FlexItem>
                      <Content component="small" className="catalog-items-table__name-meta">
                        {typeLabel}
                      </Content>
                    </FlexItem>
                  ) : null}
                </Flex>
              </Td>
              <Td dataLabel={statusLabel}>
                {item.published ? (
                  <Label color="green" isCompact>
                    {t('Live')}
                  </Label>
                ) : (
                  <Label isCompact>{t('Unpublished')}</Label>
                )}
              </Td>
              <Td dataLabel={configurationLabel}>
                <CatalogItemResources catalogItem={item} resourceLookups={resourceLookups} />
              </Td>
              {role === 'admin' ? (
                <>
                  <Td dataLabel={tenantLabel}>
                    <CatalogItemTenant catalogItem={item} />
                  </Td>
                  <Td dataLabel={createdLabel}>
                    <Timestamp value={item.metadata?.creationTimestamp} format="Time" />
                  </Td>
                </>
              ) : role === 'tenant-admin' ? (
                <>
                  <Td dataLabel={sourceLabel}>{item.metadata?.creator || '-'}</Td>
                  <Td dataLabel={addedLabel}>
                    <Timestamp value={item.metadata?.creationTimestamp} format="Date" />
                  </Td>
                </>
              ) : null}
              <Td dataLabel={actionsLabel} isActionCell>
                {role === 'tenant-user' ? (
                  <CatalogItemLaunchButton isDisabled={!item.published} catalogItem={item} />
                ) : (
                  <CatalogItemActionsMenu item={item} role={role} />
                )}
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default CatalogItemTable;
