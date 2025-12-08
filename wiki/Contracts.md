# Contracts

Contract generation covers two templates:
- Lease Contract (Philippine law-aligned)
- Property Management Agreement

## How to Generate
1) Go to **Contracts** in the Property Management frontend.
2) Click **Generate Lease Contract** or **Property Management Agreement**.
3) Fill all required fields; placeholders show what is missing. Required fields must be filled before saving.
4) Actions:
   - **Download PDF**: captures the current template view.
   - **Print**: opens the browser print dialog for the template.
   - **Save to database**: creates a contract record via `/contracts` (Property API).

## Saved Data
- Auto-generated contract number (lease or PMA prefix).
- Party name, contact (email/phone), dates, value, payment/renewal terms, termination notice, auto-renew flag, signed info, and summary description.
- Stored in the Property API (`/contracts`) for tracking and reporting.

## Validation
- Required fields are enforced before saving. Placeholders highlight missing items (e.g., lessor/lessee, property address, dates, rent/fees).

## Printing/PDF
- The on-screen template is exactly what is printed or exported to PDF; whatever you type is what you get.

## Troubleshooting
- If save fails, check the API is running on http://localhost:5050 and review the error toast in the dialog.
