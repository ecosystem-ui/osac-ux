import * as React from 'react';
import { Label, MenuToggle, Select, SelectList, SelectOption } from '@patternfly/react-core';
import { FlaskIcon } from '@patternfly/react-icons/dist/esm/icons/flask-icon';

import type { UserRole } from '@osac/ui-components/shellTypes';
import { userRoleLabels } from '@osac/ui-components/shellTypes';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

interface MockPersonaSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const ALL_ROLES: UserRole[] = ['admin', 'tenant-idp-manager', 'tenant-admin', 'tenant-user'];

export const MockPersonaSwitcher = ({ currentRole, onRoleChange }: MockPersonaSwitcherProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const labels = userRoleLabels(t);

  return (
    <Select
      isOpen={isOpen}
      onSelect={(_, value) => {
        onRoleChange(value as UserRole);
        setIsOpen(false);
      }}
      onOpenChange={setIsOpen}
      toggle={(ref) => (
        <MenuToggle
          ref={ref}
          onClick={() => setIsOpen((o) => !o)}
          isExpanded={isOpen}
          icon={<FlaskIcon />}
          aria-label={t('Switch mock persona')}
        >
          <Label color="orange" isCompact>
            {t('Mock')}
          </Label>{' '}
          {labels[currentRole]}
        </MenuToggle>
      )}
      shouldFocusToggleOnSelect
    >
      <SelectList>
        {ALL_ROLES.map((role) => (
          <SelectOption key={role} value={role} isSelected={role === currentRole}>
            {labels[role]}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};
