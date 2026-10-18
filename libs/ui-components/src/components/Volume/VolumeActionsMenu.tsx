import { useState } from 'react';
import { Dropdown, DropdownList, MenuToggle } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon';

import type { Volume } from '@osac/types';
import { VolumeState } from '@osac/types';
import DeleteResourceButton from '@osac/ui-components/components/Resource/DeleteResourceButton';

import VolumeDeleteConfirmModal from './VolumeDeleteConfirmModal';
import { useTranslation } from '../../hooks/useTranslation';

interface VolumeActionsMenuProps {
  volume: Volume;
  showLabel?: boolean;
  onDeleteSuccess?: () => void;
}

const canDeleteVolume = (state: VolumeState | undefined): boolean =>
  state === VolumeState.AVAILABLE || state === VolumeState.FAILED;

const VolumeActionsMenu = ({ volume, showLabel = false, onDeleteSuccess }: VolumeActionsMenuProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const state = volume.status?.state;
  const canDelete = canDeleteVolume(state);
  const name = volume.metadata?.name ?? volume.id;

  return (
    <>
      {deleteOpen && (
        <VolumeDeleteConfirmModal
          volume={volume}
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
          <DeleteResourceButton
            isDropdown
            canDelete={canDelete}
            value="delete"
            isDisabled={!canDelete}
            onClick={() => {
              if (!canDelete) {
                return;
              }
              setDeleteOpen(true);
              setOpen(false);
            }}
          />
        </DropdownList>
      </Dropdown>
    </>
  );
};

export default VolumeActionsMenu;
