# Supply Chain Management API

FastAPI-based backend for the Supply Chain Management System with its own Postgres instance.

## Services
- API: defaults to `http://localhost:5060`
- Postgres: exposed on `localhost:5470`

## Quick start
```bash
cd supply-chain/backend
cp .env.example .env
docker compose up --build -d
```

## Notes
- Data auto-seeds a sample supplier, products, purchase order, shipment, and stock movements on first boot.
- CORS defaults to `*` but can be tightened via `ALLOWED_ORIGINS` in `.env`.
