import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TreeView, TreeViewSearch, type TreeViewDataItem } from '@patternfly/react-core';
import type { TFunction } from 'i18next';

import type { Project } from '@osac/types';
import { useProjects } from '@osac/ui-components/api/v1/project';
import ListPage from '@osac/ui-components/components/Page/ListPage';
import ListPageBody from '@osac/ui-components/components/Page/ListPageBody';
import CreateButton from '@osac/ui-components/components/Primitives/CreateButton.tsx';
import { SubtleContent } from '@osac/ui-components/components/SubtleContent/SubtleContent';
import { SEARCH_PARAM, usePageFilter } from '@osac/ui-components/hooks/use-page-filter.ts';
import { useSession } from '@osac/ui-components/hooks/use-session';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import ProjectActionsMenu from './ProjectActionsMenu';
import ProjectStatusLabel from './ProjectStatusLabel';
import { getFullProjectPath, getProjectName } from './utils';

function buildProjectTree(projects: Project[], t: TFunction): TreeViewDataItem[] {
  // Pass 1: create all nodes keyed by their full dot-separated path
  const nodeMap = new Map<string, TreeViewDataItem>();

  for (const project of projects) {
    const fullPath = getFullProjectPath(project);
    const dotIdx = fullPath.lastIndexOf('.');
    const displayName =
      dotIdx >= 0 ? fullPath.slice(dotIdx + 1) : fullPath || getProjectName(project, t);

    nodeMap.set(fullPath, {
      id: project.id,
      name: (
        <>
          <Link to={`/projects/${project.id}`}>{displayName || t('Default')}</Link>{' '}
          <ProjectStatusLabel project={project} />
        </>
      ),
      action: <ProjectActionsMenu project={project} />,
    });
  }

  // Pass 2: link nodes into parent–child relationships
  const roots: TreeViewDataItem[] = [];

  for (const [fullPath, node] of nodeMap) {
    const dotIdx = fullPath.lastIndexOf('.');
    if (dotIdx < 0) {
      roots.push(node);
    } else {
      const parentPath = fullPath.slice(0, dotIdx);
      const parent = nodeMap.get(parentPath);
      if (parent) {
        (parent.children ??= []).push(node);
      } else {
        // Parent project not in the list — treat as root
        roots.push(node);
      }
    }
  }

  // Wrap in a single collapsible root so expand/collapse is always available
  return [{ name: '', children: roots, defaultExpanded: true }];
}

const ProjectListPage = () => {
  const { t } = useTranslation();
  const { role, tenantId } = useSession();
  const [search, setSearch] = usePageFilter(SEARCH_PARAM);

  const { data: projects = [], isLoading, error } = useProjects();

  const canCreate = role === 'tenant-admin';

  const filteredProjects = useMemo(() => {
    if (!search) {
      return projects;
    }
    const lowerSearch = search.toLowerCase();
    return projects.filter((project) => {
      const fullName = getProjectName(project, t);
      return fullName.toLowerCase().includes(lowerSearch);
    });
  }, [search, projects, t]);

  const projectTree = useMemo(
    () => (filteredProjects.length > 0 ? buildProjectTree(filteredProjects, t) : []),
    [filteredProjects, t],
  );

  return (
    <ListPage
      title={t('Projects')}
      description={t('Organize resources with hierarchical projects.')}
      error={error}
      actions={
        canCreate && !!tenantId ? (
          <CreateButton to="/projects/create">{t('Create project')}</CreateButton>
        ) : undefined
      }
    >
      <ListPageBody isLoading={isLoading} error={error}>
        <TreeView
          aria-label={t('Projects')}
          data={projectTree}
          defaultAllExpanded
          toolbar={
            <TreeViewSearch
              aria-label={t('Search projects')}
              placeholder={t('Search projects by name…')}
              value={search}
              onSearch={(e) => setSearch(e.target.value)}
            />
          }
        />
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
