import { Link } from 'react-router-dom';
import { Button, Content, Flex, FlexItem, Title } from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import './TenantDetailsPage.css';

const TenantRolesSection = () => {
  const { t } = useTranslation();

  return (
    <div className="tenant-details-roles">
      <Flex
        className="tenant-details-roles__header"
        alignItems={{ default: 'alignItemsCenter' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        spaceItems={{ default: 'spaceItemsSm' }}
        flexWrap={{ default: 'wrap' }}
      >
        <FlexItem>
          <Title headingLevel="h2" size="md" className="tenant-details-roles__title">
            {t('Roles')}
          </Title>
        </FlexItem>
        <FlexItem>
          <Button
            variant="link"
            className="tenant-details-roles__action"
            isInline
            icon={<PlusCircleIcon />}
            component={(props) => <Link {...props} to="/tenant/role-binding/create" />}
          >
            {t('Assign roles')}
          </Button>
        </FlexItem>
      </Flex>
      <Content component="p" className="tenant-details-roles__description">
        {t('Assign a tenant administrator, reader, or user for this tenant.')}
      </Content>
    </div>
  );
};

export default TenantRolesSection;
