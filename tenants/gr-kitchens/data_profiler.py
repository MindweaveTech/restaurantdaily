#!/usr/bin/env python3
"""
GR Kitchens Data Profiler
Reads all monthly reports from Google Drive and profiles the data structure.
"""

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import pandas as pd
import io
import json
from datetime import datetime
from collections import defaultdict

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
SERVICE_ACCOUNT_FILE = 'gr-kitchens-31bb4c05bf9f.json'
FOLDER_ID = '10VH9MOB9mg5tIK67idFmPCRGLAr-4-0y'

def get_drive_service():
    """Create and return Drive API service."""
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return build('drive', 'v3', credentials=credentials)

def list_files(service, folder_id):
    """List all files in folder."""
    results = service.files().list(
        q=f"'{folder_id}' in parents",
        pageSize=100,
        fields="files(id, name, mimeType, modifiedTime)"
    ).execute()
    return results.get('files', [])

def download_sheet(service, file_id, mime_type):
    """Download a file and return as BytesIO."""
    file_data = io.BytesIO()

    if mime_type == 'application/vnd.google-apps.spreadsheet':
        # Export Google Sheet as xlsx
        request = service.files().export_media(
            fileId=file_id,
            mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    else:
        # Download xlsx directly
        request = service.files().get_media(fileId=file_id)

    downloader = MediaIoBaseDownload(file_data, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()

    file_data.seek(0)
    return file_data

def profile_dataframe(df, sheet_name):
    """Profile a dataframe and return structure info."""
    profile = {
        'sheet_name': sheet_name,
        'rows': len(df),
        'columns': len(df.columns),
        'column_names': list(df.columns),
        'column_types': {},
        'sample_values': {},
        'null_counts': {},
    }

    for col in df.columns:
        col_str = str(col)
        profile['column_types'][col_str] = str(df[col].dtype)
        profile['null_counts'][col_str] = int(df[col].isna().sum())

        # Get sample non-null values
        non_null = df[col].dropna()
        if len(non_null) > 0:
            samples = non_null.head(3).tolist()
            # Convert to string for JSON serialization
            profile['sample_values'][col_str] = [str(s)[:50] for s in samples]
        else:
            profile['sample_values'][col_str] = []

    return profile

def parse_report_date(filename):
    """Extract year and month from filename."""
    # Examples: "Burger Singh Report November 2025.xlsx"
    #           "Burger Singh Report 2021 09 September"
    import re

    months = {
        'january': 1, 'february': 2, 'march': 3, 'april': 4,
        'may': 5, 'june': 6, 'july': 7, 'august': 8,
        'september': 9, 'october': 10, 'november': 11, 'december': 12,
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    }

    name_lower = filename.lower()
    year = None
    month = None

    # Find year (4 digits)
    year_match = re.search(r'20\d{2}', filename)
    if year_match:
        year = int(year_match.group())

    # Find month
    for month_name, month_num in months.items():
        if month_name in name_lower:
            month = month_num
            break

    return year, month

def main():
    service = get_drive_service()
    files = list_files(service, FOLDER_ID)

    print(f"Found {len(files)} files\n")
    print("="*80)

    # Sort by parsed date
    files_with_dates = []
    for f in files:
        year, month = parse_report_date(f['name'])
        files_with_dates.append((f, year, month))

    files_with_dates.sort(key=lambda x: (x[1] or 0, x[2] or 0))

    # Track sheet structures across all files
    sheet_schemas = defaultdict(list)
    all_profiles = []

    for f, year, month in files_with_dates:
        print(f"\n{'='*80}")
        print(f"FILE: {f['name']}")
        print(f"Date: {year}-{month:02d}" if year and month else "Date: Unknown")
        print(f"Type: {f['mimeType']}")
        print("="*80)

        try:
            file_data = download_sheet(service, f['id'], f['mimeType'])
            xlsx = pd.ExcelFile(file_data)

            print(f"Sheets: {xlsx.sheet_names}")

            file_profile = {
                'filename': f['name'],
                'year': year,
                'month': month,
                'sheets': []
            }

            for sheet_name in xlsx.sheet_names:
                try:
                    df = pd.read_excel(xlsx, sheet_name=sheet_name)
                    profile = profile_dataframe(df, sheet_name)
                    file_profile['sheets'].append(profile)

                    # Normalize sheet name for comparison
                    normalized_name = sheet_name.strip().lower().replace(' ', '_')
                    sheet_schemas[normalized_name].append({
                        'file': f['name'],
                        'columns': profile['column_names'],
                        'rows': profile['rows']
                    })

                    print(f"\n  Sheet: {sheet_name}")
                    print(f"  Rows: {profile['rows']}, Columns: {profile['columns']}")
                    print(f"  Columns: {profile['column_names'][:5]}...")

                except Exception as e:
                    print(f"  Error reading sheet {sheet_name}: {e}")

            all_profiles.append(file_profile)

        except Exception as e:
            print(f"Error processing file: {e}")

    # Summary
    print("\n" + "="*80)
    print("SHEET TYPE SUMMARY")
    print("="*80)

    for sheet_type, occurrences in sorted(sheet_schemas.items()):
        print(f"\n{sheet_type.upper()} ({len(occurrences)} files)")
        print("-" * 40)

        # Find common columns
        if occurrences:
            all_cols = [set(str(c) for c in o['columns']) for o in occurrences]
            common_cols = set.intersection(*all_cols) if all_cols else set()
            print(f"Common columns: {list(common_cols)[:10]}")

            # Row count range
            row_counts = [o['rows'] for o in occurrences]
            print(f"Row range: {min(row_counts)} - {max(row_counts)}")

    # Save full profile to JSON
    output_file = 'data_profile.json'
    with open(output_file, 'w') as f:
        json.dump(all_profiles, f, indent=2, default=str)
    print(f"\n\nFull profile saved to {output_file}")

if __name__ == '__main__':
    main()
