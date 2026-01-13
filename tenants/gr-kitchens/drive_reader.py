#!/usr/bin/env python3
"""Read files from Google Drive using service account credentials."""

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
SERVICE_ACCOUNT_FILE = '/Users/grao/Projects/GR-Kitchens/gr-kitchens-31bb4c05bf9f.json'
FOLDER_ID = '10VH9MOB9mg5tIK67idFmPCRGLAr-4-0y'

def get_drive_service():
    """Create and return Drive API service."""
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return build('drive', 'v3', credentials=credentials)

def list_files_in_folder(service, folder_id):
    """List all files in a folder."""
    results = service.files().list(
        q=f"'{folder_id}' in parents",
        pageSize=100,
        fields="files(id, name, mimeType, modifiedTime)"
    ).execute()
    return results.get('files', [])

def main():
    service = get_drive_service()

    print("Files in 'Burger Singh Monthly Reports' folder:\n")
    files = list_files_in_folder(service, FOLDER_ID)

    if not files:
        print("No files found.")
        return

    for f in sorted(files, key=lambda x: x['name']):
        print(f"- {f['name']}")
        print(f"  ID: {f['id']}")
        print(f"  Type: {f['mimeType']}")
        print()

if __name__ == '__main__':
    main()
