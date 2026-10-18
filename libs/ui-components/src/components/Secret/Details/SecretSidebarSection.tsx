import { Link } from 'react-router-dom';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';

import { Secret, SecretType } from '@osac/types';

import { useTranslation } from '../../../hooks/useTranslation';
import { Timestamp } from '../../Primitives/Timestamp';
import { getSecretType } from '../utils';

import '../../shared/details-page.css';

interface SecretSidebarSectionProps {
  secret: Secret;
}

const SecretSidebarSection = ({ secret }: SecretSidebarSectionProps) => {
  const { t } = useTranslation();
  const secretTypes = getSecretType(t);
  const project = secret.metadata?.project?.trim();

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
            {t('Overview')}
          </Title>
        </FlexItem>
      </Flex>

      <DescriptionList isCompact aria-label={t('Secret overview')}>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Project')}</DescriptionListTerm>
          <DescriptionListDescription>
            {project ? (
              <Link to={`/projects/${encodeURIComponent(project)}`}>{project}</Link>
            ) : (
              t('Default')
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Type')}</DescriptionListTerm>
          <DescriptionListDescription>
            {secretTypes[secret.type] || secretTypes[SecretType.UNSPECIFIED]}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
          <DescriptionListDescription>
            <Timestamp value={secret.metadata?.creationTimestamp} />
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </div>
  );
};

export default SecretSidebarSection;
