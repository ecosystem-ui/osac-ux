import { TFunction } from 'i18next';

import { Project } from '@osac/types';
import { cel } from '@osac/ui-components/api/cel';

export const getProjectName = (project: Project, t: TFunction): string => {
  if (project.metadata?.name === '') {
    return t('Default');
  }
  return project.spec?.title || project.metadata?.name || project.id;
};

export const getFullProjectPath = (project: Project | undefined) => {
  return project?.metadata?.name || '';
};

export const getProjectParentPath = (project: Project | undefined) => {
  const path = getFullProjectPath(project);
  const lastDot = path.lastIndexOf('.');

  return lastDot >= 0 ? path.slice(0, lastDot) : undefined;
};

export const isNestedProject = (project: Project | undefined) =>
  Boolean(getProjectParentPath(project));

export interface ProjectTreeItem {
  project: Project;
  depth: number;
}

/**
 * Converts a flat list of projects into an ordered, depth-annotated tree list
 * suitable for hierarchical UI rendering (e.g. HierarchicalSelect, tree tables).
 *
 * Children are sorted alphabetically by the label returned by `getLabel`.
 * Projects whose parent is not present in the list are appended at depth 0.
 */
export const buildProjectTree = (
  projects: Project[],
  getLabel: (project: Project) => string,
): ProjectTreeItem[] => {
  const projectsByPath = new Map(projects.map((p) => [getFullProjectPath(p), p]));
  const childMap = new Map<string, Project[]>();

  for (const project of projects) {
    const parentPath = getProjectParentPath(project);
    if (parentPath && projectsByPath.has(parentPath)) {
      const siblings = childMap.get(parentPath) ?? [];
      siblings.push(project);
      childMap.set(parentPath, siblings);
    }
  }

  const result: ProjectTreeItem[] = [];

  const appendChildren = (parentPath: string | null, depth: number) => {
    const siblings = projects
      .filter((p) => (getProjectParentPath(p) ?? null) === parentPath)
      .sort((a, b) => getLabel(a).localeCompare(getLabel(b)));

    for (const project of siblings) {
      const path = getFullProjectPath(project);
      result.push({ project, depth });
      const children = childMap.get(path) ?? [];
      if (children.length > 0) {
        appendChildren(path, depth + 1);
      }
    }
  };

  appendChildren(null, 0);

  // Append orphans — projects whose parent is not in the list
  for (const project of projects) {
    if (!result.some((r) => r.project.id === project.id)) {
      result.push({ project, depth: 0 });
    }
  }

  return result;
};

export const fullProjectPathToQueryFilter = (fullProjectPath: string) => {
  if (!fullProjectPath.includes('.')) {
    return cel<Project>((filter) =>
      filter.and(
        filter.field('metadata.tenant').notEquals('shared'),
        filter.field('metadata.name').equals(fullProjectPath),
      ),
    );
  }

  const lastIndex = fullProjectPath.lastIndexOf('.');

  const parent = fullProjectPath.slice(0, lastIndex);
  const name = fullProjectPath.slice(lastIndex + 1);

  return cel<Project>((filter) =>
    filter.and(
      filter.field('metadata.tenant').notEquals('shared'),
      filter.field('metadata.name').equals(name),
      filter.field('metadata.project').equals(parent),
    ),
  );
};
