import { useMemo } from 'react';
import { Flex, FlexItem, Skeleton } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import { type Cluster, ClusterState } from '@osac/types';

import ClusterActionsMenu from './ClusterActionsMenu';
import ClusterRhoaiLabel from './ClusterRhoaiLabel';
import { ClusterStatusLabel } from './ClusterStatusLabel';
import ClusterVersionLifecycleLabel from './ClusterVersionLifecycleLabel';
import { clusterVersionNamesFilter, useClusterVersions } from '../../api/v1/cluster-versions';
import { useTranslation } from '../../hooks/useTranslation';
import ExternalLink from '../Primitives/ExternalLink';
import { Timestamp } from '../Primitives/Timestamp';

import './ClustersTable.css';

interface ClustersTableProps {
  clusters: Cluster[];
}

export const useClusterVersionLookup = (clusters: Cluster[]) => {
  const versionNames = useMemo(
    () => [
      ...new Set(
        clusters
          .map((cluster) => cluster.spec?.version?.name)
          .filter((name): name is string => !!name),
      ),
    ],
    [clusters],
  );
  const { data: clusterVersions = [], isLoading: isClusterVersionsLoading } = useClusterVersions(
    { filter: clusterVersionNamesFilter(versionNames) },
    { enabled: versionNames.length > 0 },
  );

  return {
    clusterVersionByName: new Map(clusterVersions.map((cv) => [cv.metadata?.name, cv])),
    isClusterVersionsLoading,
  };
};

export const ClustersTable = ({ clusters }: ClustersTableProps) => {
  const { t } = useTranslation();
  const { clusterVersionByName, isClusterVersionsLoading } = useClusterVersionLookup(clusters);

  return (
    <Table aria-label={t('Clusters')} variant="compact">
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th>{t('Status')}</Th>
          <Th>{t('Lifecycle')}</Th>
          <Th>{t('Version')}</Th>
          <Th>{t('API URL')}</Th>
          <Th>{t('Created')}</Th>
          <Th aria-label={t('Actions')} />
        </Tr>
      </Thead>
      <Tbody>
        {clusters.map((cluster) => {
          const locked = cluster.status?.state === ClusterState.DELETING;
          const apiUrl = cluster.status?.apiUrl;
          const versionRef = cluster.spec?.version;
          const clusterVersion = versionRef?.name
            ? clusterVersionByName.get(versionRef.name)
            : undefined;

          return (
            <Tr key={cluster.id}>
              <Td dataLabel={t('Name')}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    {locked ? (
                      <span className="clusters-table__name-link">
                        {cluster.metadata?.name || cluster.id}
                      </span>
                    ) : (
                      <Link
                        to={`/clusters/${encodeURIComponent(cluster.id)}`}
                        className="clusters-table__name-link"
                      >
                        {cluster.metadata?.name || cluster.id}
                      </Link>
                    )}
                  </FlexItem>
                  <FlexItem>
                    <ClusterRhoaiLabel cluster={cluster} />
                  </FlexItem>
                </Flex>
              </Td>
              <Td dataLabel={t('Status')}>
                <ClusterStatusLabel state={cluster.status?.state} />
              </Td>
              <Td dataLabel={t('Lifecycle')}>
                {isClusterVersionsLoading ? (
                  <Skeleton width="80px" />
                ) : clusterVersion ? (
                  <ClusterVersionLifecycleLabel clusterVersion={clusterVersion} />
                ) : null}
              </Td>
              <Td dataLabel={t('Version')}>
                {isClusterVersionsLoading ? (
                  <Skeleton width="80px" />
                ) : (
                  clusterVersion?.spec?.version || versionRef?.name || '—'
                )}
              </Td>
              <Td dataLabel={t('API URL')}>
                {locked ? '—' : <ExternalLink href={apiUrl} showUnsafeAsText />}
              </Td>
              <Td dataLabel={t('Created')}>
                <Timestamp value={cluster.metadata?.creationTimestamp} />
              </Td>
              <Td dataLabel={t('Actions')} isActionCell>
                {locked ? null : <ClusterActionsMenu cluster={cluster} />}
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};
