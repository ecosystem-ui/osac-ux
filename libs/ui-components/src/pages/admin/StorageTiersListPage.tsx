import { useMemo } from 'react';
import {
  Alert,
  Flex,
  FlexItem,
  SearchInput,
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import type { StorageTier } from '@osac/types/private';
import { cel } from '@osac/ui-components/api/cel';
import CreateButton from '@osac/ui-components/components/Primitives/CreateButton.tsx';
import { SEARCH_PARAM, usePageFilter } from '@osac/ui-components/hooks/use-page-filter.ts';

import {
  storageBackendIdsFilter,
  usePrivateStorageBackends,
} from '../../api/v1/private/storage-backends';
import { usePrivateStorageTiers } from '../../api/v1/private/storage-tiers';
import ListPageBody from '../../components/Page/ListPageBody';
import { StorageTiersTable } from '../../components/Storage/StorageTiersTable';
import { uniqueBackendIds } from '../../components/Storage/storageTierBackendResolution';
import { SubtleContent } from '../../components/SubtleContent/SubtleContent';
import { useTranslation } from '../../hooks/useTranslation';

export const StorageTiersListPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = usePageFilter(SEARCH_PARAM);

  const filter = useMemo(
    () =>
      search
        ? cel<StorageTier>((f) => f.field('metadata.name').contains(search.trim()))
        : undefined,
    [search],
  );

  const { data: tiers = [], isLoading, error } = usePrivateStorageTiers(
    filter ? { filter } : undefined,
  );

  const backendIds = useMemo(() => uniqueBackendIds(tiers), [tiers]);

  const { data: backends = [], error: backendsError } = usePrivateStorageBackends(
    { filter: storageBackendIdsFilter(backendIds) },
    { enabled: backendIds.length > 0 },
  );

  const backendsById = useMemo(
    () => new Map(backends.map((backend) => [backend.id, backend])),
    [backends],
  );

  return (
    <Stack hasGutter>
      <StackItem>
        <Flex className="pf-v6-u-mt-md" justifyContent={{ default: 'justifyContentFlexEnd' }}>
          <FlexItem>
            <CreateButton to="/admin/infrastructure/storage/tiers/create">
              {t('Create tier')}
            </CreateButton>
          </FlexItem>
        </Flex>
      </StackItem>
      <StackItem>
        <ListPageBody isLoading={isLoading} error={error}>
          <Stack hasGutter>
            {Boolean(backendsError) && (
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
                        value={search}
                        onChange={(_e, v) => setSearch(v)}
                        onClear={() => setSearch('')}
                        aria-label={t('Search storage tiers')}
                      />
                    </ToolbarItem>
                  </ToolbarGroup>
                </ToolbarContent>
              </Toolbar>
              {tiers.length === 0 ? (
                <SubtleContent component="p">
                  {search
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
  );
};
