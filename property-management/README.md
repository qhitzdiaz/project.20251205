## Property Management Application (scaffold)

Branch: `property-management`

Structure:
- `property-management/frontend` — client SPA (to be scaffolded; React recommended).
- `property-management/backend` — API service (to be scaffolded; e.g., Flask/FastAPI/Node).

Next steps:
1) Initialize backend service in `property-management/backend` (separate DB, env, and compose).
2) Initialize frontend in `property-management/frontend` with its own `package.json`, build pipeline, and API config pointing at the new backend.
3) Add a dedicated docker-compose (and optional nginx) for this app, isolated from other stacks.
