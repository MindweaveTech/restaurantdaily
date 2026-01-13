from odoo import models, fields


class RdExpense(models.Model):
    _name = 'rd.expense'
    _description = 'Petty Cash Voucher / Expense'
    _order = 'year desc, month desc, id desc'

    date = fields.Date('Date')
    pcv_number = fields.Char('PCV Number')
    description = fields.Text('Description')
    amount = fields.Float('Amount', digits=(10, 2))

    category = fields.Selection([
        ('staff', 'Staff'),
        ('repair', 'Repair & Maintenance'),
        ('cleaning', 'Cleaning'),
        ('transport', 'Transport'),
        ('utilities', 'Utilities'),
        ('supplies', 'Supplies'),
        ('kitchen', 'Kitchen'),
        ('packaging', 'Packaging'),
        ('misc', 'Miscellaneous'),
        ('uncategorized', 'Uncategorized'),
    ], string='Category', default='uncategorized')

    store = fields.Char('Store', default='Indirapuram')
    year = fields.Integer('Year')
    month = fields.Integer('Month')
