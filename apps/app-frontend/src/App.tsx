import { Navigate, Route, Routes } from 'react-router-dom';
import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Spinner,
} from '@patternfly/react-core';

import { SessionProvider, useSession } from '@osac/ui-components/hooks/use-session';

import { useOIDCLogin } from './hooks/oidc-login';
import { useMockLogin } from './mock/use-mock-login';
import { AppShell } from './shell/AppShell';
import { defaultRouteForRole } from './shell/shellRoutes';

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

const LoggedInHomeRedirect = () => {
  const { role } = useSession();
  return <Navigate to={defaultRouteForRole(role)} replace />;
};

// ---------------------------------------------------------------------------
// Live app (real OIDC + fulfillment-service)
// ---------------------------------------------------------------------------

const LiveApp = () => {
  const [username, role, tenantId, isLoading, error, logout] = useOIDCLogin();

  if (isLoading) {
    return (
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    );
  }

  if (error) {
    return (
      <Bullseye>
        <EmptyState titleText="Sign-in failed" headingLevel="h4">
          <EmptyStateBody>{error}</EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button variant="primary">Retry</Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      </Bullseye>
    );
  }

  return (
    <SessionProvider role={role} username={username} tenantId={tenantId}>
      <Routes>
        <Route path="/" element={<LoggedInHomeRedirect />} />
        <Route path="/*" element={<AppShell logout={logout} />} />
      </Routes>
    </SessionProvider>
  );
};

// ---------------------------------------------------------------------------
// Mock app (no OIDC, no fulfillment-service, persona switcher in header)
// ---------------------------------------------------------------------------

const MockApp = () => {
  const [username, role, tenantId, , , logout, setRole] = useMockLogin();

  return (
    <SessionProvider role={role} username={username} tenantId={tenantId}>
      <Routes>
        <Route path="/" element={<LoggedInHomeRedirect />} />
        <Route
          path="/*"
          element={<AppShell logout={logout} onRoleChange={setRole} />}
        />
      </Routes>
    </SessionProvider>
  );
};

// ---------------------------------------------------------------------------
// Root: pick the right app based on VITE_MOCK_MODE
// ---------------------------------------------------------------------------

const App = () => (MOCK_MODE ? <MockApp /> : <LiveApp />);

export default App;
