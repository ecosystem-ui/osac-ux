import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown, DropdownList, MenuToggle } from '@patternfly/react-core';

import type { Project } from '@osac/types';
import DeleteResourceButton from '@osac/ui-components/components/Resource/DeleteResourceButton';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import ProjectDeleteModal from '../ProjectDeleteModal';
import { getProjectName } from '../utils';

interface ProjectDetailsActionButtonsProps {
  project: Project;
}

const ProjectDetailsActionButtons = ({ project }: ProjectDetailsActionButtonsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const projectName = getProjectName(project, t);

  return (
    <>
      {deleteOpen && (
        <ProjectDeleteModal
          project={project}
          onClose={() => setDeleteOpen(false)}
          onSuccess={() => navigate('/projects', { replace: true })}
        />
      )}
      <Dropdown
        isOpen={open}
        onOpenChange={setOpen}
        toggle={(ref) => (
          <MenuToggle
            ref={ref}
            variant="secondary"
            onClick={() => setOpen((current) => !current)}
            aria-label={t('Actions for {{name}}', { name: projectName })}
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
              setDeleteOpen(true);
              setOpen(false);
            }}
          />
        </DropdownList>
      </Dropdown>
    </>
  );
};

export default ProjectDetailsActionButtons;
