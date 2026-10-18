import { useState } from 'react';
import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import { IPFamily } from '@osac/types/private';

import { useTranslation } from '../../hooks/useTranslation';
import { SubtleContent } from '../SubtleContent/SubtleContent';

const CIDR_PREVIEW_COUNT = 1;
const FIELD_LABEL_CLASS = 'pf-v6-u-font-size-sm pf-v6-u-font-weight-normal';

interface ExternalIpPoolCidrsSectionProps {
  cidrs: string[];
  ipFamily?: IPFamily;
}

const ExternalIpPoolCidrsSection = ({ cidrs, ipFamily }: ExternalIpPoolCidrsSectionProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const canToggle = cidrs.length > CIDR_PREVIEW_COUNT;
  const visibleCidrs = canToggle && !isExpanded ? cidrs.slice(0, CIDR_PREVIEW_COUNT) : cidrs;

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2" size="lg">
          {t('CIDR')}
        </Title>
      </StackItem>
      <StackItem>
        {cidrs.length === 0 ? (
          <SubtleContent component="p">{t('No CIDRs')}</SubtleContent>
        ) : (
          <DescriptionList isCompact aria-label={t('External IP pool CIDR')}>
            <DescriptionListGroup>
              <DescriptionListTerm className={FIELD_LABEL_CLASS}>
                {ipFamily === IPFamily.IP_FAMILY_IPV6 ? t('IPv6') : t('IPv4')}
              </DescriptionListTerm>
              <DescriptionListDescription>
                <Stack hasGutter={false}>
                  {visibleCidrs.map((cidr, index) => (
                    <StackItem key={`${cidr}-${index}`}>
                      <code>{cidr}</code>
                    </StackItem>
                  ))}
                  {canToggle && (
                    <StackItem>
                      <Button
                        variant="link"
                        isInline
                        size="sm"
                        onClick={() => setIsExpanded((expanded) => !expanded)}
                      >
                        {isExpanded ? t('Show less') : t('More')}
                      </Button>
                    </StackItem>
                  )}
                </Stack>
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        )}
      </StackItem>
    </Stack>
  );
};

export default ExternalIpPoolCidrsSection;
