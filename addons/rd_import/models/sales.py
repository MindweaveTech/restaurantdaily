from odoo import models, fields


class RdDailySales(models.Model):
    _name = 'rd.daily.sales'
    _description = 'Daily Sales Record'
    _order = 'date desc'

    date = fields.Date('Date', index=True)
    day_name = fields.Char('Day')
    store = fields.Char('Store', default='Indirapuram')
    year = fields.Integer('Year')
    month = fields.Integer('Month')

    # Sales by channel
    net_sales = fields.Float('Net Sales')
    gross_sales = fields.Float('Gross Sales')
    delivery_sales = fields.Float('Delivery Sales')
    delivery_orders = fields.Integer('Delivery Orders')
    dine_in_sales = fields.Float('Dine-In Sales')
    dine_in_orders = fields.Integer('Dine-In Orders')
    takeaway_sales = fields.Float('Takeaway Sales')
    takeaway_orders = fields.Integer('Takeaway Orders')
    total_orders = fields.Integer('Total Orders')

    # Metrics
    basket_per_order = fields.Float('Basket Per Order', digits=(10, 2))


class RdMonthlySales(models.Model):
    _name = 'rd.monthly.sales'
    _description = 'Monthly Sales Summary'
    _order = 'year desc, month desc'

    year = fields.Integer('Year', required=True)
    month = fields.Integer('Month', required=True)
    store = fields.Char('Store', default='Indirapuram')

    total_sales = fields.Float('Total Sales')
    total_orders = fields.Integer('Total Orders')
    avg_daily_sales = fields.Float('Avg Daily Sales')
    avg_basket = fields.Float('Avg Basket Size')

    # Channel breakdown
    delivery_pct = fields.Float('Delivery %')
    dine_in_pct = fields.Float('Dine-In %')
    takeaway_pct = fields.Float('Takeaway %')
