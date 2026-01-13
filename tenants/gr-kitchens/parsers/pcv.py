"""
PCV (Petty Cash Voucher) Parser

Parses the PCV sheet containing expense/petty cash data.
"""

import pandas as pd
from typing import Dict, List, Any, Optional
from datetime import datetime
import re
from .base import BaseParser, ParseResult


class PCVParser(BaseParser):
    """Parser for PCV (Petty Cash Voucher) sheet."""

    SHEET_PATTERNS = ['pcv', 'petty cash', 'expense report']

    # Expense category patterns
    CATEGORY_PATTERNS = {
        'staff': ['staff', 'employee', 'salary', 'wages', 'bonus'],
        'repair': ['repair', 'maintenance', 'fix', 'service'],
        'cleaning': ['cleaning', 'housekeeping', 'sanitation'],
        'transport': ['transport', 'travel', 'cab', 'auto', 'fuel', 'petrol'],
        'utilities': ['electricity', 'water', 'gas', 'utility'],
        'supplies': ['supplies', 'stationery', 'office'],
        'kitchen': ['kitchen', 'utensil', 'equipment'],
        'packaging': ['packaging', 'packing'],
        'misc': ['miscellaneous', 'misc', 'other'],
    }

    def parse(self, df: pd.DataFrame) -> ParseResult:
        """Parse PCV data."""
        result = ParseResult(success=True)
        result.metadata = {
            'year': self.year,
            'month': self.month,
            'sheet_type': 'pcv',
            'store': self.store,
        }

        # Find header row (contains "EXPENSE REPORT" or similar)
        header_row = self._find_header_row(df)

        # Find data start row (after header)
        data_start = header_row + 1

        # Try to identify column structure
        col_map = self._identify_columns(df, header_row)

        records = []
        total_expense = 0

        for idx in range(data_start, len(df)):
            row = df.iloc[idx]

            # Skip empty rows
            if row.isna().all():
                continue

            # Extract data based on identified columns
            date = self._get_cell(row, col_map.get('date'))
            pcv_no = self._get_cell(row, col_map.get('pcv_no'))
            description = self._get_cell(row, col_map.get('description'))
            amount = self._get_cell(row, col_map.get('amount'))

            # Skip if no meaningful data
            if not description and not amount:
                continue

            # Skip summary rows
            desc_lower = str(description).lower() if description else ''
            if any(x in desc_lower for x in ['total', 'grand total', 'sum']):
                continue

            # Parse amount
            amount_num = self.clean_number(amount)

            # Determine category
            category = self._determine_category(description)

            record = {
                'date': self._parse_date(date),
                'pcv_number': self.clean_string(pcv_no),
                'description': self.clean_string(description),
                'amount': amount_num,
                'category': category,
                'store': self.store,
                'year': self.year,
                'month': self.month,
            }

            if amount_num:
                total_expense += amount_num

            records.append(record)

        result.data = records
        result.metadata['record_count'] = len(records)
        result.metadata['total_expense'] = total_expense

        return result

    def _find_header_row(self, df: pd.DataFrame) -> int:
        """Find the row containing headers."""
        for idx, row in df.iterrows():
            row_str = ' '.join(str(v).lower() for v in row.values if pd.notna(v))
            if 'expense' in row_str or 'pcv' in row_str or 'voucher' in row_str:
                return idx
        return 0

    def _identify_columns(self, df: pd.DataFrame, header_row: int) -> Dict[str, int]:
        """Identify column indices for key fields."""
        col_map = {}

        # Look at the header row and row below for column names
        for check_row in [header_row, header_row + 1]:
            if check_row >= len(df):
                continue
            row = df.iloc[check_row]

            for col_idx, val in enumerate(row):
                if pd.isna(val):
                    continue
                val_str = str(val).lower()

                if 'date' in val_str and 'date' not in col_map:
                    col_map['date'] = col_idx
                elif ('pcv' in val_str or 'voucher' in val_str or 'no' in val_str) and 'pcv_no' not in col_map:
                    col_map['pcv_no'] = col_idx
                elif ('description' in val_str or 'particular' in val_str or 'detail' in val_str) and 'description' not in col_map:
                    col_map['description'] = col_idx
                elif ('amount' in val_str or 'value' in val_str or 'rs' in val_str) and 'amount' not in col_map:
                    col_map['amount'] = col_idx

        # Fallback: assume standard positions if not found
        if 'description' not in col_map:
            # Usually description is in column 2 or 3
            col_map['description'] = 2
        if 'amount' not in col_map:
            # Amount often in column 4 or 5
            col_map['amount'] = 4

        return col_map

    def _get_cell(self, row, col_idx: Optional[int]) -> Any:
        """Get cell value by index."""
        if col_idx is None:
            return None
        try:
            return row.iloc[col_idx]
        except (IndexError, KeyError):
            return None

    def _parse_date(self, value) -> Optional[str]:
        """Parse date value."""
        if value is None or pd.isna(value):
            return None
        if isinstance(value, datetime):
            return value.date().isoformat()
        try:
            parsed = pd.to_datetime(value)
            return parsed.date().isoformat()
        except:
            return None

    def _determine_category(self, description: str) -> str:
        """Determine expense category from description."""
        if not description:
            return 'uncategorized'
        desc_lower = str(description).lower()
        for category, patterns in self.CATEGORY_PATTERNS.items():
            for pattern in patterns:
                if pattern in desc_lower:
                    return category
        return 'uncategorized'
