from odoo import models, fields, api


class RdEmployee(models.Model):
    _name = 'rd.employee'
    _description = 'Restaurant Employee'
    _order = 'name'

    name = fields.Char('Name', required=True, index=True)
    phone = fields.Char('Phone')
    store = fields.Char('Store', default='Indirapuram')

    # Bank Details
    bank_name = fields.Char('Bank Name')
    account_no = fields.Char('Account Number')
    ifsc = fields.Char('IFSC Code')

    # ID Documents
    pan = fields.Char('PAN Number')
    aadhaar = fields.Char('Aadhaar Number')

    # Personal
    father_name = fields.Char("Father's Name")
    dob = fields.Date('Date of Birth')
    join_date = fields.Date('Date of Joining')

    # Role
    role_code = fields.Selection([
        ('rm', 'Restaurant Manager'),
        ('sm', 'Shift Manager'),
        ('tm', 'Team Member'),
        ('mt', 'Management Trainee'),
    ], string='Role')
    base_salary = fields.Float('Base Salary')

    # Attendance records
    attendance_ids = fields.One2many('rd.attendance', 'employee_id', string='Attendance Records')


class RdAttendance(models.Model):
    _name = 'rd.attendance'
    _description = 'Monthly Attendance Summary'
    _order = 'year desc, month desc'

    employee_id = fields.Many2one('rd.employee', string='Employee', required=True, ondelete='cascade')
    year = fields.Integer('Year', required=True)
    month = fields.Integer('Month', required=True)
    store = fields.Char('Store')

    present_days = fields.Integer('Present Days')
    leave_days = fields.Integer('Leave Days')
    weekly_off = fields.Float('Weekly Off')
    absent_days = fields.Integer('Absent Days')
    total_days = fields.Integer('Total Days')

    paid_salary = fields.Float('Paid Salary')
    calculated_salary = fields.Float('Calculated Salary')
    deductions = fields.Float('Deductions')

    _sql_constraints = [
        ('unique_attendance', 'unique(employee_id, year, month)',
         'Attendance already exists for this employee/period')
    ]
