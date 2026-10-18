import { useMemo } from 'react';
import { Alert, Divider, Flex, FlexItem, Stack, StackItem, Title } from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import ListPage from '@osac/ui-components/components/Page/ListPage';
import ListPageBody from '@osac/ui-components/components/Page/ListPageBody';
import CreateButton from '@osac/ui-components/components/Primitives/CreateButton.tsx';
import ResourceNameField from '@osac/ui-components/components/Resource/ResourceNameField.tsx';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import {
  storageBackendIdsFilter,
  usePrivateStorageBackends,
} from '../../api/v1/private/storage-backends';
import { usePrivateStorageTiers } from '../../api/v1/private/storage-tiers';
import { StorageBackendsTable } from '../../components/Storage/StorageBackendsTable';
import StorageTierActionsMenu from '../../components/Storage/StorageTierActionsMenu';
import {
  protocolLabel,
  uniqueBackendIds,
} from '../../components/Storage/storageTierBackendResolution';
import { StorageTierStatusLabel } from '../../components/Storage/StorageTierStatusLabel';
import { SubtleContent } from '../../components/SubtleContent/SubtleContent';

import '../../components/Storage/StorageTables.css';

export const StorageManagementPage = () => {
  const { t } = useTranslation();

  // ── Backends ──────────────────────────────────────────────────────────────
  const {
    data: backends = [],
    isLoading: isLoadingBackends,
    error: backendsError,
  } = usePrivateStorageBackends();

  // ── Tiers ─────────────────────────────────────────────────────────────────
  const {
    data: tiers = [],
    isLoading: isLoadingTiers,
    error: tiersError,
  } = usePrivateStorageTiers();

  const backendIds = useMemo(() => uniqueBackendIds(tiers), [tiers]);
  const { data: tierBackends = [], error: tierBackendsError } = usePrivateStorageBackends(
    { filter: storageBackendIdsFilter(backendIds) },
    { enabled: backendIds.length > 0 },
  );

  const backendsById = useMemo(() => new Map(tierBackends.map((b) => [b.id, b])), [tierBackends]);
  const protocolLabels = protocolLabel(t);

  return (
    <ListPage
      title={t('Storage')}
      description={t('Manage storage backends and tiers for this cloud platform.')}
    >
      <Stack hasGutter>
        {/* ── Backends section ─────────────────────────────────────────── */}
        <StackItem>
          <Flex
            alignItems={{ default: 'alignItemsBaseline' }}
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
            flexWrap={{ default: 'wrap' }}
            spaceItems={{ default: 'spaceItemsSm' }}
          >
            <FlexItem>
              <Title headingLevel="h2" size="lg">
                {t('Backends')}
              </Title>
            </FlexItem>
            <FlexItem>
              <CreateButton
                to="/admin/infrastructure/storage/backends/create"
                variant="secondary"
                size="sm"
                icon={<PlusCircleIcon />}
              >
                {t('Create backend')}
              </CreateButton>
            </FlexItem>
          </Flex>
        </StackItem>
        <StackItem>
          <ListPageBody isLoading={isLoadingBackends} error={backendsError}>
            {backends.length === 0 ? (
              <SubtleContent component="p">
                {t('No storage backends yet. Create one to get started.')}
              </SubtleContent>
            ) : (
              <StorageBackendsTable backends={backends} />
            )}
          </ListPageBody>
        </StackItem>

        <StackItem className="pf-v6-u-pt-md">
          <Divider />
        </StackItem>

        {/* ── Tiers section ────────────────────────────────────────────── */}
        <StackItem>
          <Flex
            alignItems={{ default: 'alignItemsBaseline' }}
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
            flexWrap={{ default: 'wrap' }}
            spaceItems={{ default: 'spaceItemsSm' }}
          >
            <FlexItem>
              <Title headingLevel="h2" size="lg">
                {t('Tiers')}
              </Title>
            </FlexItem>
            <FlexItem>
              <CreateButton
                to="/admin/infrastructure/storage/tiers/create"
                variant="secondary"
                size="sm"
                icon={<PlusCircleIcon />}
              >
                {t('Create tier')}
              </CreateButton>
            </FlexItem>
          </Flex>
        </StackItem>
        <StackItem>
          <ListPageBody isLoading={isLoadingTiers} error={tiersError}>
            <Stack hasGutter>
              {Boolean(tierBackendsError) && (
                <StackItem>
                  <Alert variant="warning" isInline title={t('Unable to resolve backend names')}>
                    {t(
                      'Backend IDs are shown in place of names until this recovers. This is separate from the normal fallback shown when a tier references a backend that no longer exists.',
                    )}
                  </Alert>
                </StackItem>
              )}
              <StackItem>
                {tiers.length === 0 ? (
                  <SubtleContent component="p">
                    {t('No storage tiers yet. Create one to get started.')}
                  </SubtleContent>
                ) : (
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
                        const backendAssociations = tier.spec?.backends ?? [];
                        return (
                          <Tr key={tier.id}>
                            <Td dataLabel={t('Name')}>
                              <ResourceNameField
                                resource={tier}
                                detailsUrl={`/admin/infrastructure/storage/tiers/${tier.id}`}
                                nameLinkClassName="storage-resource-link"
                              />
                            </Td>
                            <Td dataLabel={t('Status')}>
                              <StorageTierStatusLabel state={tier.status?.state} />
                            </Td>
                            <Td dataLabel={t('Backends')}>
                              {backendAssociations
                                .map(
                                  (assoc) =>
                                    backendsById.get(assoc.backendId)?.metadata?.name ??
                                    assoc.backendId,
                                )
                                .join(', ')}
                            </Td>
                            <Td dataLabel={t('Protocol')}>
                              {tier.spec?.protocol !== undefined
                                ? protocolLabels[tier.spec.protocol]
                                : '—'}
                            </Td>
                            <Td dataLabel={t('Actions')} isActionCell>
                              <StorageTierActionsMenu tier={tier} />
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                )}
              </StackItem>
            </Stack>
          </ListPageBody>
        </StackItem>
      </Stack>
    </ListPage>
  );
};
