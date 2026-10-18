import { useMemo } from 'react';
import {
  Alert,
  Divider,
  Flex,
  FlexItem,
  SearchInput,
  Stack,
  StackItem,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import DatabaseIcon from '@patternfly/react-icons/dist/esm/icons/database-icon';
import LayerGroupIcon from '@patternfly/react-icons/dist/esm/icons/layer-group-icon';

import type { StorageBackend, StorageTier } from '@osac/types/private';
import { cel } from '@osac/ui-components/api/cel';
import ListPage from '@osac/ui-components/components/Page/ListPage';
import ListPageBody from '@osac/ui-components/components/Page/ListPageBody';
import CreateButton from '@osac/ui-components/components/Primitives/CreateButton.tsx';
import { usePageFilter } from '@osac/ui-components/hooks/use-page-filter.ts';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import {
  storageBackendIdsFilter,
  usePrivateStorageBackends,
} from '../../api/v1/private/storage-backends';
import { usePrivateStorageTiers } from '../../api/v1/private/storage-tiers';
import { StorageBackendsTable } from '../../components/Storage/StorageBackendsTable';
import { uniqueBackendIds } from '../../components/Storage/storageTierBackendResolution';
import { StorageTiersTable } from '../../components/Storage/StorageTiersTable';
import { SubtleContent } from '../../components/SubtleContent/SubtleContent';

const BACKEND_SEARCH_PARAM = 'backendSearch';
const TIER_SEARCH_PARAM = 'tierSearch';

export const StorageManagementPage = () => {
  const { t } = useTranslation();
  const [backendSearch, setBackendSearch] = usePageFilter(BACKEND_SEARCH_PARAM);
  const [tierSearch, setTierSearch] = usePageFilter(TIER_SEARCH_PARAM);

  const backendFilter = useMemo(
    () =>
      backendSearch
        ? cel<StorageBackend>((f) => f.field('metadata.name').contains(backendSearch.trim()))
        : undefined,
    [backendSearch],
  );

  const tierFilter = useMemo(
    () =>
      tierSearch
        ? cel<StorageTier>((f) => f.field('metadata.name').contains(tierSearch.trim()))
        : undefined,
    [tierSearch],
  );

  const {
    data: backends = [],
    isLoading: isLoadingBackends,
    error: backendsError,
  } = usePrivateStorageBackends(backendFilter ? { filter: backendFilter } : undefined);

  const {
    data: tiers = [],
    isLoading: isLoadingTiers,
    error: tiersError,
  } = usePrivateStorageTiers(tierFilter ? { filter: tierFilter } : undefined);

  const backendIds = useMemo(() => uniqueBackendIds(tiers), [tiers]);
  const { data: tierBackends = [], error: tierBackendsError } = usePrivateStorageBackends(
    { filter: storageBackendIdsFilter(backendIds) },
    { enabled: backendIds.length > 0 },
  );

  const backendsById = useMemo(() => new Map(tierBackends.map((b) => [b.id, b])), [tierBackends]);

  return (
    <ListPage
      title={t('Storage')}
      description={t('Manage storage backends and tiers for this cloud platform.')}
    >
      <Stack hasGutter>
        <StackItem>
          <Flex
            alignItems={{ default: 'alignItemsBaseline' }}
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
            flexWrap={{ default: 'wrap' }}
            spaceItems={{ default: 'spaceItemsSm' }}
          >
            <FlexItem>
              <Flex
                alignItems={{ default: 'alignItemsCenter' }}
                spaceItems={{ default: 'spaceItemsSm' }}
              >
                <DatabaseIcon aria-hidden />
                <Title headingLevel="h2" size="lg">
                  {t('Backends')}
                </Title>
              </Flex>
            </FlexItem>
            <FlexItem>
              <CreateButton to="/admin/infrastructure/storage/backends/create">
                {t('Create backend')}
              </CreateButton>
            </FlexItem>
          </Flex>
        </StackItem>
        <StackItem>
          <ListPageBody isLoading={isLoadingBackends} error={backendsError}>
            <Toolbar>
              <ToolbarContent>
                <ToolbarGroup>
                  <ToolbarItem>
                    <SearchInput
                      placeholder={t('Search storage backends')}
                      value={backendSearch}
                      onChange={(_e, v) => setBackendSearch(v)}
                      onClear={() => setBackendSearch('')}
                      aria-label={t('Search storage backends')}
                    />
                  </ToolbarItem>
                </ToolbarGroup>
              </ToolbarContent>
            </Toolbar>
            {backends.length === 0 ? (
              <SubtleContent component="p">
                {backendSearch
                  ? t('No storage backends match your search.')
                  : t('No storage backends yet. Create one to get started.')}
              </SubtleContent>
            ) : (
              <StorageBackendsTable backends={backends} />
            )}
          </ListPageBody>
        </StackItem>

        <StackItem className="pf-v6-u-pt-md">
          <Divider />
        </StackItem>

        <StackItem>
          <Flex
            alignItems={{ default: 'alignItemsBaseline' }}
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
            flexWrap={{ default: 'wrap' }}
            spaceItems={{ default: 'spaceItemsSm' }}
          >
            <FlexItem>
              <Flex
                alignItems={{ default: 'alignItemsCenter' }}
                spaceItems={{ default: 'spaceItemsSm' }}
              >
                <LayerGroupIcon aria-hidden />
                <Title headingLevel="h2" size="lg">
                  {t('Tiers')}
                </Title>
              </Flex>
            </FlexItem>
            <FlexItem>
              <CreateButton to="/admin/infrastructure/storage/tiers/create">
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
                <Toolbar>
                  <ToolbarContent>
                    <ToolbarGroup>
                      <ToolbarItem>
                        <SearchInput
                          placeholder={t('Search storage tiers')}
                          value={tierSearch}
                          onChange={(_e, v) => setTierSearch(v)}
                          onClear={() => setTierSearch('')}
                          aria-label={t('Search storage tiers')}
                        />
                      </ToolbarItem>
                    </ToolbarGroup>
                  </ToolbarContent>
                </Toolbar>
                {tiers.length === 0 ? (
                  <SubtleContent component="p">
                    {tierSearch
                      ? t('No storage tiers match your search.')
                      : t('No storage tiers yet. Create one to get started.')}
                  </SubtleContent>
                ) : (
                  <StorageTiersTable tiers={tiers} backendsById={backendsById} />
                )}
              </StackItem>
            </Stack>
          </ListPageBody>
        </StackItem>
      </Stack>
    </ListPage>
  );
};
