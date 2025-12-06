## Compleat Smile Dental Aesthetic – Dental Clinic App (scaffold)

This directory is reserved for the new dental-clinic app, isolated from the existing apps.

### Current status
- Backend stack prepared: `backend/docker-compose.dental-clinic.yml` (Postgres on 5440, backend on 5015 -> internal 5013) with clinic name `Compleat Smile Dental Aesthetic`.
- No frontend or service code lives here yet; existing apps remain untouched.

### Suggested next steps
1) **Frontend**: scaffold a standalone SPA (e.g., React) under `dental-clinic/frontend/` reusing the existing DentalApp UI and new patient form, but pointing to `http://localhost:5015/api/dental`.
2) **Backend**: copy/repurpose `backend/dental_app.py` into a new entry point (or reuse) and configure it in the dental-clinic compose as needed.
3) **Reverse proxy**: add a dedicated server block/route for the clinic app if you want to expose it via nginx.
4) **Assets**: place clinic-specific assets (e.g., logo) under `dental-clinic/assets/` and wire them into the new frontend once created.

### Run the dedicated dental stack
```bash
cd backend
docker compose -f docker-compose.dental-clinic.yml up -d
```

This brings up the isolated Postgres + dental backend for the clinic app without touching other services.
