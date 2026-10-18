import { useMemo } from 'react';
import {
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import type { BareMetalInstanceType as PrivateBareMetalInstanceType } from '@osac/types/private';
import { cel } from '@osac/ui-components/api/cel';
import CreateButton from '@osac/ui-components/components/Primitives/CreateButton.tsx';
import { SEARCH_PARAM, usePageFilter } from '@osac/ui-components/hooks/use-page-filter.ts';

import AdminBareMetalInstanceTypeTable from './AdminBareMetalInstanceTypeTable';
import { useAdminBareMetalInstanceTypes } from '../../api/v1/private/baremetal-instance-type';
import { useTranslation } from '../../hooks/useTranslation';
import ListPage from '../Page/ListPage';
import ListPageBody from '../Page/ListPageBody';
import { SubtleContent } from '../SubtleContent/SubtleContent';

export const BAREMETAL_INSTANCE_TYPES_LIST_ROUTE = '/admin/infrastructure/baremetal-instance-types';

const AdminBareMetalInstanceTypeListPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = usePageFilter(SEARCH_PARAM);

  const filter = useMemo(
    () =>
      search
        ? cel<PrivateBareMetalInstanceType>((f) =>
            f.field('metadata.name').contains(search.trim()),
          )
        : undefined,
    [search],
  );

  const { data: bareMetalInstanceTypes = [], isLoading, error } =
    useAdminBareMetalInstanceTypes({ filter });

  return (
    <ListPage
      title={t('Bare metal instance types')}
      description={t('Manage provider-defined bare metal instance types for this cloud platform.')}
      error={error}
      actions={
        <CreateButton to={`${BAREMETAL_INSTANCE_TYPES_LIST_ROUTE}/create`}>
          {t('Create bare metal instance type')}
        </CreateButton>
      }
    >
      <ListPageBody isLoading={isLoading} error={error}>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem>
                <SearchInput
                  placeholder={t('Search bare metal instance types')}
                  value={search}
                  onChange={(_e, v) => setSearch(v)}
                  onClear={() => setSearch('')}
                  aria-label={t('Search bare metal instance types')}
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
        {bareMetalInstanceTypes.length === 0 ? (
          <SubtleContent component="p">
            {search
              ? t('No bare metal instance types match your search.')
              : t('No bare metal instance types yet. Create one to get started.')}
          </SubtleContent>
        ) : (
          <AdminBareMetalInstanceTypeTable bareMetalInstanceTypes={bareMetalInstanceTypes} />
        )}
      </ListPageBody>
    </ListPage>
  );
};

export default AdminBareMetalInstanceTypeListPage;
