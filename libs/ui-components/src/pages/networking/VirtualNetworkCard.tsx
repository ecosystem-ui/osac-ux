import {
  Card,
  CardBody,
  CardHeader,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import RhUiZoneIcon from '@patternfly/react-icons/dist/esm/icons/rh-ui-zone-icon';

import type { NATGateway, VirtualNetwork } from '@osac/types';
import ResourceNameField from '@osac/ui-components/components/Resource/ResourceNameField.tsx';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import { VirtualNetworkStatusLabel } from '../../components/networking/VirtualNetworkStatusLabel';

import './VirtualNetworkCard.css';

interface VirtualNetworkCardProps {
  virtualNetwork: VirtualNetwork;
  subnetCount: number;
  securityGroupCount: number;
  natGateway?: NATGateway;
  natGatewayAddress?: string;
}

const VirtualNetworkCard = ({
  virtualNetwork,
  subnetCount,
  securityGroupCount,
  natGateway,
  natGatewayAddress,
}: VirtualNetworkCardProps) => {
  const { t } = useTranslation();

  return (
    <Card isFullHeight className="virtual-network-card">
      <CardHeader
        className="virtual-network-card__header"
        actions={{
          actions: <VirtualNetworkStatusLabel state={virtualNetwork.status?.state} />,
        }}
      >
        <span className="virtual-network-card__icon" aria-hidden>
          <RhUiZoneIcon />
        </span>
      </CardHeader>
      <CardBody>
        <div className="virtual-network-card__main">
          <Stack hasGutter>
            <StackItem className="virtual-network-card__name">
              <ResourceNameField
                resource={virtualNetwork}
                detailsUrl={`/networking/virtual-networks/${virtualNetwork.id}`}
              />
            </StackItem>
            <Divider />
            <StackItem>
              <DescriptionList isCompact isHorizontal>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('IPv4 CIDR')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <code>{virtualNetwork.spec?.ipv4Cidr ?? '—'}</code>
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('IPv6 CIDR')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <code>{virtualNetwork.spec?.ipv6Cidr ?? '—'}</code>
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Subnets')}</DescriptionListTerm>
                  <DescriptionListDescription>{subnetCount}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Security groups')}</DescriptionListTerm>
                  <DescriptionListDescription>{securityGroupCount}</DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </StackItem>
          </Stack>
        </div>
        <div className="virtual-network-card__footer">
          <Content component="small" className="virtual-network-card__footer-label">
            {t('NAT gateway')}
          </Content>
          {natGateway ? (
            <Stack hasGutter={false}>
              <StackItem>{natGateway.metadata?.name ?? natGateway.id}</StackItem>
              <StackItem>
                <code>{natGatewayAddress ?? '—'}</code>
              </StackItem>
            </Stack>
          ) : (
            <span>—</span>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default VirtualNetworkCard;
