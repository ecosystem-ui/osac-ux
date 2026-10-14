import * as React from 'react';

import type { UserRole } from '@osac/ui-components/shellTypes';

import { MOCK_ROLE_KEY, PERSONAS } from './mock-data';

const DEFAULT_ROLE: UserRole = 'tenant-admin';

function readStoredRole(): UserRole {
  const stored = localStorage.getItem(MOCK_ROLE_KEY) as UserRole | null;
  if (stored && stored in PERSONAS) return stored;
  return DEFAULT_ROLE;
}

/**
 * Drop-in replacement for useOIDCLogin in mock mode.
 *
 * Returns the same 6-tuple as useOIDCLogin, with an extra 7th element —
 * a setRole callback — used by MockPersonaSwitcher.
 */
export const useMockLogin = (): [
  username: string,
  role: UserRole,
  tenantId: string,
  isLoading: false,
  error: undefined,
  logout: () => Promise<void>,
  setRole: (role: UserRole) => void,
] => {
  const [role, setRoleState] = React.useState<UserRole>(readStoredRole);

  const setRole = React.useCallback((next: UserRole) => {
    localStorage.setItem(MOCK_ROLE_KEY, next);
    setRoleState(next);
  }, []);

  const logout = React.useCallback(async () => {
    setRole('tenant-user');
  }, [setRole]);

  const persona = PERSONAS[role];

  return [persona.username, role, persona.tenantId, false, undefined, logout, setRole];
};
