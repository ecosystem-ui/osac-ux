import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown, DropdownItem, DropdownList, MenuToggle } from '@patternfly/react-core';

import { Secret } from '@osac/types';
import DeleteResourceButton from '@osac/ui-components/components/Resource/DeleteResourceButton';

import { useTranslation } from '../../../hooks/useTranslation';
import SecretDeleteModal from '../SecretDeleteModal';

interface SecretDetailsActionButtonsProps {
  secret: Secret;
}

const SecretDetailsActionButtons = ({ secret }: SecretDetailsActionButtonsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      {deleteOpen && (
        <SecretDeleteModal
          secret={secret}
          onClose={() => setDeleteOpen(false)}
          onSuccess={() => navigate('/secrets', { replace: true })}
        />
      )}
      <Dropdown
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={() => setIsOpen(false)}
        popperProps={{ position: 'right' }}
        toggle={(toggleRef) => (
          <MenuToggle
            ref={toggleRef}
            variant="secondary"
            isExpanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
            aria-label={t('Actions')}
          >
            {t('Actions')}
          </MenuToggle>
        )}
      >
        <DropdownList>
          <DropdownItem value="edit" onClick={() => navigate(`/secrets/${secret.id}/edit`)}>
            {t('Edit')}
          </DropdownItem>
          <DeleteResourceButton
            isDropdown
            onClick={() => {
              setDeleteOpen(true);
              setIsOpen(false);
            }}
          />
        </DropdownList>
      </Dropdown>
    </>
  );
};

export default SecretDetailsActionButtons;
