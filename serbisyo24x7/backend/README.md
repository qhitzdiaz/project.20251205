# Serbisyo24x7 API

Minimal services/jobs API for service requests.

## Run
```bash
cd serbisyo24x7/backend
cp .env.example .env  # set POSTGRES_PASSWORD
docker compose up --build -d
```

API: http://localhost:5080/api

Endpoints:
- GET/POST/PUT/DELETE `/api/services`
- GET/POST/PUT/DELETE `/api/jobs`
- Health: `/health`
