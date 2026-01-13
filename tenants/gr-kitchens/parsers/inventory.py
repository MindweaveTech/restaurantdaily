"""
Inventory Parser

Parses the Balance with Activity and Costs sheet containing inventory data.
"""

import pandas as pd
from typing import Dict, List, Any, Optional
from .base import BaseParser, ParseResult


class InventoryParser(BaseParser):
    """Parser for Inventory/Balance sheet."""

    SHEET_PATTERNS = ['balance', 'inventory', 'activity', 'costs']

    # Column name patterns to identify fields
    COLUMN_PATTERNS = {
        'category': ['category', 'cat'],
        'sub_category': ['sub category', 'subcategory', 'sub_category'],
        'name': ['name', 'item', 'product', 'description'],
        'uom': ['measuring unit', 'uom', 'unit'],
        'opening_qty': ['opening balance', 'opening qty', 'open bal'],
        'opening_cost': ['opening cost', 'open cost'],
        'purchase_qty': ['purchase', 'inward', 'received'],
        'purchase_cost': ['purchase cost'],
        'transfer_in': ['transfer in', 'transfer_in'],
        'transfer_out': ['transfer out', 'transfer_out'],
        'wastage': ['wastage', 'waste', 'damage'],
        'closing_qty': ['closing balance', 'closing qty', 'close bal'],
        'closing_cost': ['closing cost', 'close cost'],
        'consumption': ['consumption', 'consumed', 'used'],
    }

    def parse(self, df: pd.DataFrame) -> ParseResult:
        """Parse inventory data."""
        result = ParseResult(success=True)
        result.metadata = {
            'year': self.year,
            'month': self.month,
            'sheet_type': 'inventory',
            'store': self.store,
        }

        # Find header row
        header_row = self._find_header_row(df)

        # Set column names from header row
        if header_row > 0:
            df.columns = df.iloc[header_row]
            df = df.iloc[header_row + 1:].reset_index(drop=True)

        # Map columns to standard names
        col_map = self._map_columns(df.columns)

        records = []
        total_opening_value = 0
        total_closing_value = 0

        for idx, row in df.iterrows():
            # Skip empty rows
            if row.isna().all():
                continue

            # Get item name
            name = self._get_value(row, col_map.get('name'))
            if not name or pd.isna(name):
                continue

            # Skip header-like rows
            name_str = str(name).lower()
            if name_str in ['name', 'item', 'product', 'description']:
                continue

            record = {
                'name': self.clean_string(name),
                'category': self.clean_string(self._get_value(row, col_map.get('category'))),
                'sub_category': self.clean_string(self._get_value(row, col_map.get('sub_category'))),
                'uom': self.clean_string(self._get_value(row, col_map.get('uom'))),
                'opening_qty': self.clean_number(self._get_value(row, col_map.get('opening_qty'))),
                'opening_cost': self.clean_number(self._get_value(row, col_map.get('opening_cost'))),
                'purchase_qty': self.clean_number(self._get_value(row, col_map.get('purchase_qty'))),
                'purchase_cost': self.clean_number(self._get_value(row, col_map.get('purchase_cost'))),
                'transfer_in': self.clean_number(self._get_value(row, col_map.get('transfer_in'))),
                'transfer_out': self.clean_number(self._get_value(row, col_map.get('transfer_out'))),
                'wastage': self.clean_number(self._get_value(row, col_map.get('wastage'))),
                'closing_qty': self.clean_number(self._get_value(row, col_map.get('closing_qty'))),
                'closing_cost': self.clean_number(self._get_value(row, col_map.get('closing_cost'))),
                'consumption': self.clean_number(self._get_value(row, col_map.get('consumption'))),
                'store': self.store,
                'year': self.year,
                'month': self.month,
            }

            # Track totals
            if record['opening_cost']:
                total_opening_value += record['opening_cost']
            if record['closing_cost']:
                total_closing_value += record['closing_cost']

            records.append(record)

        result.data = records
        result.metadata['record_count'] = len(records)
        result.metadata['total_opening_value'] = total_opening_value
        result.metadata['total_closing_value'] = total_closing_value

        return result

    def _find_header_row(self, df: pd.DataFrame) -> int:
        """Find the row containing column headers."""
        for idx, row in df.iterrows():
            row_str = ' '.join(str(v).lower() for v in row.values if pd.notna(v))
            # Look for typical inventory column names
            if ('name' in row_str or 'item' in row_str) and ('balance' in row_str or 'cost' in row_str):
                return idx
            if 'category' in row_str and 'measuring' in row_str:
                return idx
        return 0

    def _map_columns(self, columns) -> Dict[str, str]:
        """Map column names to standard field names."""
        col_map = {}

        for col in columns:
            col_str = str(col).lower() if col else ''

            for field, patterns in self.COLUMN_PATTERNS.items():
                if field in col_map:
                    continue
                for pattern in patterns:
                    if pattern in col_str:
                        col_map[field] = col
                        break

        return col_map

    def _get_value(self, row, col_name) -> Any:
        """Safely get value from row."""
        if col_name is None:
            return None
        try:
            return row[col_name]
        except (KeyError, TypeError):
            return None
