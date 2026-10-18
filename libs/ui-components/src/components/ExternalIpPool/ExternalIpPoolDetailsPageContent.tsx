import { Link } from 'react-router-dom';
import {
  Avatar,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  PageSection,
  Progress,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import type { ExternalIPPool } from '@osac/types/private';

import ExternalIpPoolCidrsSection from './ExternalIpPoolCidrsSection';
import ExternalIpPoolStatusLabel from './ExternalIpPoolStatusLabel';
import { useTranslation } from '../../hooks/useTranslation';
import { displayValue } from '../../utils/detailFormatters';
import { Timestamp } from '../Primitives/Timestamp';

import './ExternalIpPoolDetailsPageContent.css';

const SHARED_TENANT = 'shared';
const FIELD_LABEL_CLASS = 'pf-v6-u-font-size-sm pf-v6-u-font-weight-normal';
const TENANT_REFERENCES: Record<string, { domain: string; id: string }> = {
  'acme-corporation': { domain: 'acme.example.com', id: 'tenant-acme' },
};

interface ExternalIpPoolDetailsPageContentProps {
  pool: ExternalIPPool;
}

const ExternalIpPoolDetailsPageContent = ({ pool }: ExternalIpPoolDetailsPageContentProps) => {
  const { t } = useTranslation();
  const cidrs = pool.spec?.cidrs ?? [];
  const tenant = pool.metadata?.tenant;
  const tenantReference = tenant ? TENANT_REFERENCES[tenant] : undefined;

  return (
    <PageSection hasBodyWrapper={false}>
      <Grid hasGutter>
        <GridItem md={8}>
          <Grid hasGutter>
            <GridItem md={6}>
              <Stack hasGutter>
                <StackItem>
                  <Title headingLevel="h2" size="lg">
                    {t('Overview')}
                  </Title>
                </StackItem>
                <StackItem>
                  <DescriptionList isCompact aria-label={t('External IP pool overview')}>
                    <DescriptionListGroup>
                      <DescriptionListTerm className={FIELD_LABEL_CLASS}>
                        {t('Status')}
                      </DescriptionListTerm>
                      <DescriptionListDescription>
                        <ExternalIpPoolStatusLabel state={pool.status?.state} />
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm className={FIELD_LABEL_CLASS}>
                        {t('Created')}
                      </DescriptionListTerm>
                      <DescriptionListDescription>
                        <Timestamp value={pool.metadata?.creationTimestamp} />
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm className={FIELD_LABEL_CLASS}>
                        {t('Tenant')}
                      </DescriptionListTerm>
                      <DescriptionListDescription>
                        {tenant ? (
                          tenant === SHARED_TENANT ? (
                            t('Shared')
                          ) : (
                            <Flex
                              alignItems={{ default: 'alignItemsCenter' }}
                              spaceItems={{ default: 'spaceItemsSm' }}
                            >
                              <FlexItem>
                                <Avatar
                                  alt=""
                                  color="gray"
                                  initials={tenant.charAt(0).toUpperCase()}
                                  size="sm"
                                />
                              </FlexItem>
                              <FlexItem>
                                <Stack hasGutter={false}>
                                  <StackItem>
                                    <Link
                                      to={`/admin/tenants/${encodeURIComponent(
                                        tenantReference?.id ?? tenant,
                                      )}`}
                                    >
                                      {tenant}
                                    </Link>
                                  </StackItem>
                                  {tenantReference?.domain ? (
                                    <StackItem>
                                      <span className="external-ip-pool-details__tenant-domain">
                                        {tenantReference.domain}
                                      </span>
                                    </StackItem>
                                  ) : null}
                                </Stack>
                              </FlexItem>
                            </Flex>
                          )
                        ) : (
                          displayValue()
                        )}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </StackItem>
              </Stack>
            </GridItem>
            <GridItem md={6}>
              <ExternalIpPoolCidrsSection cidrs={cidrs} ipFamily={pool.spec?.ipFamily} />
            </GridItem>
          </Grid>
        </GridItem>

        <GridItem md={4}>
          <Card isFullHeight>
            <CardTitle component="h2">{t('IPs')}</CardTitle>
            <CardBody>
              <Progress
                title={t('{{allocated}} of {{total}} addresses allocated', {
                  allocated: pool.status?.allocated?.toString() ?? '0',
                  total: pool.status?.total?.toString() ?? '0',
                })}
                label={t('{{percent}}%', {
                  percent:
                    pool.status && pool.status.total > 0n
                      ? Number((pool.status.allocated * 100n) / pool.status.total)
                      : 0,
                })}
                measureLocation="top"
                size="sm"
                value={
                  pool.status && pool.status.total > 0n
                    ? Number((pool.status.allocated * 100n) / pool.status.total)
                    : 0
                }
                valueText={t('{{percent}}%', {
                  percent:
                    pool.status && pool.status.total > 0n
                      ? Number((pool.status.allocated * 100n) / pool.status.total)
                      : 0,
                })}
                aria-label={t('{{allocated}} of {{total}} addresses allocated', {
                  allocated: pool.status?.allocated?.toString() ?? '0',
                  total: pool.status?.total?.toString() ?? '0',
                })}
              />
              <dl
                className="external-ip-pool-details__capacity-stats"
                aria-label={t('External IP pool capacity')}
              >
                <div className="external-ip-pool-details__capacity-stat">
                  <dt className="external-ip-pool-details__capacity-stat-label">
                    {t('Available')}
                  </dt>
                  <dd className="external-ip-pool-details__capacity-stat-value">
                    {pool.status ? `${pool.status.available}` : displayValue()}
                  </dd>
                </div>
                <div className="external-ip-pool-details__capacity-stat">
                  <dt className="external-ip-pool-details__capacity-stat-label">{t('In use')}</dt>
                  <dd className="external-ip-pool-details__capacity-stat-value">
                    {pool.status ? `${pool.status.allocated}` : displayValue()}
                  </dd>
                </div>
                <div className="external-ip-pool-details__capacity-stat">
                  <dt className="external-ip-pool-details__capacity-stat-label">{t('Total')}</dt>
                  <dd className="external-ip-pool-details__capacity-stat-value">
                    {pool.status ? `${pool.status.total}` : displayValue()}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </PageSection>
  );
};

export default ExternalIpPoolDetailsPageContent;
