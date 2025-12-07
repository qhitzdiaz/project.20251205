# Property Management API

FastAPI backend with its own Postgres instance for properties, tenants, leases, and maintenance.

## Services
- API: defaults to `http://localhost:5050`
- Postgres: exposed on `localhost:5450`

## Quick start
```bash
cd property-management/backend
cp .env.example .env
docker compose up --build -d
```

## Notes
- Seeds demo properties, tenants, leases, and maintenance tickets on first boot.
- CORS defaults to `*`; adjust with `ALLOWED_ORIGINS` in `.env`.
