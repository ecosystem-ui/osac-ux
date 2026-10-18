import { useMemo } from 'react';
import {
  Flex,
  FlexItem,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import type { StorageBackend } from '@osac/types/private';
import { cel } from '@osac/ui-components/api/cel';
import { usePrivateStorageBackends } from '@osac/ui-components/api/v1/private/storage-backends';
import ListPageBody from '@osac/ui-components/components/Page/ListPageBody';
import CreateButton from '@osac/ui-components/components/Primitives/CreateButton.tsx';
import { StorageBackendsTable } from '@osac/ui-components/components/Storage/StorageBackendsTable';
import { SubtleContent } from '@osac/ui-components/components/SubtleContent/SubtleContent';
import { SEARCH_PARAM, usePageFilter } from '@osac/ui-components/hooks/use-page-filter.ts';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

export const StorageBackendsListPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = usePageFilter(SEARCH_PARAM);

  const filter = useMemo(
    () =>
      search
        ? cel<StorageBackend>((f) => f.field('metadata.name').contains(search.trim()))
        : undefined,
    [search],
  );

  const { data: backends = [], isLoading, error } = usePrivateStorageBackends(
    filter ? { filter } : undefined,
  );

  return (
    <>
      <Flex className="pf-v6-u-mt-md" justifyContent={{ default: 'justifyContentFlexEnd' }}>
        <FlexItem>
          <CreateButton to="/admin/infrastructure/storage/backends/create">
            {t('Create backend')}
          </CreateButton>
        </FlexItem>
      </Flex>
      <ListPageBody isLoading={isLoading} error={error}>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem>
                <SearchInput
                  placeholder={t('Search storage backends')}
                  value={search}
                  onChange={(_e, v) => setSearch(v)}
                  onClear={() => setSearch('')}
                  aria-label={t('Search storage backends')}
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
        {backends.length === 0 ? (
          <SubtleContent component="p">
            {search
              ? t('No storage backends match your search.')
              : t('No storage backends yet. Create one to get started.')}
          </SubtleContent>
        ) : (
          <StorageBackendsTable backends={backends} />
        )}
      </ListPageBody>
    </>
  );
};
