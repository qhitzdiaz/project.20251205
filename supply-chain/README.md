# Supply Chain Management System

Self-contained supply chain workspace with its own backend (FastAPI + Postgres) and React frontend.

## Structure
- `backend/` FastAPI service with Postgres (docker-compose on ports 5070/5470)
- `frontend/` React + Vite dashboard (dev server on 5175)

## Run everything with Docker
```bash
cd supply-chain/backend
cp .env.example .env
docker compose up --build -d
```
The API will be available on `http://localhost:5070/api`. Sample data is seeded automatically.

## Run the frontend locally
```bash
cd supply-chain/frontend
npm install
npm run dev
```
The dev server runs on `http://localhost:5175` and points to the API at `http://localhost:5070/api`.
