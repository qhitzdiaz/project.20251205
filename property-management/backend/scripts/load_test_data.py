"""Load local/test seed data for Property Management.

Run manually (do not run in production environments):
  cd property-management/backend
  python3 scripts/load_test_data.py

If running in Docker:
  docker compose exec backend-property python scripts/load_test_data.py
"""

from datetime import date
from app import app, db, ensure_schema, Property, Tenant, Lease, Maintenance, Staff, Transaction


def seed():
    ensure_schema()

    if Property.query.count() > 0:
        print("Data already present; skipping seed.")
        return

    print("Seeding test data...")

    # Properties
    prop1 = Property(
        name='Harbor View Apartments',
        address='101 Waterfront Dr',
        city='Toronto',
        province='ON',
        country='Canada',
        units_total=24,
        manager_name='Sofia Lee',
        manager_phone='555-900-1111',
        manager_email='sofia.lee@harborview.com',
        postal_code='M5J 1A1',
        latitude=43.6408,
        longitude=-79.3853
    )
    prop2 = Property(
        name='Maple Grove Townhomes',
        address='77 Cedar Ave',
        city='Mississauga',
        province='ON',
        country='Canada',
        units_total=16,
        manager_name='Daniel Green',
        manager_phone='555-222-3333',
        manager_email='daniel.green@maplegrove.com',
        postal_code='L5A 1B2',
        latitude=43.5890,
        longitude=-79.6441
    )
    db.session.add_all([prop1, prop2])
    db.session.flush()

    # Tenants
    tenant1 = Tenant(full_name='Alex Morgan', email='alex.morgan@example.com', phone='555-100-2000')
    tenant2 = Tenant(full_name='Jamie Patel', email='jamie.patel@example.com', phone='555-300-4000')
    db.session.add_all([tenant1, tenant2])
    db.session.flush()

    # Leases
    lease1 = Lease(
        property_id=prop1.id,
        tenant_id=tenant1.id,
        unit='A-201',
        start_date=date(2025, 1, 1),
        end_date=date(2025, 12, 31),
        rent=2200,
        rent_due_day=1,
        deposit_amount=2200,
        status='active'
    )
    lease2 = Lease(
        property_id=prop2.id,
        tenant_id=tenant2.id,
        unit='B-104',
        start_date=date(2025, 2, 1),
        end_date=date(2026, 1, 31),
        rent=1850,
        rent_due_day=1,
        deposit_amount=1850,
        status='draft'
    )
    db.session.add_all([lease1, lease2])

    # Maintenance
    m1 = Maintenance(
        property_id=prop1.id,
        tenant_id=tenant1.id,
        title='Leaky faucet',
        description='Kitchen faucet dripping',
        priority='low',
        due_date=date(2025, 1, 15),
        status='pending'
    )
    m2 = Maintenance(
        property_id=prop2.id,
        tenant_id=tenant2.id,
        title='Heating issue',
        description='Living room heater not warming',
        priority='high',
        due_date=date(2025, 1, 10),
        status='in_progress'
    )
    db.session.add_all([m1, m2])

    # Staff
    staff1 = Staff(
        property_id=prop1.id,
        full_name='Sofia Lee',
        role='Property Manager',
        department='Operations',
        email='sofia.lee@harborview.com',
        phone='555-900-1111',
        start_date=date(2024, 6, 1),
        notes='Primary contact for Harbor View'
    )
    staff2 = Staff(
        property_id=prop2.id,
        full_name='Daniel Green',
        role='Property Manager',
        department='Operations',
        email='daniel.green@maplegrove.com',
        phone='555-222-3333',
        start_date=date(2024, 7, 15),
        notes='Covers Maple Grove maintenance scheduling'
    )
    staff3 = Staff(
        property_id=None,
        full_name='Jamie Lee',
        role='Leasing Coordinator',
        department='Leasing',
        email='jamie.lee@qhitz.com',
        phone='555-888-1212',
        start_date=date(2024, 8, 1),
        notes='Floats across properties'
    )
    db.session.add_all([staff1, staff2, staff3])

    # Transactions
    t1 = Transaction(
        property_id=prop1.id,
        lease_id=lease1.id,
        txn_type='income',
        category='rent',
        amount=2200,
        txn_date=date(2025, 1, 1),
        status='cleared',
        memo='January rent'
    )
    t2 = Transaction(
        property_id=prop1.id,
        txn_type='expense',
        category='maintenance',
        amount=450,
        txn_date=date(2025, 1, 5),
        status='cleared',
        memo='Plumbing repair'
    )
    t3 = Transaction(
        property_id=prop2.id,
        lease_id=lease2.id,
        txn_type='income',
        category='rent',
        amount=1850,
        txn_date=date(2025, 2, 1),
        status='pending',
        memo='February rent pending'
    )
    db.session.add_all([t1, t2, t3])

    db.session.commit()
    print("Seed complete.")


if __name__ == '__main__':
    with app.app_context():
        seed()
