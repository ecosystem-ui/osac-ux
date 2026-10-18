import { Link, useParams } from 'react-router-dom';
import {
  Button,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import ContainerNodeIcon from '@patternfly/react-icons/dist/esm/icons/container-node-icon';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

import { Project } from '@osac/types';
import { useProject, useProjects } from '@osac/ui-components/api/v1/project';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import ProjectDetailsActionButtons from './ProjectDetailsActionButtons';
import { Timestamp } from '../../Primitives/Timestamp';
import ProjectMembership from '../../ProjectMembership/ProjectMembershipTable';
import { ResourceDetailHeader } from '../../Resource/ResourceDetailHeader';
import ResourceDetailsPage from '../../Resource/ResourceDetailsPage';
import ProjectStatusLabel from '../ProjectStatusLabel';
import ProjectTreeTable from '../ProjectTreeTable';
import { getFullProjectPath, getProjectName, getProjectParentPath } from '../utils';

import './ProjectDetailsPage.css';
import '../../shared/details-page.css';

const displayValue = (value?: string) => value?.trim() || '—';

interface ProjectDetailsPageContentProps {
  project: Project;
}

const ProjectDetailsPageContent = ({ project }: ProjectDetailsPageContentProps) => {
  const { t } = useTranslation();
  const { data: projects = [] } = useProjects();
  const projectPath = getFullProjectPath(project);
  const parentProject = projects.find(
    (candidate) => getFullProjectPath(candidate) === getProjectParentPath(project),
  );
  const nestedProjects = projects.filter(
    (candidate) => getProjectParentPath(candidate) === projectPath,
  );
  const services = (project.metadata?.annotations?.['osac.io/services'] ?? '')
    .split(',')
    .map((service) => service.trim())
    .filter(Boolean);
  const instanceQuota = project.metadata?.annotations?.['osac.io/instance-quota'] || '—';
  const ipPool = project.metadata?.annotations?.['osac.io/ip-pool'] || '—';

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <StackItem>
            <Flex
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              alignItems={{ default: 'alignItemsFlexStart' }}
              flexWrap={{ default: 'wrap' }}
              spaceItems={{ default: 'spaceItemsMd' }}
            >
              <FlexItem>
                <ResourceDetailHeader
                  parentTo="/projects"
                  parentLabel={t('Projects')}
                  resourceName={getProjectName(project, t)}
                  description={project.spec?.description}
                  titleAddon={<ProjectStatusLabel project={project} />}
                />
              </FlexItem>
              <FlexItem>
                <ProjectDetailsActionButtons project={project} />
              </FlexItem>
            </Flex>
          </StackItem>
          <StackItem>
            <Divider />
          </StackItem>
        </Stack>
      </PageSection>

      <PageSection hasBodyWrapper={false}>
        <Grid hasGutter>
          <GridItem md={8}>
            <Stack hasGutter>
              <StackItem>
                <Grid hasGutter>
                  <GridItem md={6}>
                    <div className="project-details-page__column">
                      <Title headingLevel="h2" size="lg">
                        {t('Overview')}
                      </Title>
                      <DescriptionList
                        isCompact
                        className="details-page__overview"
                        aria-label={t('Project overview')}
                      >
                        <DescriptionListGroup>
                          <DescriptionListTerm>{t('Description')}</DescriptionListTerm>
                          <DescriptionListDescription>
                            {displayValue(project.spec?.description)}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        {parentProject && (
                          <DescriptionListGroup>
                            <DescriptionListTerm>{t('Parent project')}</DescriptionListTerm>
                            <DescriptionListDescription>
                              <Link to={`/projects/${parentProject.id}`}>
                                {getProjectName(parentProject, t)}
                              </Link>
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                        )}
                        <DescriptionListGroup>
                          <DescriptionListTerm>{t('Project ID')}</DescriptionListTerm>
                          <DescriptionListDescription>
                            <code>{project.id}</code>
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
                          <DescriptionListDescription>
                            <Timestamp value={project.metadata?.creationTimestamp} />
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>{t('Instance quota')}</DescriptionListTerm>
                          <DescriptionListDescription>{instanceQuota}</DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>{t('IP pool')}</DescriptionListTerm>
                          <DescriptionListDescription>{ipPool}</DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                    </div>
                  </GridItem>
                  <GridItem md={6}>
                    <div className="project-details-page__column">
                      <Title headingLevel="h2" size="lg">
                        {t('Services')} ({services.length})
                      </Title>
                      {services.length > 0 ? (
                        <div className="project-details-page__services" aria-label={t('Services')}>
                          {services.map((service) => (
                            <div className="project-details-page__service" key={service}>
                              <ContainerNodeIcon
                                className="project-details-page__service-icon"
                                aria-hidden
                              />
                              <span>{service}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Content component="p" className="project-details-page__empty">
                          {t('No services')}
                        </Content>
                      )}
                    </div>
                  </GridItem>
                </Grid>
              </StackItem>
              <StackItem>
                <Divider className="project-details-page__section-divider" />
              </StackItem>
              <StackItem>
                <Stack hasGutter className="project-details-page__nested-projects">
                  <StackItem>
                    <Flex
                      alignItems={{ default: 'alignItemsCenter' }}
                      justifyContent={{ default: 'justifyContentSpaceBetween' }}
                      flexWrap={{ default: 'wrap' }}
                    >
                      <FlexItem>
                        <Title headingLevel="h2" size="lg">
                          {t('Nested projects')} ({nestedProjects.length})
                        </Title>
                      </FlexItem>
                      <FlexItem>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<PlusCircleIcon />}
                          component={(props) => <Link {...props} to="/projects/create" />}
                        >
                          {t('Create')}
                        </Button>
                      </FlexItem>
                    </Flex>
                  </StackItem>
                  <StackItem>
                    {nestedProjects.length > 0 ? (
                      <ProjectTreeTable projects={projects} rootPath={projectPath} />
                    ) : (
                      <Content component="p" className="project-details-page__empty">
                        {t('No nested projects')}
                      </Content>
                    )}
                  </StackItem>
                </Stack>
              </StackItem>
            </Stack>
          </GridItem>
          <GridItem md={4}>
            <div className="details-page__sidebar">
              <ProjectMembership project={project} variant="rail" />
            </div>
          </GridItem>
        </Grid>
      </PageSection>
    </>
  );
};

const ProjectDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams() as { id: string };

  const { data, isLoading, error, refetch } = useProject(id);

  return (
    <ResourceDetailsPage
      error={error}
      found={!!data}
      isLoading={isLoading}
      parentLabel={t('Projects')}
      parentTo="/projects"
      refetch={refetch}
    >
      {data && <ProjectDetailsPageContent project={data} />}
    </ResourceDetailsPage>
  );
};

export default ProjectDetailsPage;
