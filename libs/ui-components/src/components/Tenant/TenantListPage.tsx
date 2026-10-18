import { useMemo } from 'react';
import {
  Gallery,
  GalleryItem,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { Tenants } from '@osac/types/private';
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
import { SEARCH_PARAM, usePageFilter } from '@osac/ui-components/hooks/use-page-filter.ts';
import { useUserPreferences } from '@osac/ui-components/hooks/use-user-preferences';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import TenantCard from './TenantCard';
import TenantTable from './TenantTable';

export const TENANTS_VIEW_KEY = 'tenants';

const TenantListPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = usePageFilter(SEARCH_PARAM);
  const [viewTypePref] = useUserPreferences(getViewTypePrefKey(TENANTS_VIEW_KEY));
  const viewType: ViewType = isViewType(viewTypePref) ? viewTypePref : DEFAULT_VIEW_TYPE;

  const { data, isLoading, error } = useListResource(Tenants);

  const filteredTenants = useMemo(() => {
    if (!search || !data?.items) {
      return data?.items || [];
    }
    const lowerSearch = search.toLowerCase();
    return data.items.filter((tenant) => {
      const name = tenant.metadata?.name ?? tenant.id;
      return name.toLowerCase().includes(lowerSearch);
    });
  }, [search, data?.items]);

  return (
    <ListPage
      title={t('Tenants')}
      label={t('Administration')}
      description={t('Manage tenants for this cloud platform.')}
      error={error}
      actions={<CreateButton to="/admin/tenants/create">{t('Create tenant')}</CreateButton>}
    >
      <ListPageBody isLoading={isLoading} error={error}>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup>
                <ToolbarItem>
                  <SearchInput
                    placeholder={t('Search tenants')}
                    value={search}
                    onChange={(_e, v) => setSearch(v)}
                    onClear={() => setSearch('')}
                    aria-label={t('Search tenants')}
                  />
                </ToolbarItem>
            </ToolbarGroup>
            <ToolbarGroup align={{ default: 'alignEnd' }}>
              <ToolbarItem>
                <ViewSwitcher pageKey={TENANTS_VIEW_KEY} />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
        {filteredTenants.length === 0 ? (
          <SubtleContent component="p">
            {search
              ? t('No tenants match your search.')
              : t('No tenants yet. Register one to get started.')}
          </SubtleContent>
        ) : (
          viewType === 'cards' ? (
            <Gallery hasGutter minWidths={{ default: '20.875rem' }} maxWidths={{ default: '20.875rem' }}>
              {filteredTenants.map((tenant) => (
                <GalleryItem key={tenant.id}>
                  <TenantCard tenant={tenant} />
                </GalleryItem>
              ))}
            </Gallery>
          ) : (
            <TenantTable tenants={filteredTenants} />
          )
        )}
      </ListPageBody>
    </ListPage>
  );
};

export default TenantListPage;
