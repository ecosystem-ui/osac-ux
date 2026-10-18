import { useState } from 'react';
import { Dropdown, DropdownItem, DropdownList, MenuToggle } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon';

import { useTranslation } from '../../hooks/useTranslation';
import DeleteResourceButton from '../Resource/DeleteResourceButton';

interface SecurityGroupRuleActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const SecurityGroupRuleActionsMenu = ({ onEdit, onDelete }: SecurityGroupRuleActionsMenuProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      toggle={(ref) => (
        <MenuToggle
          ref={ref}
          variant="plain"
          size="sm"
          onClick={() => setIsOpen((open) => !open)}
          isExpanded={isOpen}
          aria-label={t('Rule actions')}
        >
          <EllipsisVIcon />
        </MenuToggle>
      )}
      popperProps={{ position: 'right' }}
    >
      <DropdownList>
        <DropdownItem
          value="edit"
          onClick={() => {
            onEdit();
            closeMenu();
          }}
        >
          {t('Edit')}
        </DropdownItem>
        <DeleteResourceButton
          isDropdown
          onClick={() => {
            onDelete();
            closeMenu();
          }}
        />
      </DropdownList>
    </Dropdown>
  );
};

export default SecurityGroupRuleActionsMenu;
