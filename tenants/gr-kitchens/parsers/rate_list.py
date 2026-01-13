"""
Rate List Parser

Parses the Rate-List sheet containing ingredient/product pricing.
"""

import pandas as pd
from typing import Dict, List, Any
from .base import BaseParser, ParseResult


class RateListParser(BaseParser):
    """Parser for Rate-List sheet."""

    SHEET_PATTERNS = ['rate-list', 'rate list', 'ratelist']

    # Standard UOM mappings
    UOM_MAP = {
        'pc': 'piece',
        'kg': 'kg',
        'lt': 'liter',
        'ltr': 'liter',
        'can(5lt)': 'can_5l',
        'can': 'can',
    }

    # Product categories based on name patterns
    CATEGORY_PATTERNS = {
        'beverage': ['coke', 'sprite', 'coffee', 'tea', 'water', 'shikanji', 'soda'],
        'patty': ['patty', 'burger'],
        'sauce': ['sauce', 'mayo', 'ketchup', 'mustard', 'dip'],
        'packaging': ['box', 'wrapper', 'pouch', 'bag', 'cup', 'tray', 'napkin'],
        'cleaning': ['chemical', 'cleaner', 'wipe', 'duster', 'sanitizer', 'baccide'],
        'label': ['label'],
        'ingredient': ['masala', 'cheese', 'lettuce', 'onion', 'oil', 'honey'],
        'frozen': ['frozen', 'fries', 'ice cream', 'icecream'],
    }

    def parse(self, df: pd.DataFrame) -> ParseResult:
        """Parse rate list data."""
        result = ParseResult(success=True)
        result.metadata = {
            'year': self.year,
            'month': self.month,
            'sheet_type': 'rate_list',
            'store': self.store,
        }

        # Find data start (skip header row "RATE LIST")
        start_row = 0
        for idx, row in df.iterrows():
            first_cell = str(row.iloc[0]).lower() if pd.notna(row.iloc[0]) else ''
            if 'sno' in first_cell or first_cell.isdigit():
                start_row = idx
                break

        # Parse each row
        for idx in range(start_row, len(df)):
            row = df.iloc[idx]

            # Skip empty rows
            if pd.isna(row.iloc[0]) and pd.isna(row.iloc[1]):
                continue

            # Extract fields
            sno = self.clean_int(row.iloc[0])
            product = self.clean_string(row.iloc[1])
            uom_raw = self.clean_string(row.iloc[2])
            rate = self.clean_number(row.iloc[3])

            # Skip header row
            if product and product.lower() == 'product':
                continue

            # Skip rows without product name
            if not product:
                continue

            # Normalize UOM
            uom = self._normalize_uom(uom_raw)

            # Determine category
            category = self._determine_category(product)

            record = {
                'sno': sno,
                'product_name': product,
                'uom': uom,
                'uom_raw': uom_raw,
                'rate': rate,
                'category': category,
                'year': self.year,
                'month': self.month,
                'store': self.store,
                'effective_date': self.report_date.isoformat(),
            }
            result.data.append(record)

        result.metadata['record_count'] = len(result.data)
        return result

    def _normalize_uom(self, uom_raw: str) -> str:
        """Normalize unit of measure."""
        if not uom_raw:
            return 'unit'
        uom_lower = uom_raw.lower().strip()
        return self.UOM_MAP.get(uom_lower, uom_lower)

    def _determine_category(self, product_name: str) -> str:
        """Determine product category from name."""
        if not product_name:
            return 'other'
        name_lower = product_name.lower()
        for category, patterns in self.CATEGORY_PATTERNS.items():
            for pattern in patterns:
                if pattern in name_lower:
                    return category
        return 'other'
