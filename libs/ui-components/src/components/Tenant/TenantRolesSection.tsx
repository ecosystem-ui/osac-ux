import { Link } from 'react-router-dom';
import { Button, Content, Flex, FlexItem, Title } from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import '../shared/details-page.css';

const TenantRolesSection = () => {
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
            {t('Roles')}
          </Title>
        </FlexItem>
        <FlexItem>
          <Button
            variant="link"
            className="details-page__sidebar-action"
            isInline
            icon={<PlusCircleIcon />}
            component={(props) => <Link {...props} to="/tenant/role-binding/create" />}
          >
            {t('Assign roles')}
          </Button>
        </FlexItem>
      </Flex>
      <Content component="p" className="details-page__sidebar-description">
        {t('Assign a tenant administrator, reader, or user for this tenant.')}
      </Content>
    </div>
  );
};

export default TenantRolesSection;
