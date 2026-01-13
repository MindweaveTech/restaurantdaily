#!/usr/bin/env python3
"""
GR Kitchens Import Pipeline

Unified pipeline to import all data from Google Drive monthly reports.
"""

import io
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple

import pandas as pd
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

from parsers import (
    RateListParser,
    AttendanceParser,
    SalesParser,
    PCVParser,
    PnLParser,
    InventoryParser,
)
from parsers.base import ParseResult

# Configuration
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
SERVICE_ACCOUNT_FILE = 'gr-kitchens-31bb4c05bf9f.json'
FOLDER_ID = '10VH9MOB9mg5tIK67idFmPCRGLAr-4-0y'
OUTPUT_DIR = Path('data')


class ImportPipeline:
    """Pipeline to import and parse GR Kitchens reports from Google Drive."""

    # Parser registry
    PARSERS = [
        RateListParser,
        AttendanceParser,
        SalesParser,
        PCVParser,
        PnLParser,
        InventoryParser,
    ]

    def __init__(self, credentials_file: str = SERVICE_ACCOUNT_FILE):
        """Initialize pipeline with credentials."""
        self.credentials_file = credentials_file
        self.service = self._get_drive_service()
        self.output_dir = OUTPUT_DIR
        self.output_dir.mkdir(exist_ok=True)

    def _get_drive_service(self):
        """Create and return Drive API service."""
        credentials = service_account.Credentials.from_service_account_file(
            self.credentials_file, scopes=SCOPES
        )
        return build('drive', 'v3', credentials=credentials)

    def list_reports(self, folder_id: str = FOLDER_ID) -> List[Dict[str, Any]]:
        """List all report files in the folder."""
        results = self.service.files().list(
            q=f"'{folder_id}' in parents",
            pageSize=100,
            fields="files(id, name, mimeType, modifiedTime)"
        ).execute()

        files = results.get('files', [])

        # Add parsed date info
        for f in files:
            year, month = self._parse_report_date(f['name'])
            f['year'] = year
            f['month'] = month

        # Sort by date
        files.sort(key=lambda x: (x['year'] or 0, x['month'] or 0))
        return files

    def _parse_report_date(self, filename: str) -> Tuple[Optional[int], Optional[int]]:
        """Extract year and month from filename."""
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

        # Find year
        year_match = re.search(r'20\d{2}', filename)
        if year_match:
            year = int(year_match.group())

        # Find month
        for month_name, month_num in months.items():
            if month_name in name_lower:
                month = month_num
                break

        return year, month

    def download_file(self, file_id: str, mime_type: str) -> io.BytesIO:
        """Download a file from Drive."""
        file_data = io.BytesIO()

        if mime_type == 'application/vnd.google-apps.spreadsheet':
            # Export Google Sheet as xlsx
            request = self.service.files().export_media(
                fileId=file_id,
                mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
        else:
            # Download directly
            request = self.service.files().get_media(fileId=file_id)

        downloader = MediaIoBaseDownload(file_data, request)
        done = False
        while not done:
            status, done = downloader.next_chunk()

        file_data.seek(0)
        return file_data

    def parse_report(self, file_info: Dict[str, Any]) -> Dict[str, ParseResult]:
        """Download and parse a single report file."""
        year = file_info['year']
        month = file_info['month']

        if not year or not month:
            print(f"  Skipping {file_info['name']} - could not parse date")
            return {}

        # Download file
        file_data = self.download_file(file_info['id'], file_info['mimeType'])

        # Open as Excel
        xlsx = pd.ExcelFile(file_data)

        results = {}

        for sheet_name in xlsx.sheet_names:
            # Find matching parser
            parser_class = None
            for pc in self.PARSERS:
                if pc.matches_sheet(sheet_name):
                    parser_class = pc
                    break

            if not parser_class:
                continue

            # Parse sheet
            try:
                df = pd.read_excel(xlsx, sheet_name=sheet_name)
                parser = parser_class(year=year, month=month)
                result = parser.parse(df)

                # Use normalized sheet type as key
                sheet_type = result.metadata.get('sheet_type', sheet_name.lower())
                results[sheet_type] = result

            except Exception as e:
                print(f"  Error parsing {sheet_name}: {e}")

        return results

    def import_all(self, limit: Optional[int] = None) -> Dict[str, List[Dict[str, Any]]]:
        """Import all reports and aggregate data by type."""
        print("Listing reports from Google Drive...")
        files = self.list_reports()
        print(f"Found {len(files)} reports\n")

        if limit:
            files = files[:limit]

        # Aggregate data by type
        all_data = {
            'rate_list': [],
            'attendance': [],
            'sales': [],
            'pcv': [],
            'pnl': [],
            'inventory': [],
        }

        for i, f in enumerate(files):
            print(f"[{i+1}/{len(files)}] Processing: {f['name']}")

            try:
                results = self.parse_report(f)

                for sheet_type, result in results.items():
                    if result.success and result.data:
                        all_data[sheet_type].extend(result.data)
                        print(f"  - {sheet_type}: {len(result.data)} records")

                        # Store attendance records separately if present
                        if sheet_type == 'attendance' and 'attendance_records' in result.metadata:
                            # Could save daily attendance separately
                            pass

            except Exception as e:
                print(f"  Error: {e}")

        # Summary
        print("\n" + "="*60)
        print("IMPORT SUMMARY")
        print("="*60)
        for dtype, records in all_data.items():
            print(f"{dtype}: {len(records)} records")

        return all_data

    def save_data(self, data: Dict[str, List[Dict[str, Any]]], format: str = 'json'):
        """Save parsed data to files."""
        for dtype, records in data.items():
            if not records:
                continue

            if format == 'json':
                output_file = self.output_dir / f"{dtype}.json"
                with open(output_file, 'w') as f:
                    json.dump(records, f, indent=2, default=str)
                print(f"Saved {output_file}")

            elif format == 'csv':
                output_file = self.output_dir / f"{dtype}.csv"
                df = pd.DataFrame(records)
                df.to_csv(output_file, index=False)
                print(f"Saved {output_file}")

    def import_single_report(self, year: int, month: int) -> Dict[str, ParseResult]:
        """Import a specific month's report."""
        files = self.list_reports()

        # Find matching file
        target = None
        for f in files:
            if f['year'] == year and f['month'] == month:
                target = f
                break

        if not target:
            print(f"No report found for {year}-{month:02d}")
            return {}

        print(f"Processing: {target['name']}")
        return self.parse_report(target)


def main():
    """Run the import pipeline."""
    import argparse

    parser = argparse.ArgumentParser(description='GR Kitchens Import Pipeline')
    parser.add_argument('--limit', type=int, help='Limit number of files to process')
    parser.add_argument('--year', type=int, help='Import specific year')
    parser.add_argument('--month', type=int, help='Import specific month')
    parser.add_argument('--format', choices=['json', 'csv'], default='json', help='Output format')
    parser.add_argument('--dry-run', action='store_true', help='List files without importing')
    args = parser.parse_args()

    pipeline = ImportPipeline()

    if args.dry_run:
        files = pipeline.list_reports()
        print(f"Found {len(files)} reports:\n")
        for f in files:
            print(f"  {f['year']}-{f['month']:02d}: {f['name']}")
        return

    if args.year and args.month:
        results = pipeline.import_single_report(args.year, args.month)
        for sheet_type, result in results.items():
            print(f"\n{sheet_type.upper()}:")
            print(f"  Records: {len(result.data)}")
            print(f"  Metadata: {result.metadata}")
    else:
        data = pipeline.import_all(limit=args.limit)
        pipeline.save_data(data, format=args.format)


if __name__ == '__main__':
    main()
