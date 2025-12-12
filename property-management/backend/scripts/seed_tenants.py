"""Seed additional tenant test data.

Run manually (do not run in production environments):
  cd property-management/backend
  python3 scripts/seed_tenants.py

If running in Docker:
  docker compose exec backend-property python scripts/seed_tenants.py
"""

from app import app, db, ensure_schema, Tenant


def seed():
    ensure_schema()

    samples = [
        {
            "full_name": "Maria Dela Cruz",
            "email": "maria.delacruz@example.com",
            "phone": "+63 917 555 0101",
            "notes": "Sample tenant for PH address flows",
        },
        {
            "full_name": "Juan Miguel Santos",
            "email": "juan.santos@example.com",
            "phone": "+63 918 555 0102",
            "notes": "Prefilled with split name/address support",
        },
        {
            "full_name": "Ana Rodriguez",
            "email": "ana.rodriguez@example.com",
            "phone": "+63 919 555 0103",
            "notes": "Use for maintenance request demos",
        },
        {
            "full_name": "Carlos Garcia",
            "email": "carlos.garcia@example.com",
            "phone": "+63 920 555 0104",
            "notes": "Lease drafting test profile",
        },
        {
            "full_name": "Liza Flores",
            "email": "liza.flores@example.com",
            "phone": "+63 921 555 0105",
            "notes": "Invoice/expense walkthrough tenant",
        },
    ]

    created = 0
    for tenant in samples:
        existing = None
        if tenant.get("email"):
            existing = Tenant.query.filter_by(email=tenant["email"]).first()
        if not existing:
            existing = Tenant.query.filter_by(full_name=tenant["full_name"]).first()
        if existing:
            continue
        db.session.add(Tenant(**tenant))
        created += 1

    db.session.commit()
    print(f"Created {created} tenants. Total tenants: {Tenant.query.count()}")


if __name__ == "__main__":
    with app.app_context():
        seed()
