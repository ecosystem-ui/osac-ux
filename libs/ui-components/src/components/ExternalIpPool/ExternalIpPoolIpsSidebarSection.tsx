import {
  Content,
  Flex,
  FlexItem,
  Progress,
  Title,
} from '@patternfly/react-core';

import type { ExternalIPPool } from '@osac/types/private';

import { useTranslation } from '../../hooks/useTranslation';
import { displayValue } from '../../utils/detailFormatters';

import '../shared/details-page.css';
import './ExternalIpPoolDetailsPageContent.css';

interface ExternalIpPoolIpsSidebarSectionProps {
  pool: ExternalIPPool;
}

const ExternalIpPoolIpsSidebarSection = ({ pool }: ExternalIpPoolIpsSidebarSectionProps) => {
  const { t } = useTranslation();
  const allocated = pool.status?.allocated;
  const available = pool.status?.available;
  const total = pool.status?.total;
  const percent =
    pool.status && pool.status.total > 0n
      ? Number((pool.status.allocated * 100n) / pool.status.total)
      : 0;
  const allocatedLabel = t('{{allocated}} of {{total}} addresses allocated', {
    allocated: allocated?.toString() ?? '0',
    total: total?.toString() ?? '0',
  });
  const percentLabel = t('{{percent}}%', { percent });

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
            {t('IPs')}
          </Title>
        </FlexItem>
      </Flex>

      <Content component="p" className="details-page__sidebar-description">
        {t('Address capacity for this external IP pool.')}
      </Content>

      <Progress
        title={allocatedLabel}
        label={percentLabel}
        measureLocation="top"
        size="sm"
        value={percent}
        valueText={percentLabel}
        aria-label={allocatedLabel}
      />

      <dl
        className="external-ip-pool-details__capacity-stats"
        aria-label={t('External IP pool capacity')}
      >
        <div className="external-ip-pool-details__capacity-stat">
          <dt className="external-ip-pool-details__capacity-stat-label">{t('Available')}</dt>
          <dd className="external-ip-pool-details__capacity-stat-value">
            {available !== undefined ? `${available}` : displayValue()}
          </dd>
        </div>
        <div className="external-ip-pool-details__capacity-stat">
          <dt className="external-ip-pool-details__capacity-stat-label">{t('In use')}</dt>
          <dd className="external-ip-pool-details__capacity-stat-value">
            {allocated !== undefined ? `${allocated}` : displayValue()}
          </dd>
        </div>
        <div className="external-ip-pool-details__capacity-stat">
          <dt className="external-ip-pool-details__capacity-stat-label">{t('Total')}</dt>
          <dd className="external-ip-pool-details__capacity-stat-value">
            {total !== undefined ? `${total}` : displayValue()}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export default ExternalIpPoolIpsSidebarSection;
