#!/usr/bin/env python3
"""
Import GR Kitchens data into Odoo via XML-RPC.
"""

import json
import math
import xmlrpc.client
from pathlib import Path

# Odoo connection settings
URL = 'http://localhost:8010'
DB = 'restaurantdaily'
USERNAME = 'admin'
PASSWORD = 'admin'

DATA_DIR = Path('data')


def get_connection():
    """Get XML-RPC connection to Odoo."""
    common = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/common')
    uid = common.authenticate(DB, USERNAME, PASSWORD, {})
    if not uid:
        raise Exception("Authentication failed")

    models = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/object')
    return uid, models


def load_json(filename):
    """Load JSON data file."""
    with open(DATA_DIR / filename) as f:
        return json.load(f)


def import_ingredients(uid, models):
    """Import rate list data."""
    print("\nImporting ingredients...")
    data = load_json('rate_list.json')

    # Group by product name to create ingredients
    products = {}
    for record in data:
        name = record['product_name']
        if name not in products:
            products[name] = {
                'name': name,
                'category': record.get('category', 'other'),
                'uom': record.get('uom', 'unit'),
                'prices': []
            }
        products[name]['prices'].append({
            'year': record['year'],
            'month': record['month'],
            'rate': record.get('rate', 0),
            'store': record.get('store', 'Indirapuram'),
        })

    # Create ingredients
    created = 0
    for name, prod in products.items():
        # Check if exists
        existing = models.execute_kw(DB, uid, PASSWORD,
            'rd.ingredient', 'search', [[['name', '=', name]]])

        if existing:
            ingredient_id = existing[0]
        else:
            ingredient_id = models.execute_kw(DB, uid, PASSWORD,
                'rd.ingredient', 'create', [{
                    'name': prod['name'],
                    'category': prod['category'],
                    'uom': prod['uom'],
                }])
            created += 1

        # Add price history
        for price in prod['prices']:
            # Check if price exists
            existing_price = models.execute_kw(DB, uid, PASSWORD,
                'rd.ingredient.price', 'search', [[
                    ['ingredient_id', '=', ingredient_id],
                    ['year', '=', price['year']],
                    ['month', '=', price['month']],
                ]])
            if not existing_price:
                models.execute_kw(DB, uid, PASSWORD,
                    'rd.ingredient.price', 'create', [{
                        'ingredient_id': ingredient_id,
                        'year': price['year'],
                        'month': price['month'],
                        'rate': price['rate'],
                        'store': price['store'],
                    }])

    print(f"  Created {created} ingredients, {len(products)} total")


def safe_int_str(value):
    """Convert value to int string, handling NaN and None."""
    if value is None:
        return None
    try:
        if isinstance(value, float) and math.isnan(value):
            return None
        return str(int(value))
    except (ValueError, TypeError):
        return None


def clean_dict(d):
    """Remove None and NaN values from dict for XML-RPC."""
    result = {}
    for k, v in d.items():
        if v is None:
            continue
        if isinstance(v, float) and math.isnan(v):
            continue
        result[k] = v
    return result


def import_employees(uid, models):
    """Import attendance/employee data."""
    print("\nImporting employees...")
    data = load_json('attendance.json')

    # Group by employee name
    employees = {}
    for record in data:
        name = record.get('name')
        if not name:
            continue
        if name not in employees:
            employees[name] = {
                'name': name,
                'phone': safe_int_str(record.get('phone')),
                'store': record.get('store', 'Indirapuram'),
                'bank_name': record.get('bank_name'),
                'account_no': safe_int_str(record.get('account_no')),
                'ifsc': record.get('ifsc'),
                'pan': record.get('pan'),
                'aadhaar': safe_int_str(record.get('aadhaar')),
                'father_name': record.get('father_name'),
                'role_code': record.get('role_code'),
                'base_salary': record.get('base_salary'),
                'attendance': []
            }
        employees[name]['attendance'].append({
            'year': record.get('year'),
            'month': record.get('month'),
            'present_days': record.get('present_days'),
            'leave_days': record.get('leave_days'),
            'weekly_off': record.get('weekly_off'),
            'absent_days': record.get('absent_days'),
            'total_days': record.get('total_days'),
            'paid_salary': record.get('paid_salary'),
            'calculated_salary': record.get('calculated_salary'),
            'deductions': record.get('deductions'),
        })

    created = 0
    for name, emp in employees.items():
        # Check if exists
        existing = models.execute_kw(DB, uid, PASSWORD,
            'rd.employee', 'search', [[['name', '=', name]]])

        if existing:
            employee_id = existing[0]
        else:
            emp_data = {k: v for k, v in emp.items() if k != 'attendance' and v is not None}
            employee_id = models.execute_kw(DB, uid, PASSWORD,
                'rd.employee', 'create', [emp_data])
            created += 1

        # Add attendance records
        for att in emp['attendance']:
            if not att.get('year') or not att.get('month'):
                continue
            existing_att = models.execute_kw(DB, uid, PASSWORD,
                'rd.attendance', 'search', [[
                    ['employee_id', '=', employee_id],
                    ['year', '=', att['year']],
                    ['month', '=', att['month']],
                ]])
            if not existing_att:
                att_data = {k: v for k, v in att.items() if v is not None}
                att_data['employee_id'] = employee_id
                models.execute_kw(DB, uid, PASSWORD,
                    'rd.attendance', 'create', [att_data])

    print(f"  Created {created} employees, {len(employees)} total")


def import_expenses(uid, models):
    """Import PCV/expense data."""
    print("\nImporting expenses...")
    data = load_json('pcv.json')

    created = 0
    for record in data:
        desc = record.get('description')
        if not desc:
            continue

        expense_data = {
            'description': desc,
            'amount': record.get('amount', 0),
            'category': record.get('category', 'uncategorized'),
            'pcv_number': record.get('pcv_number'),
            'store': record.get('store', 'Indirapuram'),
            'year': record.get('year'),
            'month': record.get('month'),
        }

        # Remove None/NaN values (XML-RPC can't marshal them)
        expense_data = clean_dict(expense_data)

        models.execute_kw(DB, uid, PASSWORD,
            'rd.expense', 'create', [expense_data])
        created += 1

    print(f"  Created {created} expense records")


def import_sales(uid, models):
    """Import daily sales data."""
    print("\nImporting sales...")
    data = load_json('sales.json')

    created = 0
    for record in data:
        # Only import records with actual date
        if not record.get('date'):
            continue

        sales_data = {
            'date': record.get('date'),
            'day_name': record.get('day_name'),
            'store': record.get('store', 'Indirapuram'),
            'year': record.get('year'),
            'month': record.get('month'),
            'net_sales': record.get('net_sales'),
            'gross_sales': record.get('gross_sales'),
            'delivery_sales': record.get('delivery_sales'),
            'delivery_orders': record.get('delivery_orders'),
            'dine_in_sales': record.get('dine_in_sales'),
            'dine_in_orders': record.get('dine_in_orders'),
            'takeaway_sales': record.get('takeaway_sales'),
            'takeaway_orders': record.get('takeaway_orders'),
            'total_orders': record.get('total_orders'),
            'basket_per_order': record.get('basket_per_order'),
        }

        # Remove None values
        sales_data = clean_dict(sales_data)

        try:
            models.execute_kw(DB, uid, PASSWORD,
                'rd.daily.sales', 'create', [sales_data])
            created += 1
        except Exception as e:
            pass  # Skip invalid records

    print(f"  Created {created} sales records")


def main():
    print("="*60)
    print("GR Kitchens Data Import to Odoo")
    print("="*60)

    print(f"\nConnecting to {URL}...")
    try:
        uid, models = get_connection()
        print(f"Connected as user {uid}")
    except Exception as e:
        print(f"Error: {e}")
        print("\nMake sure:")
        print("1. Database 'restaurantdaily' exists")
        print("2. Module 'rd_import' is installed")
        print("3. Admin password is 'admin'")
        return

    import_ingredients(uid, models)
    import_employees(uid, models)
    import_expenses(uid, models)
    import_sales(uid, models)

    print("\n" + "="*60)
    print("Import complete!")
    print("="*60)


if __name__ == '__main__':
    main()
