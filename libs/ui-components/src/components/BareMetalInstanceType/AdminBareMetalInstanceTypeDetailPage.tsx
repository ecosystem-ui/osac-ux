import { useNavigate, useParams } from 'react-router-dom';
import {
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

import { BareMetalInstanceTypes } from '@osac/types/private';
import type { BareMetalInstanceType } from '@osac/types/private';
import { useGetResource } from '@osac/ui-components/api/use-resource';
import { displayValue } from '@osac/ui-components/utils/detailFormatters';

import AdminBareMetalInstanceTypeActionsMenu from './AdminBareMetalInstanceTypeActionsMenu';
import { BAREMETAL_INSTANCE_TYPES_LIST_ROUTE } from './AdminBareMetalInstanceTypeListPage';
import AdminBareMetalInstanceTypeSidebarSection from './AdminBareMetalInstanceTypeSidebarSection';
import { useTranslation } from '../../hooks/useTranslation';
import { Timestamp } from '../Primitives/Timestamp';
import { ResourceDetailHeader } from '../Resource/ResourceDetailHeader';
import ResourceDetailsPage from '../Resource/ResourceDetailsPage';

import './AdminBareMetalInstanceTypeDetailsPage.css';
import '../shared/details-page.css';

const formatItems = (items: string[]): string => (items.length > 0 ? items.join(', ') : '—');

interface DetailsContentProps {
  instanceType: BareMetalInstanceType;
}

const DetailsContent = ({ instanceType }: DetailsContentProps) => {
  const { t } = useTranslation();
  const { metadata, spec } = instanceType;
  const hardware = spec?.hardware;

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2" size="lg">
          {t('Overview')}
        </Title>
      </StackItem>
      <StackItem>
        <DescriptionList
          isCompact
          className="admin-bm-instance-type-details-overview"
          aria-label={t('Bare metal instance type overview')}
        >
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
            <DescriptionListDescription>
              {displayValue(metadata?.name)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Description')}</DescriptionListTerm>
            <DescriptionListDescription>
              {displayValue(spec?.description)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
            <DescriptionListDescription>
              <Timestamp value={metadata?.creationTimestamp} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Creator')}</DescriptionListTerm>
            <DescriptionListDescription>
              {displayValue(metadata?.creator)}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>

      <StackItem>
        <Divider />
      </StackItem>

      <StackItem>
        <Title headingLevel="h2" size="lg">
          {t('Compute')}
        </Title>
      </StackItem>
      <StackItem>
        <DescriptionList
          isCompact
          className="admin-bm-instance-type-details-overview"
          aria-label={t('Bare metal instance type compute')}
        >
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Cores')}</DescriptionListTerm>
            <DescriptionListDescription>
              {hardware?.cpu?.cores ?? '—'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Architecture')}</DescriptionListTerm>
            <DescriptionListDescription>
              {displayValue(hardware?.cpu?.architecture)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Model')}</DescriptionListTerm>
            <DescriptionListDescription>
              {displayValue(hardware?.cpu?.model)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Threads per core')}</DescriptionListTerm>
            <DescriptionListDescription>
              {hardware?.cpu?.threadsPerCore ?? '—'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Memory')}</DescriptionListTerm>
            <DescriptionListDescription>
              {hardware?.memory
                ? `${hardware.memory.totalGb} GB · ${displayValue(hardware.memory.type)}`
                : '—'}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>

      <StackItem>
        <Divider />
      </StackItem>

      <StackItem>
        <Title headingLevel="h2" size="lg">
          {t('Hardware')}
        </Title>
      </StackItem>
      <StackItem>
        <DescriptionList
          isCompact
          className="admin-bm-instance-type-details-overview"
          aria-label={t('Bare metal instance type hardware')}
        >
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Accelerators')}</DescriptionListTerm>
            <DescriptionListDescription>
              {formatItems(
                (hardware?.accelerators ?? []).map((a) =>
                  [a.type, a.model, a.vendor, a.memoryGb === undefined ? undefined : `${a.memoryGb} GB`]
                    .filter(Boolean)
                    .join(' · '),
                ),
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Disks')}</DescriptionListTerm>
            <DescriptionListDescription>
              {formatItems(
                (hardware?.disks ?? []).map(
                  (d) => `${d.type} · ${d.capacityGb} GB · ${d.interface}`,
                ),
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Network ports')}</DescriptionListTerm>
            <DescriptionListDescription>
              {formatItems(
                (hardware?.networkPorts ?? []).map((p) =>
                  [p.name, p.role, p.type, p.speed].filter(Boolean).join(' · '),
                ),
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>
    </Stack>
  );
};

const AdminBareMetalInstanceTypeDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useGetResource(BareMetalInstanceTypes, { id });
  const instanceType = data?.object;

  return (
    <ResourceDetailsPage
      error={error}
      found={!!instanceType}
      isLoading={isLoading}
      parentLabel={t('Bare metal instance types')}
      parentTo={BAREMETAL_INSTANCE_TYPES_LIST_ROUTE}
      refetch={refetch}
      resourceLabel={t('bare metal instance type')}
      cardCount={2}
    >
      {instanceType ? (
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
                      parentTo={BAREMETAL_INSTANCE_TYPES_LIST_ROUTE}
                      parentLabel={t('Bare metal instance types')}
                      resourceName={instanceType.metadata?.name ?? instanceType.id}
                      titleSize="3xl"
                      description={instanceType.spec?.description}
                    />
                  </FlexItem>
                  <FlexItem>
                    <AdminBareMetalInstanceTypeActionsMenu
                      instanceType={instanceType}
                      showLabel
                      onDeleteSuccess={() => navigate(BAREMETAL_INSTANCE_TYPES_LIST_ROUTE)}
                    />
                  </FlexItem>
                </Flex>
              </StackItem>
              <StackItem>
                <Divider />
              </StackItem>
            </Stack>
          </PageSection>

          <PageSection hasBodyWrapper={false}>
            <Grid hasGutter className="details-page__content-grid">
              <GridItem md={8} className="details-page__column">
                <DetailsContent instanceType={instanceType} />
              </GridItem>

              <GridItem md={4} className="details-page__column">
                <Stack hasGutter>
                  <StackItem>
                    <AdminBareMetalInstanceTypeSidebarSection instanceType={instanceType} />
                  </StackItem>
                </Stack>
              </GridItem>
            </Grid>
          </PageSection>
        </>
      ) : null}
    </ResourceDetailsPage>
  );
};

export default AdminBareMetalInstanceTypeDetailPage;
