import { useMemo } from 'react';
import {
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { InstanceTypes } from '@osac/types/private';
import type { InstanceType as PrivateInstanceType } from '@osac/types/private';
import { cel } from '@osac/ui-components/api/cel';
import { useListResource } from '@osac/ui-components/api/use-resource';
import CreateButton from '@osac/ui-components/components/Primitives/CreateButton.tsx';
import { SEARCH_PARAM, usePageFilter } from '@osac/ui-components/hooks/use-page-filter.ts';

import AdminInstanceTypeTable from './AdminInstanceTypeTable';
import { useTranslation } from '../../hooks/useTranslation';
import ListPage from '../Page/ListPage';
import ListPageBody from '../Page/ListPageBody';
import { SubtleContent } from '../SubtleContent/SubtleContent';

const AdminInstanceTypeListPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = usePageFilter(SEARCH_PARAM);

  const filter = useMemo(
    () =>
      search
        ? cel<PrivateInstanceType>((f) => f.field('metadata.name').contains(search.trim()))
        : undefined,
    [search],
  );

  const { data, isLoading, error } = useListResource(InstanceTypes, { filter });
  const instanceTypes = data?.items || [];

  return (
    <ListPage
      title={t('Instance types')}
      description={t('Manage provider-defined instance types for this cloud platform.')}
      error={error}
      actions={
        <CreateButton to="/admin/infrastructure/instance-types/create">
          {t('Create instance type')}
        </CreateButton>
      }
    >
      <ListPageBody isLoading={isLoading} error={error}>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem>
                <SearchInput
                  placeholder={t('Search instance types')}
                  value={search}
                  onChange={(_e, v) => setSearch(v)}
                  onClear={() => setSearch('')}
                  aria-label={t('Search instance types')}
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
        {instanceTypes.length === 0 ? (
          <SubtleContent component="p">
            {search
              ? t('No instance types match your search.')
              : t('No instance types yet. Create one to get started.')}
          </SubtleContent>
        ) : (
          <AdminInstanceTypeTable instanceTypes={instanceTypes} />
        )}
      </ListPageBody>
    </ListPage>
  );
};

export default AdminInstanceTypeListPage;
