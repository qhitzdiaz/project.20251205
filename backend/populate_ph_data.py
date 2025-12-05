"""
Populate Philippine Geographic Reference Data
This script populates regions, provinces, cities, and major streets
"""

import psycopg2
import os

# Database connection
DB_HOST = "postgres-dental"
DB_PORT = "5432"
DB_NAME = "dental_db"
DB_USER = "qhitz_user"
DB_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'devpass123')

def get_connection():
    """Get database connection"""
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

# Philippine Regions (17 regions)
REGIONS = [
    ('NCR', 'National Capital Region'),
    ('CAR', 'Cordillera Administrative Region'),
    ('I', 'Ilocos Region'),
    ('II', 'Cagayan Valley'),
    ('III', 'Central Luzon'),
    ('IV-A', 'CALABARZON'),
    ('IV-B', 'MIMAROPA'),
    ('V', 'Bicol Region'),
    ('VI', 'Western Visayas'),
    ('VII', 'Central Visayas'),
    ('VIII', 'Eastern Visayas'),
    ('IX', 'Zamboanga Peninsula'),
    ('X', 'Northern Mindanao'),
    ('XI', 'Davao Region'),
    ('XII', 'SOCCSKSARGEN'),
    ('XIII', 'Caraga'),
    ('BARMM', 'Bangsamoro Autonomous Region in Muslim Mindanao')
]

# Philippine Provinces (Major provinces - 81 total, showing key ones)
PROVINCES = [
    # NCR (Metro Manila)
    ('NCR', 'MM', 'Metro Manila'),

    # CAR
    ('CAR', 'ABR', 'Abra'),
    ('CAR', 'BEN', 'Benguet'),
    ('CAR', 'IFU', 'Ifugao'),
    ('CAR', 'KAL', 'Kalinga'),
    ('CAR', 'MOU', 'Mountain Province'),
    ('CAR', 'APA', 'Apayao'),

    # Region I
    ('I', 'ILS', 'Ilocos Sur'),
    ('I', 'ILN', 'Ilocos Norte'),
    ('I', 'LUN', 'La Union'),
    ('I', 'PAN', 'Pangasinan'),

    # Region II
    ('II', 'BAT', 'Batanes'),
    ('II', 'CAG', 'Cagayan'),
    ('II', 'ISA', 'Isabela'),
    ('II', 'NUV', 'Nueva Vizcaya'),
    ('II', 'QUI', 'Quirino'),

    # Region III
    ('III', 'AUR', 'Aurora'),
    ('III', 'BAN', 'Bataan'),
    ('III', 'BUL', 'Bulacan'),
    ('III', 'NUE', 'Nueva Ecija'),
    ('III', 'PAM', 'Pampanga'),
    ('III', 'TAR', 'Tarlac'),
    ('III', 'ZMB', 'Zambales'),

    # Region IV-A (CALABARZON)
    ('IV-A', 'BTG', 'Batangas'),
    ('IV-A', 'CAV', 'Cavite'),
    ('IV-A', 'LAG', 'Laguna'),
    ('IV-A', 'QUE', 'Quezon'),
    ('IV-A', 'RIZ', 'Rizal'),

    # Region IV-B (MIMAROPA)
    ('IV-B', 'MDC', 'Mindoro Occidental'),
    ('IV-B', 'MDR', 'Mindoro Oriental'),
    ('IV-B', 'MAD', 'Marinduque'),
    ('IV-B', 'RO', 'Romblon'),
    ('IV-B', 'PLW', 'Palawan'),

    # Region V (Bicol)
    ('V', 'ALB', 'Albay'),
    ('V', 'CAN', 'Camarines Norte'),
    ('V', 'CAS', 'Camarines Sur'),
    ('V', 'CAT', 'Catanduanes'),
    ('V', 'MAS', 'Masbate'),
    ('V', 'SOR', 'Sorsogon'),

    # Region VI (Western Visayas)
    ('VI', 'AKL', 'Aklan'),
    ('VI', 'ANT', 'Antique'),
    ('VI', 'CAP', 'Capiz'),
    ('VI', 'GUI', 'Guimaras'),
    ('VI', 'ILI', 'Iloilo'),
    ('VI', 'NEC', 'Negros Occidental'),

    # Region VII (Central Visayas)
    ('VII', 'BOH', 'Bohol'),
    ('VII', 'CEB', 'Cebu'),
    ('VII', 'NER', 'Negros Oriental'),
    ('VII', 'SIG', 'Siquijor'),

    # Region VIII (Eastern Visayas)
    ('VIII', 'BIL', 'Biliran'),
    ('VIII', 'EAS', 'Eastern Samar'),
    ('VIII', 'LEY', 'Leyte'),
    ('VIII', 'NOS', 'Northern Samar'),
    ('VIII', 'SLE', 'Southern Leyte'),
    ('VIII', 'WSA', 'Western Samar'),

    # Region IX (Zamboanga Peninsula)
    ('IX', 'ZAN', 'Zamboanga del Norte'),
    ('IX', 'ZAS', 'Zamboanga del Sur'),
    ('IX', 'ZSI', 'Zamboanga Sibugay'),

    # Region X (Northern Mindanao)
    ('X', 'BUK', 'Bukidnon'),
    ('X', 'CAM', 'Camiguin'),
    ('X', 'LAN', 'Lanao del Norte'),
    ('X', 'MSC', 'Misamis Occidental'),
    ('X', 'MSR', 'Misamis Oriental'),

    # Region XI (Davao)
    ('XI', 'DAO', 'Davao del Norte'),
    ('XI', 'DAS', 'Davao del Sur'),
    ('XI', 'DAV', 'Davao Oriental'),
    ('XI', 'DVO', 'Davao de Oro'),
    ('XI', 'DAC', 'Davao Occidental'),

    # Region XII (SOCCSKSARGEN)
    ('XII', 'NCO', 'North Cotabato'),
    ('XII', 'SAR', 'Sarangani'),
    ('XII', 'SCO', 'South Cotabato'),
    ('XII', 'SUK', 'Sultan Kudarat'),

    # Region XIII (Caraga)
    ('XIII', 'AGN', 'Agusan del Norte'),
    ('XIII', 'AGS', 'Agusan del Sur'),
    ('XIII', 'DIN', 'Dinagat Islands'),
    ('XIII', 'SUN', 'Surigao del Norte'),
    ('XIII', 'SUR', 'Surigao del Sur'),

    # BARMM
    ('BARMM', 'BAS', 'Basilan'),
    ('BARMM', 'LAS', 'Lanao del Sur'),
    ('BARMM', 'MAG', 'Maguindanao'),
    ('BARMM', 'SLU', 'Sulu'),
    ('BARMM', 'TAW', 'Tawi-Tawi'),
]

# Major Cities and Municipalities (showing major cities from each region)
CITIES = [
    # Metro Manila (NCR)
    ('MM', 'MNL', 'Manila', 'highly urbanized city'),
    ('MM', 'QC', 'Quezon City', 'highly urbanized city'),
    ('MM', 'MAK', 'Makati', 'highly urbanized city'),
    ('MM', 'TAT', 'Taguig', 'highly urbanized city'),
    ('MM', 'PAS', 'Pasig', 'highly urbanized city'),
    ('MM', 'MAN', 'Mandaluyong', 'component city'),
    ('MM', 'PAR', 'Parañaque', 'component city'),
    ('MM', 'LAS', 'Las Piñas', 'component city'),
    ('MM', 'MUN', 'Muntinlupa', 'component city'),
    ('MM', 'VAL', 'Valenzuela', 'component city'),
    ('MM', 'MAL', 'Malabon', 'component city'),
    ('MM', 'NAV', 'Navotas', 'component city'),
    ('MM', 'CAL', 'Caloocan', 'highly urbanized city'),
    ('MM', 'MAR', 'Marikina', 'component city'),
    ('MM', 'PAS2', 'Pasay', 'component city'),
    ('MM', 'SJC', 'San Juan', 'component city'),
    ('MM', 'PAT', 'Pateros', 'municipality'),

    # CAR
    ('BEN', 'BAG', 'Baguio', 'highly urbanized city'),
    ('BEN', 'LAT', 'La Trinidad', 'municipality'),

    # Region I
    ('ILS', 'VIG', 'Vigan', 'component city'),
    ('ILN', 'LAO', 'Laoag', 'component city'),
    ('LUN', 'SFE', 'San Fernando', 'component city'),
    ('PAN', 'DAG', 'Dagupan', 'component city'),
    ('PAN', 'URS', 'Urdaneta', 'component city'),

    # Region II
    ('CAG', 'TUG', 'Tuguegarao', 'component city'),
    ('ISA', 'ILA', 'Ilagan', 'component city'),
    ('ISA', 'CAU', 'Cauayan', 'component city'),

    # Region III
    ('BUL', 'MAL', 'Malolos', 'component city'),
    ('BUL', 'MER', 'Meycauayan', 'component city'),
    ('PAM', 'SFO', 'San Fernando', 'component city'),
    ('PAM', 'ANG', 'Angeles', 'highly urbanized city'),
    ('NUE', 'CAB', 'Cabanatuan', 'component city'),
    ('NUE', 'GAP', 'Gapan', 'component city'),
    ('TAR', 'TAR', 'Tarlac City', 'component city'),
    ('ZMB', 'OLO', 'Olongapo', 'highly urbanized city'),

    # CALABARZON
    ('CAV', 'BAC', 'Bacoor', 'component city'),
    ('CAV', 'CAV', 'Cavite City', 'component city'),
    ('CAV', 'DAS', 'Dasmariñas', 'component city'),
    ('CAV', 'IMU', 'Imus', 'component city'),
    ('LAG', 'CAL', 'Calamba', 'component city'),
    ('LAG', 'STA', 'Santa Rosa', 'component city'),
    ('LAG', 'BIN', 'Biñan', 'component city'),
    ('LAG', 'SPC', 'San Pedro', 'component city'),
    ('BTG', 'BAT', 'Batangas City', 'component city'),
    ('BTG', 'LIP', 'Lipa', 'component city'),
    ('RIZ', 'ANT', 'Antipolo', 'component city'),
    ('QUE', 'LUC', 'Lucena', 'highly urbanized city'),

    # MIMAROPA
    ('PLW', 'PRI', 'Puerto Princesa', 'highly urbanized city'),
    ('MDR', 'CAL', 'Calapan', 'component city'),

    # Bicol Region
    ('ALB', 'LEG', 'Legazpi', 'component city'),
    ('ALB', 'TAB', 'Tabaco', 'component city'),
    ('CAS', 'NAG', 'Naga', 'component city'),
    ('CAS', 'IRG', 'Iriga', 'component city'),
    ('SOR', 'SOR', 'Sorsogon City', 'component city'),

    # Western Visayas
    ('ILI', 'ILO', 'Iloilo City', 'highly urbanized city'),
    ('AKL', 'KAL', 'Kalibo', 'municipality'),
    ('CAP', 'ROX', 'Roxas', 'component city'),
    ('NEC', 'BAC', 'Bacolod', 'highly urbanized city'),

    # Central Visayas
    ('CEB', 'CEB', 'Cebu City', 'highly urbanized city'),
    ('CEB', 'MAN', 'Mandaue', 'component city'),
    ('CEB', 'LAP', 'Lapu-Lapu', 'highly urbanized city'),
    ('BOH', 'TAG', 'Tagbilaran', 'component city'),
    ('NER', 'DUM', 'Dumaguete', 'component city'),

    # Eastern Visayas
    ('LEY', 'TAC', 'Tacloban', 'highly urbanized city'),
    ('LEY', 'ORM', 'Ormoc', 'component city'),
    ('WSA', 'CAT', 'Catbalogan', 'component city'),

    # Zamboanga Peninsula
    ('ZAS', 'ZAM', 'Zamboanga City', 'highly urbanized city'),
    ('ZAN', 'DIP', 'Dipolog', 'component city'),
    ('ZAN', 'DAP', 'Dapitan', 'component city'),

    # Northern Mindanao
    ('MSR', 'CDO', 'Cagayan de Oro', 'highly urbanized city'),
    ('BUK', 'VAL', 'Valencia', 'component city'),
    ('LAN', 'ILI', 'Iligan', 'highly urbanized city'),

    # Davao Region
    ('DAO', 'DAV', 'Davao City', 'highly urbanized city'),
    ('DAS', 'DIG', 'Digos', 'component city'),
    ('DAV', 'MAT', 'Mati', 'component city'),

    # SOCCSKSARGEN
    ('SCO', 'GEN', 'General Santos', 'highly urbanized city'),
    ('SCO', 'KOR', 'Koronadal', 'component city'),
    ('NCO', 'KID', 'Kidapawan', 'component city'),

    # Caraga
    ('AGN', 'BUT', 'Butuan', 'highly urbanized city'),
    ('AGS', 'BAY', 'Bayugan', 'component city'),
    ('SUN', 'SUR', 'Surigao City', 'component city'),
    ('SUR', 'TAN', 'Tandag', 'component city'),

    # BARMM
    ('BAS', 'ISA', 'Isabela', 'component city'),
    ('LAS', 'MAR', 'Marawi', 'component city'),
]

# Major Streets in Key Cities
STREETS = [
    # Manila
    ('MNL', None, 'Roxas Boulevard', 'boulevard'),
    ('MNL', None, 'Taft Avenue', 'avenue'),
    ('MNL', None, 'Ayala Boulevard', 'boulevard'),
    ('MNL', None, 'España Boulevard', 'boulevard'),
    ('MNL', None, 'Quezon Boulevard', 'boulevard'),
    ('MNL', None, 'Recto Avenue', 'avenue'),
    ('MNL', None, 'Rizal Avenue', 'avenue'),

    # Quezon City
    ('QC', None, 'Commonwealth Avenue', 'avenue'),
    ('QC', None, 'EDSA', 'avenue'),
    ('QC', None, 'Quezon Avenue', 'avenue'),
    ('QC', None, 'Katipunan Avenue', 'avenue'),
    ('QC', None, 'Aurora Boulevard', 'boulevard'),
    ('QC', None, 'West Avenue', 'avenue'),
    ('QC', None, 'Timog Avenue', 'avenue'),

    # Makati
    ('MAK', None, 'Ayala Avenue', 'avenue'),
    ('MAK', None, 'EDSA', 'avenue'),
    ('MAK', None, 'Buendia Avenue', 'avenue'),
    ('MAK', None, 'Paseo de Roxas', 'street'),
    ('MAK', None, 'Chino Roces Avenue', 'avenue'),

    # Taguig
    ('TAT', None, 'C5 Road', 'road'),
    ('TAT', None, 'Bonifacio Global City', 'district'),
    ('TAT', None, 'McKinley Road', 'road'),

    # Pasig
    ('PAS', None, 'Ortigas Avenue', 'avenue'),
    ('PAS', None, 'C5 Road', 'road'),
    ('PAS', None, 'Shaw Boulevard', 'boulevard'),

    # Cebu City
    ('CEB', None, 'Osmeña Boulevard', 'boulevard'),
    ('CEB', None, 'Colon Street', 'street'),
    ('CEB', None, 'Jones Avenue', 'avenue'),
    ('CEB', None, 'Mango Avenue', 'avenue'),

    # Davao City
    ('DAV', None, 'J.P. Laurel Avenue', 'avenue'),
    ('DAV', None, 'C.M. Recto Avenue', 'avenue'),
    ('DAV', None, 'Quirino Avenue', 'avenue'),

    # Baguio
    ('BAG', None, 'Session Road', 'road'),
    ('BAG', None, 'Kennon Road', 'road'),
]

def populate_regions(conn):
    """Populate regions table"""
    cur = conn.cursor()
    print("Populating regions...")

    for region_code, region_name in REGIONS:
        cur.execute(
            "INSERT INTO ph_regions (region_code, region_name) VALUES (%s, %s) ON CONFLICT (region_code) DO NOTHING",
            (region_code, region_name)
        )

    conn.commit()
    print(f"✅ {len(REGIONS)} regions added")

def populate_provinces(conn):
    """Populate provinces table"""
    cur = conn.cursor()
    print("Populating provinces...")

    for region_code, province_code, province_name in PROVINCES:
        # Get region_id
        cur.execute("SELECT id FROM ph_regions WHERE region_code = %s", (region_code,))
        result = cur.fetchone()
        if result:
            region_id = result[0]
            cur.execute(
                "INSERT INTO ph_provinces (region_id, province_code, province_name) VALUES (%s, %s, %s) ON CONFLICT (province_code) DO NOTHING",
                (region_id, province_code, province_name)
            )

    conn.commit()
    print(f"✅ {len(PROVINCES)} provinces added")

def populate_cities(conn):
    """Populate cities table"""
    cur = conn.cursor()
    print("Populating cities...")

    for province_code, city_code, city_name, city_type in CITIES:
        # Get province_id
        cur.execute("SELECT id FROM ph_provinces WHERE province_code = %s", (province_code,))
        result = cur.fetchone()
        if result:
            province_id = result[0]
            cur.execute(
                "INSERT INTO ph_cities (province_id, city_code, city_name, city_type) VALUES (%s, %s, %s, %s) ON CONFLICT (city_code) DO NOTHING",
                (province_id, city_code, city_name, city_type)
            )

    conn.commit()
    print(f"✅ {len(CITIES)} cities/municipalities added")

def populate_streets(conn):
    """Populate streets table"""
    cur = conn.cursor()
    print("Populating streets...")

    for city_code, barangay_code, street_name, street_type in STREETS:
        # Get city_id
        cur.execute("SELECT id FROM ph_cities WHERE city_code = %s", (city_code,))
        result = cur.fetchone()
        if result:
            city_id = result[0]
            cur.execute(
                "INSERT INTO ph_streets (city_id, barangay_id, street_name, street_type) VALUES (%s, %s, %s, %s)",
                (city_id, barangay_code, street_name, street_type)
            )

    conn.commit()
    print(f"✅ {len(STREETS)} streets added")

def main():
    """Main function to populate all data"""
    print("🇵🇭 Philippine Geographic Reference Data Populator")
    print("=" * 50)

    try:
        conn = get_connection()
        print("✅ Connected to database")

        populate_regions(conn)
        populate_provinces(conn)
        populate_cities(conn)
        populate_streets(conn)

        conn.close()
        print("\n✅ All Philippine geographic data populated successfully!")
        print("\nSummary:")
        print(f"  - {len(REGIONS)} regions")
        print(f"  - {len(PROVINCES)} provinces")
        print(f"  - {len(CITIES)} cities/municipalities")
        print(f"  - {len(STREETS)} major streets")

    except Exception as e:
        print(f"❌ Error: {e}")
        raise

if __name__ == "__main__":
    main()
