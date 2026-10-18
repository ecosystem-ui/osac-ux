import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
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
  Skeleton,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { AddOnOperatorInstallState, ExternalIPAttachmentEndpoint } from '@osac/types';
import type { Cluster, ExternalIPAttachment } from '@osac/types';

import AttachExternalIpModal from './AttachExternalIpModal';
import { ClusterAiGridTab } from './ClusterAiGridTab';
import ClusterDetailsActionButtons from './ClusterDetailsActionButtons';
import ClusterExternalIpCard from './ClusterExternalIpCard';
import DetachExternalIpModal from './DetachExternalIpModal';
import { useClusterVersion } from '../../../api/v1/cluster-versions';
import { useSubnets } from '../../../api/v1/networking';
import { useTranslation } from '../../../hooks/useTranslation';
import { displayValue } from '../../../utils/detailFormatters';
import ExternalLink from '../../Primitives/ExternalLink';
import { Timestamp } from '../../Primitives/Timestamp';
import { ResourceConditionsTable } from '../../Resource/ResourceConditionsTable';
import { ResourceDetailHeader } from '../../Resource/ResourceDetailHeader';
import { ClusterStatusLabel } from '../ClusterStatusLabel';
import ClusterVersionLifecycleLabel from '../ClusterVersionLifecycleLabel';

import './ClusterDetailsPageContent.css';
import '../../shared/details-page.css';

// ---------------------------------------------------------------------------
// Rail: Cluster version card
// ---------------------------------------------------------------------------

interface ClusterVersionSectionProps {
  cluster: Cluster;
}

const ClusterVersionSection = ({ cluster }: ClusterVersionSectionProps) => {
  const { t } = useTranslation();
  const { data: clusterVersion, isLoading } = useClusterVersion(cluster.spec?.version?.id);

  return (
    <Card variant="secondary" className="details-page__rail-card">
      <CardHeader>
        <CardTitle>{t('Cluster version')}</CardTitle>
      </CardHeader>
      <CardBody>
        <DescriptionList isCompact aria-label={t('Cluster version')}>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Version')}</DescriptionListTerm>
            <DescriptionListDescription>
              {isLoading ? (
                <Skeleton width="120px" />
              ) : clusterVersion ? (
                <Flex
                  spaceItems={{ default: 'spaceItemsSm' }}
                  alignItems={{ default: 'alignItemsCenter' }}
                >
                  <FlexItem>{displayValue(clusterVersion.spec?.version)}</FlexItem>
                  <FlexItem>
                    <ClusterVersionLifecycleLabel clusterVersion={clusterVersion} />
                  </FlexItem>
                </Flex>
              ) : (
                displayValue(cluster.spec?.version?.name)
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

// ---------------------------------------------------------------------------
// Rail: Settings card
// ---------------------------------------------------------------------------

interface ClusterSettingsSectionProps {
  cluster: Cluster;
}

const ClusterSettingsSection = ({ cluster }: ClusterSettingsSectionProps) => {
  const { t } = useTranslation();
  const podCidr = cluster.spec?.network?.podCidr;
  const serviceCidr = cluster.spec?.network?.serviceCidr;
  const sshKey = cluster.spec?.sshPublicKey;

  return (
    <Card variant="secondary" className="details-page__rail-card">
      <CardHeader>
        <CardTitle>{t('Settings')}</CardTitle>
      </CardHeader>
      <CardBody>
        <DescriptionList isCompact aria-label={t('Cluster settings')}>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Pod CIDR')}</DescriptionListTerm>
            <DescriptionListDescription>{displayValue(podCidr)}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Service CIDR')}</DescriptionListTerm>
            <DescriptionListDescription>{displayValue(serviceCidr)}</DescriptionListDescription>
          </DescriptionListGroup>
          {sshKey ? (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('SSH public key')}</DescriptionListTerm>
              <DescriptionListDescription>
                <code className="cluster-details-page__ssh-key">{sshKey}</code>
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Main content
// ---------------------------------------------------------------------------

interface ClusterDetailViewProps {
  cluster: Cluster;
}

const ClusterDetailsPageContent = ({ cluster }: ClusterDetailViewProps) => {
  const { t } = useTranslation();
  const [attachEndpoint, setAttachEndpoint] = useState<ExternalIPAttachmentEndpoint | undefined>();
  const [detachAttachment, setDetachAttachment] = useState<ExternalIPAttachment>();

  const catalogItem = cluster.spec?.catalogItem;
  const nodeSetEntries = Object.entries(cluster.spec?.nodeSets ?? {});
  const subnetName = cluster.spec?.networkAttachment?.subnet?.name;
  const securityGroups = cluster.spec?.networkAttachment?.securityGroups;
  const { data: subnets = [] } = useSubnets();
  const subnet = subnets.find((item) => item.id === cluster.spec?.networkAttachment?.subnet?.id);
  const virtualNetworkId = subnet?.spec?.virtualNetwork?.id;

  const isRhoaiInstalled =
    cluster.status?.addOnOperators.some(
      (op) => op.name === 'rhoai' && op.state === AddOnOperatorInstallState.INSTALLED,
    ) ?? false;

  return (
    <div className="cluster-details-page">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}
      <PageSection hasBodyWrapper={false} className="cluster-details-page__header-section">
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
                  parentTo="/clusters"
                  parentLabel={t('Clusters')}
                  resourceName={cluster.metadata?.name ?? cluster.id}
                  description={t(
                    'Review cluster endpoints, configuration, and node sets for this instance.',
                  )}
                  titleAddon={<ClusterStatusLabel state={cluster.status?.state} />}
                  titleSize="3xl"
                />
              </FlexItem>
              <FlexItem>
                <ClusterDetailsActionButtons cluster={cluster} isRhoaiInstalled={isRhoaiInstalled} />
              </FlexItem>
            </Flex>
          </StackItem>
          <StackItem>
            <Divider />
          </StackItem>
        </Stack>
      </PageSection>

      {/* ------------------------------------------------------------------ */}
      {/* Body                                                                */}
      {/* ------------------------------------------------------------------ */}
      <PageSection hasBodyWrapper={false}>
        <Grid hasGutter className="details-page__content-grid">
          {/* Main column */}
          <GridItem md={8} className="details-page__column">
            <Stack hasGutter>
              {/* Overview + Lifecycle — 2-column row */}
              <StackItem>
                <Grid hasGutter className="cluster-details-page__overview-grid">
                  <GridItem span={6}>
                    <Stack hasGutter>
                      <StackItem>
                        <Title headingLevel="h2" size="lg">
                          {t('Overview')}
                        </Title>
                      </StackItem>
                      <StackItem>
                        <DescriptionList
                          isCompact
                          className="details-page__overview"
                          aria-label={t('Cluster overview')}
                        >
                          <DescriptionListGroup>
                            <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
                            <DescriptionListDescription>
                              <ClusterStatusLabel state={cluster.status?.state} />
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>{t('Catalog item')}</DescriptionListTerm>
                            <DescriptionListDescription>
                              {displayValue(catalogItem?.name || catalogItem?.id)}
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>{t('API URL')}</DescriptionListTerm>
                            <DescriptionListDescription>
                              <ExternalLink href={cluster.status?.apiUrl} showUnsafeAsText />
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>{t('Console URL')}</DescriptionListTerm>
                            <DescriptionListDescription>
                              <ExternalLink href={cluster.status?.consoleUrl} showUnsafeAsText />
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                        </DescriptionList>
                      </StackItem>
                    </Stack>
                  </GridItem>

                  <GridItem span={6}>
                    <Stack hasGutter>
                      <StackItem>
                        <Title headingLevel="h2" size="lg">
                          {t('Lifecycle')}
                        </Title>
                      </StackItem>
                      <StackItem>
                        <DescriptionList
                          isCompact
                          className="details-page__overview"
                          aria-label={t('Cluster lifecycle')}
                        >
                          <DescriptionListGroup>
                            <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
                            <DescriptionListDescription>
                              <Timestamp value={cluster.metadata?.creationTimestamp} />
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>{t('Creator')}</DescriptionListTerm>
                            <DescriptionListDescription>
                              {displayValue(cluster.metadata?.creator)}
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>{t('Hub')}</DescriptionListTerm>
                            <DescriptionListDescription>
                              {displayValue(cluster.status?.hub)}
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                        </DescriptionList>
                      </StackItem>
                    </Stack>
                  </GridItem>
                </Grid>
              </StackItem>

              <StackItem>
                <Divider />
              </StackItem>

              {/* Networking */}
              <StackItem>
                <Stack hasGutter>
                  <StackItem>
                    <Title headingLevel="h2" size="lg">
                      {t('Networking')}
                    </Title>
                  </StackItem>
                  <StackItem>
                    {cluster.spec?.networkAttachment ? (
                      <Table aria-label={t('Cluster networking')} variant="compact">
                        <Thead>
                          <Tr>
                            <Th>{t('Subnet')}</Th>
                            <Th>{t('Security groups')}</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          <Tr>
                            <Td dataLabel={t('Subnet')}>
                              {subnet?.id && virtualNetworkId ? (
                                <Link
                                  className="cluster-details-page__network-link"
                                  to={`/networking/virtual-networks/${encodeURIComponent(virtualNetworkId)}`}
                                >
                                  {displayValue(subnetName)}
                                </Link>
                              ) : (
                                displayValue(subnetName)
                              )}
                            </Td>
                            <Td dataLabel={t('Security groups')}>
                              {securityGroups && securityGroups.length > 0
                                ? securityGroups.map((securityGroup, index) => (
                                    <span key={securityGroup.id}>
                                      {index > 0 ? ', ' : null}
                                      <Link
                                        className="cluster-details-page__network-link"
                                        to={`/networking/security-groups/${encodeURIComponent(securityGroup.id)}`}
                                      >
                                        {displayValue(securityGroup.name || securityGroup.id)}
                                      </Link>
                                    </span>
                                  ))
                                : '—'}
                            </Td>
                          </Tr>
                        </Tbody>
                      </Table>
                    ) : (
                      <Content component="p">{t('No network attachments.')}</Content>
                    )}
                  </StackItem>
                </Stack>
              </StackItem>

              {/* Node sets */}
              <StackItem>
                <Stack hasGutter>
                  <StackItem>
                    <Title headingLevel="h2" size="lg">
                      {t('Node sets')}
                    </Title>
                  </StackItem>
                  <StackItem>
                    {nodeSetEntries.length > 0 ? (
                      <Table aria-label={t('Cluster node sets')} variant="compact">
                        <Thead>
                          <Tr>
                            <Th>{t('Name')}</Th>
                            <Th>{t('Host type')}</Th>
                            <Th>{t('Size')}</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {nodeSetEntries.map(([key, nodeSet]) => (
                            <Tr key={key}>
                              <Td dataLabel={t('Name')}>{key}</Td>
                              <Td dataLabel={t('Host type')}>
                                {displayValue(nodeSet.hostType?.name)}
                              </Td>
                              <Td dataLabel={t('Size')}>{nodeSet.size}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    ) : (
                      <Content component="p">{t('No node sets configured.')}</Content>
                    )}
                  </StackItem>
                </Stack>
              </StackItem>

              {/* Conditions */}
              <StackItem>
                <Stack hasGutter>
                  <StackItem>
                    <Title headingLevel="h2" size="lg">
                      {t('Conditions')}
                    </Title>
                  </StackItem>
                  <StackItem>
                    <ResourceConditionsTable
                      ariaLabel={t('Cluster conditions')}
                      conditions={cluster.status?.conditions ?? []}
                      conditionResourceKind="cluster"
                    />
                  </StackItem>
                </Stack>
              </StackItem>

              {/* AI Grid — only shown when RHOAI add-on is installed */}
              {isRhoaiInstalled && (
                <>
                  <StackItem>
                    <Divider />
                  </StackItem>
                  <StackItem>
                    <ClusterAiGridTab cluster={cluster} />
                  </StackItem>
                </>
              )}
            </Stack>
          </GridItem>

          {/* Rail column */}
          <GridItem md={4} className="details-page__column">
            <Stack hasGutter>
              <StackItem>
                <ClusterVersionSection cluster={cluster} />
              </StackItem>
              <StackItem>
                <ClusterExternalIpCard
                  cluster={cluster}
                  onAttach={setAttachEndpoint}
                  onDetach={setDetachAttachment}
                />
              </StackItem>
              <StackItem>
                <ClusterSettingsSection cluster={cluster} />
              </StackItem>
            </Stack>
          </GridItem>
        </Grid>
      </PageSection>

      {/* Modals */}
      {attachEndpoint !== undefined && (
        <AttachExternalIpModal
          cluster={cluster}
          endpoint={attachEndpoint}
          onClose={() => setAttachEndpoint(undefined)}
        />
      )}
      {detachAttachment && (
        <DetachExternalIpModal
          attachment={detachAttachment}
          onClose={() => setDetachAttachment(undefined)}
        />
      )}
    </div>
  );
};

export default ClusterDetailsPageContent;
