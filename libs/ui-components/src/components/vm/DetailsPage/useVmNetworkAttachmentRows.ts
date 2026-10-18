import { useMemo } from 'react';

import type { ComputeInstance } from '@osac/types';

import {
  resourceDisplayName,
  useSecurityGroups,
  useSubnets,
  useVirtualNetworks,
} from '../../../api/v1/networking';

export interface VmNetworkResource {
  id: string;
  name: string;
}

export interface VmNetworkAttachmentRow {
  virtualNetwork: VmNetworkResource;
  subnet: VmNetworkResource;
  virtualNetworkId: string;
  securityGroups: VmNetworkResource[];
}

export const useVmNetworkAttachmentRows = (vm: ComputeInstance): VmNetworkAttachmentRow[] => {
  const { data: virtualNetworks = [] } = useVirtualNetworks();
  const { data: subnets = [] } = useSubnets();
  const { data: securityGroups = [] } = useSecurityGroups();

  return useMemo((): VmNetworkAttachmentRow[] => {
    const attachments = vm.spec?.networkAttachments ?? [];
    return attachments.map((attachment) => {
      const subnet = subnets.find((item) => item.id === attachment.subnet?.id);
      const virtualNetworkId = subnet?.spec?.virtualNetwork?.id ?? '';
      const virtualNetwork = virtualNetworks.find((item) => item.id === virtualNetworkId);
      const subnetId = attachment.subnet?.id ?? '';
      return {
        virtualNetwork: {
          id: virtualNetworkId,
          name: resourceDisplayName(virtualNetwork?.metadata, virtualNetworkId),
        },
        subnet: {
          id: subnetId,
          name: resourceDisplayName(subnet?.metadata, subnetId),
        },
        virtualNetworkId,
        securityGroups: (attachment.securityGroups ?? []).map(({ id }) => {
          const securityGroup = securityGroups.find((item) => item.id === id);
          return { id, name: resourceDisplayName(securityGroup?.metadata, id) };
        }),
      };
    });
  }, [vm.spec?.networkAttachments, subnets, virtualNetworks, securityGroups]);
};
