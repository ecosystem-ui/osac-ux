import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import InfoAltIcon from '@patternfly/react-icons/dist/esm/icons/info-alt-icon';

import type { BareMetalInstance } from '@osac/types';

import { useTranslation } from '../../hooks/useTranslation';
import { displayValue } from '../../utils/detailFormatters';
import { Timestamp } from '../Primitives/Timestamp';

import '../shared/details-page.css';

interface Props {
  instance: BareMetalInstance;
}

const BareMetalDetailsCard = ({ instance }: Props) => {
  const { t } = useTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <InfoAltIcon aria-hidden />
          <Title headingLevel="h2" size="lg">
            {t('Overview')}
          </Title>
        </Flex>
      </StackItem>
      <StackItem>
        <DescriptionList isCompact className="details-page__overview">
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Catalog item')}</DescriptionListTerm>
            <DescriptionListDescription>
              {displayValue(instance.spec?.catalogItem?.name)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('SSH public key')}</DescriptionListTerm>
            <DescriptionListDescription>
              {displayValue(instance.spec?.sshPublicKey)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
            <DescriptionListDescription>
              <Timestamp value={instance.metadata?.creationTimestamp} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Creator')}</DescriptionListTerm>
            <DescriptionListDescription>
              {displayValue(instance.metadata?.creator)}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>
    </Stack>
  );
};

export default BareMetalDetailsCard;
