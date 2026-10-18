import { useMemo } from 'react';
import {
  FormSelect,
  FormSelectOption,
  Gallery,
  GalleryItem,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { ExternalIPPoolState, ExternalIPPools } from '@osac/types/private';
import { useListResource } from '@osac/ui-components/api/use-resource';
import ListPage from '@osac/ui-components/components/Page/ListPage';
import ListPageBody from '@osac/ui-components/components/Page/ListPageBody';
import CreateButton from '@osac/ui-components/components/Primitives/CreateButton.tsx';
import {
  DEFAULT_VIEW_TYPE,
  getViewTypePrefKey,
  isViewType,
} from '@osac/ui-components/components/Primitives/ViewSwitcher';
import type { ViewType } from '@osac/ui-components/components/Primitives/ViewSwitcher';
import ViewSwitcher from '@osac/ui-components/components/Primitives/ViewSwitcher.tsx';
import { SubtleContent } from '@osac/ui-components/components/SubtleContent/SubtleContent';
import { SEARCH_PARAM, usePageFilter } from '@osac/ui-components/hooks/use-page-filter';
import { useUserPreferences } from '@osac/ui-components/hooks/use-user-preferences';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import ExternalIpPoolCard from './ExternalIpPoolCard';
import { ExternalIpPoolsTable } from './ExternalIpPoolsTable';

const EXTERNAL_IP_POOLS_VIEW_KEY = 'admin-external-ip-pools';
const STATUS_PARAM = 'status';

const STATUS_FILTER_OPTIONS = [
  { value: 'ready', state: ExternalIPPoolState.EXTERNAL_IP_POOL_STATE_READY },
  {
    value: 'pending',
    state: ExternalIPPoolState.EXTERNAL_IP_POOL_STATE_PENDING,
  },
  { value: 'failed', state: ExternalIPPoolState.EXTERNAL_IP_POOL_STATE_FAILED },
  {
    value: 'deleting',
    state: ExternalIPPoolState.EXTERNAL_IP_POOL_STATE_DELETING,
  },
] as const;

type StatusFilterValue = (typeof STATUS_FILTER_OPTIONS)[number]['value'];

const isStatusFilterValue = (value: string): value is StatusFilterValue =>
  STATUS_FILTER_OPTIONS.some((option) => option.value === value);

const getStatusFilterLabel = (value: StatusFilterValue, t: (key: string) => string): string => {
  switch (value) {
    case 'ready':
      return t('Ready');
    case 'pending':
      return t('Provisioning');
    case 'failed':
      return t('Failed');
    case 'deleting':
      return t('Deleting');
  }
};

export const ExternalIpPoolsListPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = usePageFilter(SEARCH_PARAM);
  const [statusFilter, setStatusFilter] = usePageFilter(STATUS_PARAM);
  const [viewTypePref] = useUserPreferences(getViewTypePrefKey(EXTERNAL_IP_POOLS_VIEW_KEY));
  const viewType: ViewType = isViewType(viewTypePref) ? viewTypePref : DEFAULT_VIEW_TYPE;

  const { data, isLoading, error } = useListResource(ExternalIPPools);
  const pools = useMemo(() => data?.items ?? [], [data?.items]);
  const selectedStatus: StatusFilterValue | 'all' = isStatusFilterValue(statusFilter)
    ? statusFilter
    : 'all';
  const filteredPools = useMemo(() => {
    const query = search.trim().toLowerCase();
    const selectedOption = STATUS_FILTER_OPTIONS.find((option) => option.value === selectedStatus);

    return pools.filter((pool) => {
      const matchesStatus = !selectedOption || pool.status?.state === selectedOption.state;
      const searchableValues = [
        pool.metadata?.name,
        pool.metadata?.tenant,
        ...(pool.spec?.cidrs ?? []),
      ];
      const matchesSearch =
        !query || searchableValues.some((value) => value?.toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [pools, search, selectedStatus]);

  return (
    <ListPage
      title={t('External IP pools')}
      description={t('Manage external IP address pools for this cloud platform.')}
      error={error}
      actions={
        <CreateButton to="/admin/infrastructure/external-ip-pools/create">
          {t('Create pool')}
        </CreateButton>
      }
    >
      <ListPageBody isLoading={isLoading} error={error}>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem>
                <FormSelect
                  id="external-ip-pools-status-filter"
                  value={selectedStatus}
                  onChange={(_event, value) => setStatusFilter(value === 'all' ? '' : value)}
                  aria-label={t('Filter external IP pools by status')}
                >
                  <FormSelectOption value="all" label={t('All statuses')} />
                  {STATUS_FILTER_OPTIONS.map((option) => (
                    <FormSelectOption
                      key={option.value}
                      value={option.value}
                      label={getStatusFilterLabel(option.value, t)}
                    />
                  ))}
                </FormSelect>
              </ToolbarItem>
              <ToolbarItem>
                <SearchInput
                  placeholder={t('Search external IP pools')}
                  value={search}
                  onChange={(_event, value) => setSearch(value)}
                  onClear={() => setSearch('')}
                  aria-label={t('Search external IP pools')}
                />
              </ToolbarItem>
            </ToolbarGroup>
            <ToolbarGroup align={{ default: 'alignEnd' }}>
              <ToolbarItem>
                <ViewSwitcher pageKey={EXTERNAL_IP_POOLS_VIEW_KEY} />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
        {filteredPools.length === 0 ? (
          <SubtleContent component="p">
            {search || selectedStatus !== 'all'
              ? t('No external IP pools match your search.')
              : t('No external IP pools yet. Create one to get started.')}
          </SubtleContent>
        ) : viewType === 'cards' ? (
          <Gallery
            hasGutter
            minWidths={{ default: '20.875rem' }}
            maxWidths={{ default: '20.875rem' }}
          >
            {filteredPools.map((pool) => (
              <GalleryItem key={pool.id}>
                <ExternalIpPoolCard pool={pool} />
              </GalleryItem>
            ))}
          </Gallery>
        ) : (
          <ExternalIpPoolsTable pools={filteredPools} />
        )}
      </ListPageBody>
    </ListPage>
  );
};
