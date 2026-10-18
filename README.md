# OSAC UX Prototype

OSAC UX is the web prototype for the [Open Sovereign AI Cloud (OSAC)](https://github.com/osac-project/) user experience for a self-service platform for deploying OpenShift clusters, virtual machines, and bare metal hosts. It is a pnpm monorepo consisting of a React 19 + PatternFly 6 single-page application

## Repository layout

| Path | Purpose |
|------|---------|
| `apps/app-frontend/` | React SPA (Vite, React 19, TanStack Query, react-router-dom 7) |
| `libs/api-contracts/` | Shared TypeScript types and wire normalizers |
| `libs/types/` | Generated protobuf types (do not edit) |
| `libs/ui-components/` | Shared PatternFly 6 component library |
| `proxy/` | Go chi reverse proxy — OIDC auth + API forwarding |
| `docs/` | Architecture and deployment documentation |

## Quick start

Prerequisites: Node.js 20+, pnpm 9+, Go 1.23+

```bash
pnpm install
```

Start the Go proxy (requires a running fulfillment API) and Vite dev server:

```bash
pnpm mock
```

## Documentation

| Document | Description |
|----------|-------------|
| [OpenShift deployment guide](docs/deployment-openshift-guide.md) | Step-by-step guide for deploying on OpenShift with Keycloak and fulfillment-service |
| [API query architecture](docs/api-query-arch.md) | How the API layer is split between `ui-components` and the app |
| [AGENTS.md](AGENTS.md) | Dev environment setup, scripts reference, and coding conventions |
