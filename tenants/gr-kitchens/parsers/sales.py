"""
Sales Report Parser

Parses the Sale report sheet containing daily/channel-wise sales data.
"""

import pandas as pd
from typing import Dict, List, Any, Optional
from datetime import datetime
import re
from .base import BaseParser, ParseResult


class SalesParser(BaseParser):
    """Parser for Sale report sheet."""

    SHEET_PATTERNS = ['sale report', 'sale_report', 'sales report', 'sales_report']

    # Sales channel name mappings
    CHANNEL_MAP = {
        'zomato': 'zomato',
        'swiggy': 'swiggy',
        'swiggy regular': 'swiggy',
        'swiggy minis': 'swiggy_minis',
        'dotpe': 'dotpe',
        'dinein': 'dine_in',
        'dine in': 'dine_in',
        'dine-in': 'dine_in',
        'takeaway': 'takeaway',
        'takeway': 'takeaway',
        't/a': 'takeaway',
        'magicpin': 'magicpin',
        'delivery': 'delivery',
        'bs blitz': 'zomato_campaign',
        'campaign': 'campaign',
    }

    def parse(self, df: pd.DataFrame) -> ParseResult:
        """Parse sales data."""
        result = ParseResult(success=True)
        result.metadata = {
            'year': self.year,
            'month': self.month,
            'sheet_type': 'sales',
            'store': self.store,
        }

        # Detect format type
        format_type = self._detect_format(df)
        result.metadata['format_type'] = format_type

        if format_type == 'daily_rows':
            records = self._parse_daily_rows(df)
        elif format_type == 'channel_columns':
            records = self._parse_channel_columns(df)
        else:
            records = self._parse_generic(df)

        result.data = records
        result.metadata['record_count'] = len(records)

        # Calculate summary
        total_sales = sum(r.get('amount', 0) or 0 for r in records)
        result.metadata['total_sales'] = total_sales

        return result

    def _detect_format(self, df: pd.DataFrame) -> str:
        """Detect which format the sales sheet is in."""
        columns_str = ' '.join(str(c).lower() for c in df.columns)
        first_col = str(df.columns[0]).lower() if len(df.columns) > 0 else ''

        # Check for daily format (DATE, DAY columns)
        if 'date' in first_col and 'day' in columns_str:
            return 'daily_rows'

        # Check for channel columns format (Total, Zomato, Swiggy, etc.)
        if 'total' in columns_str and ('zomato' in columns_str or 'swiggy' in columns_str):
            return 'channel_columns'

        # Check for Description/Total format
        if 'description' in first_col:
            return 'channel_columns'

        return 'generic'

    def _parse_daily_rows(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Parse format where each row is a day."""
        records = []

        # Identify columns
        date_col = None
        day_col = None
        sales_cols = {}

        for col in df.columns:
            col_str = str(col).lower()
            if col_str == 'date':
                date_col = col
            elif col_str == 'day':
                day_col = col
            elif 'net sale' in col_str or 'net_sale' in col_str:
                sales_cols['net_sales'] = col
            elif 'gross sale' in col_str:
                sales_cols['gross_sales'] = col
            elif 'delivery' in col_str and 'sale' in col_str:
                sales_cols['delivery_sales'] = col
            elif 'delivery' in col_str and 'order' in col_str:
                sales_cols['delivery_orders'] = col
            elif 'dine' in col_str and 'sale' in col_str:
                sales_cols['dine_in_sales'] = col
            elif 'dine' in col_str and 'order' in col_str:
                sales_cols['dine_in_orders'] = col
            elif ('t/a' in col_str or 'takeaway' in col_str) and 'sale' in col_str:
                sales_cols['takeaway_sales'] = col
            elif ('t/a' in col_str or 'takeaway' in col_str) and 'order' in col_str:
                sales_cols['takeaway_orders'] = col
            elif 'total order' in col_str:
                sales_cols['total_orders'] = col
            elif 'bpo' in col_str:
                sales_cols['basket_per_order'] = col

        for idx, row in df.iterrows():
            date_val = row.get(date_col) if date_col else None

            # Skip header/summary rows
            if date_val is None or pd.isna(date_val):
                continue
            if isinstance(date_val, str) and not date_val[0].isdigit():
                continue

            # Parse date
            sale_date = self._parse_date(date_val)
            if not sale_date:
                continue

            record = {
                'date': sale_date,
                'day_name': self.clean_string(row.get(day_col)) if day_col else None,
                'store': self.store,
                'year': self.year,
                'month': self.month,
            }

            # Add sales metrics
            for key, col in sales_cols.items():
                record[key] = self.clean_number(row.get(col))

            records.append(record)

        return records

    def _parse_channel_columns(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Parse format where columns are channels."""
        records = []

        # Find header row
        header_row = 0
        for idx, row in df.iterrows():
            first_val = str(row.iloc[0]).lower() if pd.notna(row.iloc[0]) else ''
            if 'description' in first_val or 'item' in first_val:
                header_row = idx
                break

        # Set header
        if header_row > 0:
            df.columns = df.iloc[header_row]
            df = df.iloc[header_row + 1:].reset_index(drop=True)

        # Map channel columns
        channel_cols = {}
        total_col = None
        desc_col = df.columns[0]

        for col in df.columns[1:]:
            col_str = str(col).lower() if col else ''
            if col_str == 'total':
                total_col = col
            else:
                channel = self._map_channel(col_str)
                if channel:
                    channel_cols[channel] = col

        # Parse each row (item)
        for idx, row in df.iterrows():
            desc = self.clean_string(row.iloc[0])
            if not desc:
                continue

            # Skip header-like rows
            if desc.lower() in ['description', 'item', 'category']:
                continue

            # Get total
            total = self.clean_number(row.get(total_col)) if total_col else None

            # Create record
            record = {
                'item': desc,
                'total': total,
                'store': self.store,
                'year': self.year,
                'month': self.month,
                'record_type': 'item_sales',
            }

            # Add channel breakdowns
            for channel, col in channel_cols.items():
                record[f'channel_{channel}'] = self.clean_number(row.get(col))

            records.append(record)

        return records

    def _parse_generic(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Parse generic format - extract what we can."""
        records = []

        # Try to find meaningful data
        for idx, row in df.iterrows():
            # Skip empty rows
            if row.isna().all():
                continue

            # Create a record with available data
            record = {
                'row_index': idx,
                'store': self.store,
                'year': self.year,
                'month': self.month,
                'record_type': 'raw',
            }

            # Add non-null values
            for col_idx, (col, val) in enumerate(row.items()):
                if pd.notna(val):
                    record[f'col_{col_idx}'] = str(val)[:100]

            if len(record) > 4:  # Has some data beyond metadata
                records.append(record)

        return records

    def _map_channel(self, channel_str: str) -> Optional[str]:
        """Map channel name to standard name."""
        if not channel_str:
            return None
        channel_lower = channel_str.lower()
        for pattern, standard in self.CHANNEL_MAP.items():
            if pattern in channel_lower:
                return standard
        return channel_str.replace(' ', '_')[:30]

    def _parse_date(self, value) -> Optional[str]:
        """Parse date value."""
        if value is None or pd.isna(value):
            return None
        if isinstance(value, datetime):
            return value.date().isoformat()
        try:
            # Try pandas parsing
            parsed = pd.to_datetime(value)
            return parsed.date().isoformat()
        except:
            return None
