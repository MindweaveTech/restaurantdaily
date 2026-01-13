"""
Base parser class for GR Kitchens sheets.
"""

import pandas as pd
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class ParseResult:
    """Result of parsing a sheet."""
    success: bool
    data: List[Dict[str, Any]] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dataframe(self) -> pd.DataFrame:
        """Convert parsed data to DataFrame."""
        return pd.DataFrame(self.data)


class BaseParser(ABC):
    """Base class for sheet parsers."""

    # Sheet name patterns to match (case-insensitive)
    SHEET_PATTERNS: List[str] = []

    def __init__(self, year: int, month: int, store: str = "Indirapuram"):
        self.year = year
        self.month = month
        self.store = store
        self.report_date = datetime(year, month, 1)

    @classmethod
    def matches_sheet(cls, sheet_name: str) -> bool:
        """Check if this parser handles the given sheet name."""
        name_lower = sheet_name.lower().strip()
        for pattern in cls.SHEET_PATTERNS:
            if pattern.lower() in name_lower:
                return True
        return False

    @abstractmethod
    def parse(self, df: pd.DataFrame) -> ParseResult:
        """Parse the dataframe and return structured data."""
        pass

    def clean_string(self, value: Any) -> Optional[str]:
        """Clean and normalize string values."""
        if pd.isna(value):
            return None
        s = str(value).strip()
        return s if s else None

    def clean_number(self, value: Any) -> Optional[float]:
        """Clean and normalize numeric values."""
        if pd.isna(value):
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None

    def clean_int(self, value: Any) -> Optional[int]:
        """Clean and normalize integer values."""
        num = self.clean_number(value)
        return int(num) if num is not None else None

    def find_header_row(self, df: pd.DataFrame, patterns: List[str]) -> int:
        """Find the row index containing header patterns."""
        for idx, row in df.iterrows():
            row_str = ' '.join(str(v).lower() for v in row.values if pd.notna(v))
            for pattern in patterns:
                if pattern.lower() in row_str:
                    return idx
        return 0
