import { useState } from 'react';
import { Dropdown, DropdownList, MenuToggle } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import DeleteResourceButton from '../Resource/DeleteResourceButton';

interface ExternalIpPoolDetailsActionsMenuProps {
  onDelete: () => void;
}

const ExternalIpPoolDetailsActionsMenu = ({ onDelete }: ExternalIpPoolDetailsActionsMenuProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Dropdown
      isOpen={open}
      onOpenChange={setOpen}
      toggle={(ref) => (
        <MenuToggle
          ref={ref}
          variant="secondary"
          onClick={() => setOpen((isOpen) => !isOpen)}
          aria-label={t('Actions')}
        >
          {t('Actions')}
        </MenuToggle>
      )}
      popperProps={{ position: 'right' }}
    >
      <DropdownList>
        <DeleteResourceButton
          isDropdown
          onClick={() => {
            setOpen(false);
            onDelete();
          }}
        />
      </DropdownList>
    </Dropdown>
  );
};

export default ExternalIpPoolDetailsActionsMenu;
