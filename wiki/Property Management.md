# Property Management

The Property Management app includes dashboards, CRUD for properties/tenants/maintenance, and contract generation/saving.

## Access
- Frontend: http://localhost:3000 (Property Management section)
- API: http://localhost:5050/api

## Key Features
- Dashboard with occupancy, lease expirations, maintenance status, and cashflow.
- Properties CRUD with geocoding and map links.
- Tenants and Maintenance tracking.
- Contracts & Agreements (Lease + Property Management Agreement) with PDF/print and DB save.

## Contracts & Agreements
- Open **Contracts** and click **Generate Lease Contract** or **Property Management Agreement**.
- Fill required fields; placeholders guide what’s needed. Saving is blocked until required fields are filled.
- Actions:
  - **Download PDF**: captures the on-screen template with your entries.
  - **Print**: prints the same contract view.
  - **Save to database**: posts to `/contracts` on the Property API with contract number, party info, dates, financial terms, and a summary description.

## Saving Contracts (API)
- Endpoint: `POST /contracts`
- Stored fields include: `contract_number`, `contract_type`, `party_name`, `party_email/phone`, `start_date`, `end_date`, `value`, `payment_terms`, `renewal_terms`, `termination_notice_days`, `auto_renew`, `signed_at`, `signed_by`, and `description`.

## Maintenance
- Tracks tickets with status/priority; dashboard shows due and open tickets.

## Tips
- Use `./rebuild-all.sh --quick` for fast rebuilds without backups.
- For data persistence, allow the full rebuild to run backups/restores (default).
