import { Content } from '@patternfly/react-core';

import { AddOnOperatorInstallState } from '@osac/types';
import type { Cluster } from '@osac/types';

interface ClusterRhoaiLabelProps {
  cluster: Cluster;
}

export const isRhoaiInstalled = (cluster: Cluster): boolean =>
  cluster.status?.addOnOperators.some(
    (operator) =>
      operator.name === 'rhoai' && operator.state === AddOnOperatorInstallState.INSTALLED,
  ) ?? false;

const ClusterRhoaiLabel = ({ cluster }: ClusterRhoaiLabelProps) => {
  if (!isRhoaiInstalled(cluster)) {
    return null;
  }

  return (
    <Content component="small" className="clusters-table__name-meta">
      AI Grid
    </Content>
  );
};

export default ClusterRhoaiLabel;
