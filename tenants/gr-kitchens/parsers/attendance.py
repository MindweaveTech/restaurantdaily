"""
Attendance Parser

Parses the ATTENDANCE sheet containing staff attendance and payroll data.
"""

import pandas as pd
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from .base import BaseParser, ParseResult
import re


class AttendanceParser(BaseParser):
    """Parser for ATTENDANCE sheet."""

    SHEET_PATTERNS = ['attendance']

    # Role codes and their base salaries (approximate)
    ROLE_MAP = {
        'rm': {'title': 'Restaurant Manager', 'base_salary': 32000},
        'sm': {'title': 'Shift Manager', 'base_salary': 20000},
        'tm': {'title': 'Team Member', 'base_salary': 14000},
        'mt': {'title': 'Management Trainee', 'base_salary': 16000},
    }

    # Attendance status codes
    STATUS_CODES = {
        'p': 'present',
        'a': 'absent',
        'ab': 'absent',
        'off': 'weekly_off',
        'leave': 'leave',
        'l': 'leave',
    }

    def parse(self, df: pd.DataFrame) -> ParseResult:
        """Parse attendance data."""
        result = ParseResult(success=True)
        result.metadata = {
            'year': self.year,
            'month': self.month,
            'sheet_type': 'attendance',
            'store': self.store,
        }

        # Find header row with column names
        header_patterns = ['store', 'names', 'contact']
        header_row = self.find_header_row(df, header_patterns)

        # Use first row as header if pattern found
        if header_row > 0:
            df.columns = df.iloc[header_row]
            df = df.iloc[header_row + 1:].reset_index(drop=True)

        # Identify column indices
        col_map = self._map_columns(df.columns)

        # Find date columns (typically after personal info columns)
        date_columns = self._find_date_columns(df.columns)

        employees = []
        attendance_records = []

        for idx, row in df.iterrows():
            # Skip empty rows
            name = self._get_value(row, col_map.get('names'))
            if not name or pd.isna(name):
                continue

            # Skip summary rows
            name_str = str(name).lower()
            if any(x in name_str for x in ['over time', 'off pending', 'total']):
                continue

            # Extract employee info
            employee = {
                'name': self.clean_string(name),
                'store': self._get_value(row, col_map.get('store')) or self.store,
                'phone': self._get_value(row, col_map.get('contact')),
                'bank_name': self._get_value(row, col_map.get('bank')),
                'account_no': self._get_value(row, col_map.get('account')),
                'ifsc': self._get_value(row, col_map.get('ifsc')),
                'pan': self._get_value(row, col_map.get('pan')),
                'aadhaar': self._get_value(row, col_map.get('aadhaar')),
                'father_name': self._get_value(row, col_map.get('father')),
                'dob': self._parse_date(self._get_value(row, col_map.get('dob'))),
                'role_code': self._get_value(row, col_map.get('role')),
                'join_date': self._parse_date(self._get_value(row, col_map.get('joining'))),
                'year': self.year,
                'month': self.month,
            }

            # Parse role
            role_code = str(employee['role_code']).lower() if employee['role_code'] else ''
            role_info = self.ROLE_MAP.get(role_code, {})
            employee['role_title'] = role_info.get('title', 'Staff')
            employee['base_salary'] = role_info.get('base_salary')

            # Extract salary info
            employee['present_days'] = self.clean_int(self._get_value(row, col_map.get('present')))
            employee['leave_days'] = self.clean_int(self._get_value(row, col_map.get('leave')))
            employee['weekly_off'] = self.clean_number(self._get_value(row, col_map.get('week_off')))
            employee['absent_days'] = self.clean_int(self._get_value(row, col_map.get('absent')))
            employee['total_days'] = self.clean_number(self._get_value(row, col_map.get('total_days')))
            employee['paid_salary'] = self.clean_number(self._get_value(row, col_map.get('paid_salary')))
            employee['calculated_salary'] = self.clean_number(self._get_value(row, col_map.get('total_salary')))
            employee['deductions'] = self.clean_number(self._get_value(row, col_map.get('deductions')))

            employees.append(employee)

            # Parse daily attendance
            for col_name, day in date_columns.items():
                status_raw = self._get_value(row, col_name)
                if status_raw is not None and not pd.isna(status_raw):
                    status = self._parse_status(status_raw)
                    if status:
                        attendance_records.append({
                            'employee_name': employee['name'],
                            'date': datetime(self.year, self.month, day).isoformat(),
                            'day': day,
                            'status': status,
                            'status_raw': str(status_raw),
                            'store': employee['store'],
                        })

        result.data = employees
        result.metadata['employee_count'] = len(employees)
        result.metadata['attendance_records'] = attendance_records

        return result

    def _map_columns(self, columns) -> Dict[str, str]:
        """Map column names to standard field names."""
        col_map = {}
        for col in columns:
            col_str = str(col).lower() if col else ''

            if 'store' in col_str:
                col_map['store'] = col
            elif 'name' in col_str and 'father' not in col_str and 'bank' not in col_str:
                col_map['names'] = col
            elif 'contact' in col_str or 'phone' in col_str:
                col_map['contact'] = col
            elif 'bank' in col_str and 'name' in col_str:
                col_map['bank'] = col
            elif 'a/c' in col_str or 'account' in col_str:
                col_map['account'] = col
            elif 'ifsc' in col_str:
                col_map['ifsc'] = col
            elif 'pan' in col_str:
                col_map['pan'] = col
            elif 'adhar' in col_str or 'aadhaar' in col_str:
                col_map['aadhaar'] = col
            elif 'father' in col_str:
                col_map['father'] = col
            elif 'd.o.b' in col_str or 'dob' in col_str:
                col_map['dob'] = col
            elif 'join' in col_str:
                col_map['joining'] = col
            elif 'present' in col_str:
                col_map['present'] = col
            elif 'leave' in col_str:
                col_map['leave'] = col
            elif 'week' in col_str and 'off' in col_str:
                col_map['week_off'] = col
            elif 'absent' in col_str:
                col_map['absent'] = col
            elif 'total' in col_str and 'day' in col_str:
                col_map['total_days'] = col
            elif 'paid' in col_str and 'salary' in col_str:
                col_map['paid_salary'] = col
            elif col_str in ['rm', 'sm', 'tm', 'mt'] or 'unnamed: 11' in col_str:
                col_map['role'] = col
            elif 'salary' in col_str and 'deduct' not in col_str:
                col_map['total_salary'] = col
            elif 'deduct' in col_str:
                col_map['deductions'] = col

        return col_map

    def _find_date_columns(self, columns) -> Dict[str, int]:
        """Find columns that represent days of the month."""
        date_cols = {}
        for col in columns:
            # Check for datetime columns
            if isinstance(col, datetime):
                if col.year == self.year and col.month == self.month:
                    date_cols[col] = col.day
            # Check for date strings
            elif isinstance(col, str):
                # Try to extract day number
                match = re.search(r'(\d{1,2})', str(col))
                if match:
                    day = int(match.group(1))
                    if 1 <= day <= 31:
                        date_cols[col] = day
        return date_cols

    def _get_value(self, row, col_name) -> Any:
        """Safely get value from row."""
        if col_name is None:
            return None
        try:
            return row[col_name]
        except (KeyError, TypeError):
            return None

    def _parse_date(self, value) -> Optional[str]:
        """Parse date value to ISO format."""
        if value is None or pd.isna(value):
            return None
        if isinstance(value, datetime):
            return value.date().isoformat()
        # Try to parse string date
        try:
            # Handle DD/MM/YYYY format
            if isinstance(value, str) and '/' in value:
                parts = value.split('/')
                if len(parts) == 3:
                    d, m, y = int(parts[0]), int(parts[1]), int(parts[2])
                    if y < 100:
                        y += 2000
                    return datetime(y, m, d).date().isoformat()
        except:
            pass
        return str(value)

    def _parse_status(self, value) -> Optional[str]:
        """Parse attendance status."""
        if value is None or pd.isna(value):
            return None
        val_str = str(value).lower().strip()
        return self.STATUS_CODES.get(val_str, None)
