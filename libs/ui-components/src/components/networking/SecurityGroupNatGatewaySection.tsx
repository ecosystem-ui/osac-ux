import { useNavigate } from 'react-router-dom';
import {
  Bullseye,
  Button,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Spinner,
  Title,
} from '@patternfly/react-core';

import { NatGatewayStatusLabel } from './NatGatewayStatusLabel';
import { useNatGateway } from '../../api/v1/networking';
import { useTranslation } from '../../hooks/useTranslation';
import { displayValue } from '../../utils/detailFormatters';
import { Timestamp } from '../Primitives/Timestamp';
import QueryErrorState from '../Resource/QueryErrorState';

import '../shared/details-page.css';

interface Props {
  virtualNetworkId: string;
}

export const SecurityGroupNatGatewaySection = ({ virtualNetworkId }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { natGateway, natAddress, isLoading, error } = useNatGateway(virtualNetworkId);

  return (
    <div className="details-page__sidebar">
      <Flex
        className="details-page__sidebar-header"
        alignItems={{ default: 'alignItemsCenter' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        spaceItems={{ default: 'spaceItemsSm' }}
        flexWrap={{ default: 'wrap' }}
      >
        <FlexItem>
          <Title headingLevel="h2" size="md" className="details-page__sidebar-title">
            {t('NAT gateway attachment')}
          </Title>
        </FlexItem>
        <FlexItem>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              navigate(`/networking/virtual-networks/${virtualNetworkId}`)
            }
          >
            {t('Manage')}
          </Button>
        </FlexItem>
      </Flex>

      {isLoading ? (
        <Bullseye>
          <Spinner aria-label={t('Loading NAT gateway')} />
        </Bullseye>
      ) : error ? (
        <QueryErrorState error={error} title={t('Failed to load NAT gateway')} />
      ) : natGateway ? (
        <DescriptionList isCompact aria-label={t('Attached NAT gateway')}>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
            <DescriptionListDescription>
              <NatGatewayStatusLabel state={natGateway.status?.state} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
            <DescriptionListDescription>
              {displayValue(natGateway.metadata?.name ?? natGateway.id)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('External IP')}</DescriptionListTerm>
            <DescriptionListDescription>
              <code>{displayValue(natAddress)}</code>
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Attached')}</DescriptionListTerm>
            <DescriptionListDescription>
              <Timestamp value={natGateway.metadata?.creationTimestamp} />
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      ) : (
        <Content component="p" className="details-page__sidebar-description">
          {t('No NAT gateway associated with this virtual network.')}
        </Content>
      )}
    </div>
  );
};
