import os
import json
import pandas as pd
from django.conf import settings

def build_clients_json():
    excel_path = os.path.join(settings.BASE_DIR, 'updated-client-list.xlsx')
    output_path = os.path.join(settings.BASE_DIR, 'static', 'clients.json')
    
    if os.path.exists(excel_path):
        df = pd.read_excel(excel_path)
        client_col = next((col for col in df.columns if 'client' in col.lower()), df.columns[1])
        since_col = next((col for col in df.columns if 'since' in col.lower()), df.columns[3])
        ind_col = next((col for col in df.columns if 'ind' in col.lower()), df.columns[4])
        website_col = next((col for col in df.columns if 'website' in col.lower()), None)
        
        clients = []
        for _, row in df.iterrows():
            name = str(row[client_col]).strip()
            if 'no client' in name.lower() or not name.strip() or name.lower() == 'nan':
                continue
            logo_filename = name.lower().replace(' ', '_').replace('.', '').replace('/', '_') + '.png'
            website = str(row[website_col]).strip() if website_col and pd.notna(row[website_col]) else '#'
            if website != '#' and not (website.startswith('http://') or website.startswith('https://')):
                website = 'https://' + website
            clients.append({
                'name': name,
                'short': "".join([w[0] for w in name.split() if w[0].isupper()]) or name[:2].upper(),
                'industry': row[ind_col],
                'since': row[since_col],
                'website': website,
                'logo': f'images/logos/{logo_filename}'
            })
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w') as f:
            json.dump(clients, f)
        print(f"Generated {output_path} with {len(clients)} clients")
    else:
        print(f"Excel file not found at {excel_path}")

if __name__ == '__main__':
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'psi_site.settings')
    django.setup()
    build_clients_json()