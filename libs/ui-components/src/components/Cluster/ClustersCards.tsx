import { Gallery, GalleryItem } from '@patternfly/react-core';

import type { Cluster } from '@osac/types';

import ClusterCard from './ClusterCard';
import { useClusterVersionLookup } from './ClustersTable';

interface ClustersCardsProps {
  clusters: Cluster[];
}

const ClustersCards = ({ clusters }: ClustersCardsProps) => {
  const { clusterVersionByName } = useClusterVersionLookup(clusters);

  return (
    <Gallery hasGutter minWidths={{ default: '20.875rem' }} maxWidths={{ default: '20.875rem' }}>
      {clusters.map((cluster) => (
        <GalleryItem key={cluster.id}>
          <ClusterCard
            cluster={cluster}
            clusterVersion={
              cluster.spec?.version?.name
                ? clusterVersionByName.get(cluster.spec.version.name)
                : undefined
            }
          />
        </GalleryItem>
      ))}
    </Gallery>
  );
};

export default ClustersCards;
