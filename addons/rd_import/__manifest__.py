{
    'name': 'Restaurant Daily - Import',
    'version': '17.0.1.0.0',
    'category': 'Restaurant',
    'summary': 'Import GR Kitchens data from JSON',
    'description': """
Restaurant Daily - Data Import
==============================

Import historical data from GR Kitchens JSON exports.

Models:
- rd.ingredient (Rate List)
- rd.employee (Staff)
- rd.attendance (Daily Attendance)
- rd.expense (PCV/Petty Cash)
- rd.daily.sales (Sales Data)
    """,
    'author': 'Mindweave Technologies',
    'website': 'https://restaurantdaily.mindweave.tech',
    'license': 'LGPL-3',
    'depends': ['base'],
    'data': [
        'security/ir.model.access.csv',
        'views/menu.xml',
        'views/ingredient_views.xml',
        'views/employee_views.xml',
        'views/expense_views.xml',
        'views/sales_views.xml',
        'views/hide_menus.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
