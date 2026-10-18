import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';

import type { BareMetalInstanceType } from '@osac/types/private';

import { useTranslation } from '../../hooks/useTranslation';
import { displayValue } from '../../utils/detailFormatters';

import '../shared/details-page.css';

interface AdminBareMetalInstanceTypeSidebarSectionProps {
  instanceType: BareMetalInstanceType;
}

const AdminBareMetalInstanceTypeSidebarSection = ({
  instanceType,
}: AdminBareMetalInstanceTypeSidebarSectionProps) => {
  const { t } = useTranslation();
  const spec = instanceType.spec;

  const labelEntries = Object.entries(spec?.hostLabelSelector?.matchLabels ?? {});
  const capabilityEntries = Object.entries(spec?.hardware?.capabilities ?? {});

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
            {t('Host selection')}
          </Title>
        </FlexItem>
      </Flex>

      <DescriptionList isCompact aria-label={t('Host selection criteria')}>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Host labels')}</DescriptionListTerm>
          <DescriptionListDescription>
            {labelEntries.length > 0 ? (
              <ul style={{ margin: 0, paddingInlineStart: 0, listStyle: 'none' }}>
                {labelEntries.map(([k, v]) => (
                  <li key={k}>
                    <code>{`${k}=${v}`}</code>
                  </li>
                ))}
              </ul>
            ) : (
              displayValue(undefined)
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>{t('Capabilities')}</DescriptionListTerm>
          <DescriptionListDescription>
            {capabilityEntries.length > 0 ? (
              <ul style={{ margin: 0, paddingInlineStart: 0, listStyle: 'none' }}>
                {capabilityEntries.map(([k, v]) => (
                  <li key={k}>
                    <code>{`${k}=${v}`}</code>
                  </li>
                ))}
              </ul>
            ) : (
              displayValue(undefined)
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </div>
  );
};

export default AdminBareMetalInstanceTypeSidebarSection;
