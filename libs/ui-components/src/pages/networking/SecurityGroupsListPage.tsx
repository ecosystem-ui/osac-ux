import { useState } from 'react';
import {
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import CreateButton from '@osac/ui-components/components/Primitives/CreateButton.tsx';
import { SEARCH_PARAM, usePageFilter } from '@osac/ui-components/hooks/use-page-filter.ts';

import { useSecurityGroups, useVirtualNetworks } from '../../api/v1/networking';
import { SecurityGroupCreateModal } from '../../components/networking/SecurityGroupCreateModal';
import { SecurityGroupsTable } from '../../components/networking/SecurityGroupsTable';
import ListPage from '../../components/Page/ListPage';
import ListPageBody from '../../components/Page/ListPageBody';
import ProjectFilter from '../../components/Page/ProjectFilter';
import { SubtleContent } from '../../components/SubtleContent/SubtleContent';
import { useTranslation } from '../../hooks/useTranslation';

export const SecurityGroupsListPage = () => {
  const { t } = useTranslation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = usePageFilter(SEARCH_PARAM);

  const { data: securityGroups = [], isLoading, error } = useSecurityGroups();
  const { data: virtualNetworks = [] } = useVirtualNetworks();

  const filteredSGs = securityGroups.filter((sg) => {
    const name = sg.metadata?.name ?? '';
    return !search || name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <ListPage
        title={t('Security groups')}
        description={t('Manage firewall rules for your virtual networks.')}
        error={error}
        actions={
          <CreateButton onClick={() => setIsCreateModalOpen(true)}>
            {t('Create security group')}
          </CreateButton>
        }
      >
        <ListPageBody isLoading={isLoading} error={error}>
          <Toolbar>
            <ToolbarContent>
              <ToolbarGroup>
                <ToolbarItem>
                  <ProjectFilter />
                </ToolbarItem>
                <ToolbarItem>
                  <SearchInput
                    placeholder={t('Search security groups')}
                    value={search}
                    onChange={(_e, v) => setSearch(v)}
                    onClear={() => setSearch('')}
                    aria-label={t('Search security groups')}
                  />
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>
          {filteredSGs.length === 0 ? (
            <SubtleContent component="p">
              {search
                ? t('No security groups match your search.')
                : t('No security groups yet. Create one to get started.')}
            </SubtleContent>
          ) : (
            <SecurityGroupsTable
              securityGroups={filteredSGs}
              virtualNetworks={virtualNetworks}
            />
          )}
        </ListPageBody>
      </ListPage>

      {isCreateModalOpen && (
        <SecurityGroupCreateModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </>
  );
};
