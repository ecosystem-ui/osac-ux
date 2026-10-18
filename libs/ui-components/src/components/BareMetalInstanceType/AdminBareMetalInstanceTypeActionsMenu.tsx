import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown, DropdownItem, DropdownList, MenuToggle } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon';

import type { BareMetalInstanceType } from '@osac/types/private';
import DeleteResourceButton from '@osac/ui-components/components/Resource/DeleteResourceButton';

import { BAREMETAL_INSTANCE_TYPES_LIST_ROUTE } from './AdminBareMetalInstanceTypeListPage';
import BareMetalInstanceTypeDeleteModal from './BareMetalInstanceTypeDeleteModal';
import { useTranslation } from '../../hooks/useTranslation';

interface AdminBareMetalInstanceTypeActionsMenuProps {
  instanceType: BareMetalInstanceType;
  showLabel?: boolean;
  onDeleteSuccess?: () => void;
}

const AdminBareMetalInstanceTypeActionsMenu = ({
  instanceType,
  showLabel = false,
  onDeleteSuccess,
}: AdminBareMetalInstanceTypeActionsMenuProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const name = instanceType.metadata?.name ?? instanceType.id;
  const editRoute = `${BAREMETAL_INSTANCE_TYPES_LIST_ROUTE}/${instanceType.id}/edit`;

  return (
    <>
      {deleteOpen && (
        <BareMetalInstanceTypeDeleteModal
          instanceType={instanceType}
          onClose={() => setDeleteOpen(false)}
          onSuccess={() => {
            setDeleteOpen(false);
            onDeleteSuccess?.();
          }}
        />
      )}
      <Dropdown
        isOpen={open}
        onOpenChange={setOpen}
        toggle={(ref) => (
          <MenuToggle
            ref={ref}
            variant={showLabel ? 'secondary' : 'plain'}
            onClick={() => setOpen((o) => !o)}
            aria-label={t('Actions for {{name}}', { name })}
          >
            {showLabel ? t('Actions') : <EllipsisVIcon />}
          </MenuToggle>
        )}
        popperProps={{ position: 'right' }}
      >
        <DropdownList>
          <DropdownItem
            onClick={() => {
              setOpen(false);
              void navigate(editRoute);
            }}
          >
            {t('Edit')}
          </DropdownItem>
          <DeleteResourceButton
            isDropdown
            onClick={() => {
              setDeleteOpen(true);
              setOpen(false);
            }}
          />
        </DropdownList>
      </Dropdown>
    </>
  );
};

export default AdminBareMetalInstanceTypeActionsMenu;
