"""
Run: python seed_rfq_data.py
Creates the default admin/admin123 staff user and seeds 5 demo inquiries.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'psi_site.settings')
django.setup()

from django.contrib.auth.models import User
from decimal import Decimal
from rfq.models import Inquiry, Quotation

# 1. Create Default Admin User if not exists
username = 'admin'
password = 'admin123'
email = 'admin@pressstamping.com'

if not User.objects.filter(username=username).exists():
    print(f"Creating default admin user '{username}'...")
    User.objects.create_superuser(username=username, email=email, password=password)
    print("Default admin user created successfully!")
else:
    print(f"Admin user '{username}' already exists.")

# 2. Seed RFQ Inquiries
demos = [
    dict(company_name="Tata Motors Ltd.", contact_person="Rajesh Sharma",
         phone="+91 98200 11234", email="rsharma@tatamotors.com",
         product="Stamped Door Hinge Bracket", quantity=50000,
         material="Mild Steel (MS)", status="Approved",
         message="ISI marked material. Delivery to Pune plant."),
    dict(company_name="Mahindra & Mahindra", contact_person="Priya Iyer",
         phone="+91 98765 99001", email="piyer@mahindra.com",
         product="Sheet Metal Engine Cover", quantity=25000,
         material="Galvanized Steel", status="Quoted",
         message="Surface finish Ra 1.6 required."),
    dict(company_name="Bosch India Pvt. Ltd.", contact_person="Arjun Nair",
         phone="+91 94455 22100", email="anair@bosch.com",
         product="Precision Stamped Contact Plate", quantity=100000,
         material="Stainless Steel (SS)", status="New",
         message="Quote required before 15th. Drawing attached."),
    dict(company_name="Havells India Ltd.", contact_person="Sunita Patel",
         phone="+91 88990 33200", email="spatel@havells.com",
         product="Copper Bus Bar Bracket", quantity=8000,
         material="Copper / Brass", status="Rejected",
         message="Tolerance ±0.05mm required."),
    dict(company_name="Godrej & Boyce Mfg.", contact_person="Kiran Menon",
         phone="+91 70001 44300", email="kmenon@godrej.com",
         product="Cabinet Hinge Plate", quantity=15000,
         material="Mild Steel (MS)", status="New",
         message="Zinc plating required post stamping."),
]

print("Seeding inquiries...")
for d in demos:
    status = d.pop('status')
    inq, created = Inquiry.objects.get_or_create(email=d['email'], product=d['product'], defaults=d)
    if created:
        Inquiry.objects.filter(pk=inq.pk).update(status=status)
        inq.status = status
        if status in ('Quoted','Approved'):
            Quotation.objects.get_or_create(inquiry=inq, defaults=dict(
                unit_price=Decimal('145.50'),
                delivery_time='21 Working Days',
                payment_terms='50% Advance, 50% on Dispatch',
                notes='Tooling cost to be quoted separately.'
            ))
        print(f"  Created: {inq.ref_number} — {inq.company_name} [{status}]")
    else:
        print(f"  Exists:  {inq.ref_number} — {inq.company_name}")

print("\nSeeding complete.")
