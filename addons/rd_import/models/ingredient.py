from odoo import models, fields, api


class RdIngredient(models.Model):
    _name = 'rd.ingredient'
    _description = 'Restaurant Ingredient/Product'
    _order = 'name'

    name = fields.Char('Product Name', required=True, index=True)
    category = fields.Selection([
        ('beverage', 'Beverage'),
        ('patty', 'Patty'),
        ('sauce', 'Sauce'),
        ('packaging', 'Packaging'),
        ('cleaning', 'Cleaning'),
        ('label', 'Label'),
        ('ingredient', 'Ingredient'),
        ('frozen', 'Frozen'),
        ('other', 'Other'),
    ], string='Category', default='other')
    uom = fields.Char('Unit of Measure')

    # Price history through related model
    price_ids = fields.One2many('rd.ingredient.price', 'ingredient_id', string='Price History')
    current_price = fields.Float('Current Price', compute='_compute_current_price', store=True)

    @api.depends('price_ids', 'price_ids.rate')
    def _compute_current_price(self):
        for rec in self:
            prices = rec.price_ids.sorted(key=lambda p: (p.year, p.month), reverse=True)
            rec.current_price = prices[0].rate if prices else 0.0


class RdIngredientPrice(models.Model):
    _name = 'rd.ingredient.price'
    _description = 'Ingredient Price History'
    _order = 'year desc, month desc'

    ingredient_id = fields.Many2one('rd.ingredient', string='Ingredient', required=True, ondelete='cascade')
    year = fields.Integer('Year', required=True)
    month = fields.Integer('Month', required=True)
    rate = fields.Float('Rate', digits=(10, 2))
    store = fields.Char('Store', default='Indirapuram')

    _sql_constraints = [
        ('unique_price_period', 'unique(ingredient_id, year, month, store)',
         'Price already exists for this ingredient/period/store')
    ]
