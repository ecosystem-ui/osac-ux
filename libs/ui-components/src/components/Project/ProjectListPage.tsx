import { useMemo } from 'react';
import {
  FormSelect,
  FormSelectOption,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { useProjects } from '@osac/ui-components/api/v1/project';
import ListPage from '@osac/ui-components/components/Page/ListPage';
import ListPageBody from '@osac/ui-components/components/Page/ListPageBody';
import CreateButton from '@osac/ui-components/components/Primitives/CreateButton.tsx';
import { SubtleContent } from '@osac/ui-components/components/SubtleContent/SubtleContent';
import { SEARCH_PARAM, usePageFilter } from '@osac/ui-components/hooks/use-page-filter.ts';
import { useSession } from '@osac/ui-components/hooks/use-session';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import ProjectTreeTable from './ProjectTreeTable';
import { getFullProjectPath, getProjectName, getProjectParentPath, isNestedProject } from './utils';

type ProjectFilter = 'all' | 'root' | 'nested';

const PROJECT_FILTER_OPTIONS: ReadonlyArray<{ value: ProjectFilter; label: string }> = [
  { value: 'all', label: 'All projects' },
  { value: 'root', label: 'Root projects' },
  { value: 'nested', label: 'Nested projects' },
];

const ProjectListPage = () => {
  const { t } = useTranslation();
  const { role, tenantId } = useSession();
  const [search, setSearch] = usePageFilter(SEARCH_PARAM);
  const [projectFilter, setProjectFilter] = usePageFilter('project-filter');

  const { data: projects = [], isLoading, error } = useProjects();

  const canCreate = role === 'tenant-admin';

  const selectedFilter: ProjectFilter = PROJECT_FILTER_OPTIONS.some(
    (option) => option.value === projectFilter,
  )
    ? (projectFilter as ProjectFilter)
    : 'all';
  const filteredProjects = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase();
    const matchingProjects = projects.filter((project) => {
      const isNested = isNestedProject(project);
      const matchesFilter =
        selectedFilter === 'all' || (selectedFilter === 'nested' ? isNested : !isNested);
      const searchableText = `${getProjectName(project, t)} ${getFullProjectPath(project)}`;
      const matchesSearch = !lowerSearch || searchableText.toLowerCase().includes(lowerSearch);
      return matchesFilter && matchesSearch;
    });

    const visiblePaths = new Set(matchingProjects.map(getFullProjectPath));
    if (selectedFilter !== 'root') {
      for (const project of matchingProjects) {
        let parentPath = getProjectParentPath(project);
        while (parentPath) {
          visiblePaths.add(parentPath);
          const parent = projects.find((candidate) => getFullProjectPath(candidate) === parentPath);
          parentPath = getProjectParentPath(parent);
        }
      }
    }

    return projects.filter((project) => visiblePaths.has(getFullProjectPath(project)));
  }, [projects, search, selectedFilter, t]);

  return (
    <ListPage
      title={t('Projects')}
      description={t(
        'Carve your tenant workspace into isolated projects and grant team members scoped access.',
      )}
      error={error}
      actions={
        canCreate && !!tenantId ? (
          <CreateButton to="/projects/create">{t('Create project')}</CreateButton>
        ) : undefined
      }
    >
      <ListPageBody isLoading={isLoading} error={error}>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem>
                <FormSelect
                  id="projects-filter"
                  value={selectedFilter}
                  onChange={(_event, value) => setProjectFilter(value === 'all' ? '' : value)}
                  aria-label={t('Filter projects')}
                >
                  {PROJECT_FILTER_OPTIONS.map((option) => (
                    <FormSelectOption
                      key={option.value}
                      value={option.value}
                      label={
                        option.value === 'all'
                          ? t('All projects')
                          : option.value === 'root'
                            ? t('Root projects')
                            : t('Nested projects')
                      }
                    />
                  ))}
                </FormSelect>
              </ToolbarItem>
              <ToolbarItem>
                <SearchInput
                  aria-label={t('Search projects')}
                  placeholder={t('Search projects by name…')}
                  value={search}
                  onChange={(_event, value) => setSearch(value)}
                  onClear={() => setSearch('')}
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
        {filteredProjects.length > 0 && <ProjectTreeTable projects={filteredProjects} />}
        {filteredProjects.length === 0 && (
          <SubtleContent component="p">
            {search
              ? t('No projects match your search.')
              : t('No projects yet. Create one to get started.')}
          </SubtleContent>
        )}
      </ListPageBody>
    </ListPage>
  );
};

export default ProjectListPage;
