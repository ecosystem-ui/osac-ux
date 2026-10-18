import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import { type BareMetalInstance, BareMetalInstanceRunStrategy } from '@osac/types';

import { useTranslation } from '../../hooks/useTranslation';
import { displayValue } from '../../utils/detailFormatters';
import { Timestamp } from '../Primitives/Timestamp';

import '../shared/details-page.css';

// MISSING: Lifecycle event history — no event/audit log endpoint in the fulfillment service yet.
// Predicted API: GET /api/fulfillment/v1/baremetal_instances/{id}/events →
//   { items: [{ eventType: string; occurredAt: Timestamp; message?: string }] }

const RUN_STRATEGY_LABELS: Partial<Record<BareMetalInstanceRunStrategy, string>> = {
  [BareMetalInstanceRunStrategy.ALWAYS]: 'Always on',
  [BareMetalInstanceRunStrategy.HALTED]: 'Halted',
};

interface Props {
  instance: BareMetalInstance;
}

export const BareMetalActivitySection = ({ instance }: Props) => {
  const { t } = useTranslation();

  const runStrategyRaw = instance.spec?.runStrategy;
  const runStrategyLabel = runStrategyRaw != null ? RUN_STRATEGY_LABELS[runStrategyRaw] : undefined;

  return (
    <Card variant="secondary" className="details-page__rail-card">
      <CardTitle>{t('Activity')}</CardTitle>
      <CardBody>
        <DescriptionList isCompact aria-label={t('Bare metal instance activity')}>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Run strategy')}</DescriptionListTerm>
            <DescriptionListDescription>
              {displayValue(runStrategyLabel ? t(runStrategyLabel) : undefined)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('State since')}</DescriptionListTerm>
            <DescriptionListDescription>
              <Timestamp value={instance.status?.stateTransitionTime} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* MISSING: last event type — requires lifecycle event history API */}
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Last event')}</DescriptionListTerm>
            <DescriptionListDescription>{displayValue(undefined)}</DescriptionListDescription>
          </DescriptionListGroup>
          {/* MISSING: last event time — requires lifecycle event history API */}
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Last event time')}</DescriptionListTerm>
            <DescriptionListDescription>
              <Timestamp value={undefined} />
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};
