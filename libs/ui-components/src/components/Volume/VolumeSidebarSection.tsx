import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';

import type { Volume } from '@osac/types';

import { VolumeAccessModeLabel } from './VolumeAccessModeLabel';
import { useTranslation } from '../../hooks/useTranslation';
import { displayValue } from '../../utils/detailFormatters';

import '../shared/details-page.css';

interface VolumeSidebarSectionProps {
  volume: Volume;
}

const VolumeSidebarSection = ({ volume }: VolumeSidebarSectionProps) => {
  const { t } = useTranslation();

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
            {t('Configuration')}
          </Title>
        </FlexItem>
      </Flex>

      <DescriptionList isCompact aria-label={t('Volume configuration')}>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Access mode')}</DescriptionListTerm>
          <DescriptionListDescription>
            <VolumeAccessModeLabel accessMode={volume.spec?.accessMode} />
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Tenant')}</DescriptionListTerm>
          <DescriptionListDescription>
            {displayValue(volume.metadata?.tenant)}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Creator')}</DescriptionListTerm>
          <DescriptionListDescription>
            {displayValue(volume.metadata?.creator)}
          </DescriptionListDescription>
        </DescriptionListGroup>
        {volume.status?.message ? (
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Message')}</DescriptionListTerm>
            <DescriptionListDescription>{volume.status.message}</DescriptionListDescription>
          </DescriptionListGroup>
        ) : null}
      </DescriptionList>
    </div>
  );
};

export default VolumeSidebarSection;
