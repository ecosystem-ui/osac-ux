import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  Gallery,
  GalleryItem,
  Grid,
  GridItem,
  Progress,
  ProgressMeasureLocation,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import {
  BareMetalInstanceCatalogItems,
  BareMetalInstances,
  ClusterCatalogItems,
  Clusters,
  ComputeInstanceCatalogItems,
  ComputeInstances,
  ExternalIPPools,
  Projects,
} from '@osac/types';
import { useListResource } from '@osac/ui-components/api/use-resource';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

interface UsageProgressRowProps {
  label: string;
  used: number;
  total: number;
}

const UsageProgressRow = ({ label, used, total }: UsageProgressRowProps) => {
  const { t } = useTranslation();
  const percent = total > 0 ? Math.round((used / total) * 100) : 0;

  return (
    <StackItem>
      <Grid hasGutter>
        <GridItem span={5}>{label}</GridItem>
        <GridItem span={5}>
          <Progress
            value={percent}
            measureLocation={ProgressMeasureLocation.none}
            size="sm"
            aria-label={t('{{label}} {{used}} of {{total}}', { label, used, total })}
          />
        </GridItem>
        <GridItem span={2}>{t('{{used}} of {{total}}', { used, total })}</GridItem>
      </Grid>
    </StackItem>
  );
};

const TenantResourceUsageSection = () => {
  const { t } = useTranslation();
  const computeCatalogItemsResponse = useListResource(ComputeInstanceCatalogItems);
  const clusterCatalogItemsResponse = useListResource(ClusterCatalogItems);
  const bareMetalCatalogItemsResponse = useListResource(BareMetalInstanceCatalogItems);
  const computeInstancesResponse = useListResource(ComputeInstances);
  const clustersResponse = useListResource(Clusters);
  const bareMetalInstancesResponse = useListResource(BareMetalInstances);
  const projectsResponse = useListResource(Projects);
  const externalIpPoolsResponse = useListResource(ExternalIPPools);
  const catalogItems = [
    ...(computeCatalogItemsResponse.data?.items ?? []),
    ...(clusterCatalogItemsResponse.data?.items ?? []),
    ...(bareMetalCatalogItemsResponse.data?.items ?? []),
  ];
  const computeInstances = computeInstancesResponse.data?.items ?? [];
  const clusters = clustersResponse.data?.items ?? [];
  const bareMetalInstances = bareMetalInstancesResponse.data?.items ?? [];
  const projects = projectsResponse.data?.items ?? [];
  const externalIpPools = externalIpPoolsResponse.data?.items ?? [];
  const totalInstances = computeInstances.length + clusters.length + bareMetalInstances.length;

  const cards = [
    { title: t('Catalog items'), value: catalogItems.length, hint: t('Available catalog items') },
    { title: t('Instances'), value: totalInstances, hint: t('Compute, cluster, and bare metal instances') },
    { title: t('Projects'), value: projects.length, hint: t('Projects associated with this tenant') },
    { title: t('IP pools'), value: externalIpPools.length, hint: t('External IP pools') },
  ];

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2" size="lg">
          {t('Resource usage')}
        </Title>
        <Content component="p">
          {t('Catalog items, instances, projects, and IP pools available to this tenant.')}
        </Content>
      </StackItem>
      <StackItem>
        <Gallery hasGutter minWidths={{ default: '15rem' }} maxWidths={{ default: '1fr' }}>
          {cards.map((card) => (
            <GalleryItem key={card.title}>
              <Card isCompact isFullHeight>
                <CardHeader>
                  <CardTitle>{card.title}</CardTitle>
                </CardHeader>
                <CardBody>
                  <Stack hasGutter>
                    <StackItem>
                      <Title headingLevel="h3" size="2xl">
                        {card.value}
                      </Title>
                    </StackItem>
                    <StackItem>
                      <Content component="p">{card.hint}</Content>
                    </StackItem>
                  </Stack>
                </CardBody>
              </Card>
            </GalleryItem>
          ))}
        </Gallery>
      </StackItem>
      <StackItem>
        <Grid hasGutter>
          <GridItem md={6}>
            <Card isCompact isFullHeight>
              <CardHeader>
                <CardTitle>{t('Instances by service')}</CardTitle>
              </CardHeader>
              <CardBody>
                <Stack hasGutter>
                  <UsageProgressRow
                    label={t('Virtual machines')}
                    used={computeInstances.length}
                    total={totalInstances}
                  />
                  <UsageProgressRow
                    label={t('Clusters')}
                    used={clusters.length}
                    total={totalInstances}
                  />
                  <UsageProgressRow
                    label={t('Bare metal')}
                    used={bareMetalInstances.length}
                    total={totalInstances}
                  />
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem md={6}>
            <Card isCompact isFullHeight>
              <CardHeader>
                <CardTitle>{t('Instances by project')}</CardTitle>
              </CardHeader>
              <CardBody>
                {projects.length === 0 ? (
                  <Content component="p">{t('No projects yet.')}</Content>
                ) : (
                  <Stack hasGutter>
                    {projects.slice(0, 5).map((project) => (
                      <UsageProgressRow
                        key={project.id}
                        label={project.metadata?.name ?? project.id}
                        used={0}
                        total={1}
                      />
                    ))}
                  </Stack>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </StackItem>
    </Stack>
  );
};

export default TenantResourceUsageSection;
