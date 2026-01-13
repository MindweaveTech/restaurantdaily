"""
P&L (Profit & Loss) Parser

Parses the P&L sheet containing monthly profit and loss summary.
"""

import pandas as pd
from typing import Dict, List, Any, Optional
from .base import BaseParser, ParseResult


class PnLParser(BaseParser):
    """Parser for P&L (Profit & Loss) sheet."""

    SHEET_PATTERNS = ['p&l', 'pnl', 'profit', 'loss']

    # Standard P&L line item patterns
    LINE_ITEM_MAP = {
        'net sales': 'revenue_net_sales',
        'gross sales': 'revenue_gross_sales',
        'sales': 'revenue_sales',
        'other income': 'revenue_other',
        'total revenue': 'revenue_total',
        'food cost': 'cost_food',
        'raw material': 'cost_raw_material',
        'packaging': 'cost_packaging',
        'labor': 'cost_labor',
        'labour': 'cost_labor',
        'salary': 'cost_salary',
        'wages': 'cost_wages',
        'rent': 'cost_rent',
        'electricity': 'cost_electricity',
        'utilities': 'cost_utilities',
        'marketing': 'cost_marketing',
        'royalty': 'cost_royalty',
        'aggregator': 'cost_aggregator',
        'commission': 'cost_commission',
        'depreciation': 'cost_depreciation',
        'other expense': 'cost_other',
        'total cost': 'cost_total',
        'total expense': 'cost_total',
        'gross profit': 'profit_gross',
        'operating profit': 'profit_operating',
        'ebitda': 'profit_ebitda',
        'net profit': 'profit_net',
        'profit before tax': 'profit_before_tax',
    }

    def parse(self, df: pd.DataFrame) -> ParseResult:
        """Parse P&L data."""
        result = ParseResult(success=True)
        result.metadata = {
            'year': self.year,
            'month': self.month,
            'sheet_type': 'pnl',
            'store': self.store,
        }

        records = []
        pnl_summary = {}

        for idx, row in df.iterrows():
            # Skip empty rows
            if row.isna().all():
                continue

            # Get line item and value
            line_item = None
            value = None

            # Try different column positions
            for col_idx in range(min(3, len(row))):
                cell = row.iloc[col_idx]
                if pd.notna(cell):
                    cell_str = str(cell).strip()
                    if cell_str and not cell_str.replace('.', '').replace('-', '').isdigit():
                        line_item = cell_str
                    elif cell_str:
                        try:
                            value = float(cell_str.replace(',', '').replace('₹', ''))
                        except:
                            pass

            # Also check if value is in a different column
            if line_item and value is None:
                for col_idx in range(1, min(4, len(row))):
                    cell = row.iloc[col_idx]
                    if pd.notna(cell):
                        try:
                            value = float(str(cell).replace(',', '').replace('₹', ''))
                            break
                        except:
                            pass

            if not line_item:
                continue

            # Map to standard name
            standard_name = self._map_line_item(line_item)

            record = {
                'line_item': line_item,
                'standard_name': standard_name,
                'value': value,
                'store': self.store,
                'year': self.year,
                'month': self.month,
            }
            records.append(record)

            # Add to summary
            if standard_name and value is not None:
                pnl_summary[standard_name] = value

        result.data = records
        result.metadata['record_count'] = len(records)
        result.metadata['pnl_summary'] = pnl_summary

        # Calculate key metrics if available
        if 'revenue_net_sales' in pnl_summary and 'cost_food' in pnl_summary:
            food_cost_pct = (pnl_summary['cost_food'] / pnl_summary['revenue_net_sales']) * 100
            result.metadata['food_cost_percentage'] = round(food_cost_pct, 2)

        return result

    def _map_line_item(self, line_item: str) -> Optional[str]:
        """Map line item to standard name."""
        if not line_item:
            return None
        item_lower = line_item.lower().strip()
        for pattern, standard in self.LINE_ITEM_MAP.items():
            if pattern in item_lower:
                return standard
        return None
