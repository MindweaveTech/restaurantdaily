# GR Kitchens Data Schema

Analysis of Burger Singh monthly report structure based on 50 files (Sep 2021 - Nov 2025).

## Sheet Types Overview

| Sheet Name | Occurrence | Rows (typical) | Purpose |
|------------|------------|----------------|---------|
| Rate-List | 50/50 | ~140 | Ingredient/product pricing |
| ATTENDANCE | 50/50 | 6-22 | Staff attendance & payroll |
| Sale report | 50/50 | 130-300 | Daily sales by channel |
| PCV | 50/50 | 19-56 | Petty Cash Vouchers |
| BSR | 50/50 | 720-760 | Item-wise sales breakdown |
| p&l / P&L | ~40/50 | ~24 | Monthly P&L summary |
| Balance with Activity and Costs | ~35/50 | 210-1150 | Inventory tracking |
| GLASSY- INVENTORY | 50/50 | 0 (always empty) | Unused |

---

## 1. Rate-List Sheet

**Purpose**: Master list of ingredient/product costs for food cost calculation.

### Schema
```
Column 0: SNO (Serial Number)
Column 1: PRODUCT (Product/Ingredient Name)
Column 2: UOM (Unit of Measure - Pc, Kg, Lt, Can)
Column 3: Rate (Cost per unit in INR)
```

### Categories (from data)
- Beverages (Coke, Sprite, Cold Coffee, etc.)
- Patties (Aloo, Chicken, Mutton, Veg)
- Sauces (BBQ, Harissa, Makhani, Mayo, etc.)
- Packaging (Boxes, Wrappers, Bags, Cups)
- Cleaning (Chemicals, Wipes, Duster)
- Labels (Product stickers)

### Sample Data
| SNO | PRODUCT | UOM | Rate |
|-----|---------|-----|------|
| 1 | Coke pet bottle | Pc | 33 |
| 27 | Aloo Burger Patty | Pc | 16.36 |
| 54 | Eggless Mayo Sauce | Kg | 99.11 |

### Parser Notes
- Header row at index 0 contains "RATE LIST"
- Actual data starts at row 1
- ~133 products tracked
- Prices updated monthly

---

## 2. ATTENDANCE Sheet

**Purpose**: Staff attendance tracking and salary calculation.

### Schema
```
Core Columns:
- Store: Outlet name (e.g., "Indirapuram")
- Names: Employee name
- Contact details: Phone number
- Bank Name: Bank for salary deposit
- A/C No.: Bank account number
- IFSC CODE: Bank IFSC
- PAN NO.: PAN card
- ADHAR NO.: Aadhaar number
- Father's name: Father's name
- D.O.B: Date of birth
- [Role Code]: RM/SM/TM (Restaurant Manager/Shift Manager/Team Member)
- DATE OF JOINING: Employment start date

Daily Columns (1-31 based on month):
- Date columns: P (Present), A (Absent), OFF (Weekly off), Leave

Summary Columns:
- Present: Total present days
- Leave: Total leaves
- Week OFF: Total weekly offs
- ABSENT: Total absences
- Total Days: Days in month
- Paid salary: Base salary
- T.. Salary: Total calculated salary
- deducted salary: Deductions
- pending off+ over time: OT calculations
```

### Employee Roles
- **RM** - Restaurant Manager (~32,000/month)
- **SM** - Shift Manager (~20,000/month)
- **TM** - Team Member (~14,000/month)

### Sample Calculation
- Rishabh Gusain (RM): 28 days present, 2 OFF → ₹36,800 paid
- Deepak Kumar (SM): 26 days present, 4 OFF → ₹20,779 paid

### Parser Notes
- Column count varies (47-52) based on days in month
- Some rows contain overtime calculations (numeric values instead of P/A)
- Need to detect header row and data rows separately

---

## 3. Sale Report Sheet

**Purpose**: Daily sales breakdown by channel/platform.

### Schema Variations

**Format A (Early 2021)**:
```
- DATE: Date
- DAY: Day name
- NET SALE: Net sales amount
- DELIVERY SALE: Delivery channel sales
- DELIVERY ORDERS: Delivery order count
- DINE IN SALE: Dine-in sales
- DINE-IN ORDERS: Dine-in order count
- T/A SALE: Takeaway sales
- T/A ORDERS: Takeaway order count
- TOTAL ORDERS: Total order count
- GROSS SALE: Gross sales
- TOTAL BPO: Basket per order (average)
```

**Format B (2022+)**:
```
Columns vary by sales channel:
- Description: Item/category name
- Total: Total sales
- BS Blitz Zomato Campaign
- BS DineIn DotPe
- BS Takeaway DotPe
- Swiggy REGULAR
- Swiggy Minis
- Zomato
- Zomato Campaign
- Magicpin
```

### Sales Channels Tracked
- Zomato (Regular, Campaign, Blitz)
- Swiggy (Regular, Minis)
- DotPe (DineIn, Takeaway)
- Magicpin
- Direct (Takeaway, Dine-in)

### Parser Notes
- Format changed significantly over time
- Need to detect format based on column headers
- Some months have daily breakdown, others have category breakdown

---

## 4. PCV (Petty Cash Voucher) Sheet

**Purpose**: Track petty cash expenses.

### Schema
```
Header: "EXPENSE REPORT / PCV"

Columns (typical):
- Date
- PCV Number
- Description/Particulars
- Amount
- Category
- Approved By
- Remarks
```

### Expense Categories (from data)
- Staff expenses
- Repair & maintenance
- Cleaning supplies
- Miscellaneous
- Transportation
- Kitchen supplies

### Parser Notes
- Header row contains "EXPENSE REPORT / PCV"
- Column count varies (11-26)
- Data starts after header row
- Some columns are merged/unnamed

---

## 5. BSR (Burger Singh Report) Sheet

**Purpose**: Item-wise sales breakdown - which products sold how much.

### Schema
```
- Store name (e.g., "INDIRAPURAM")
- Product category
- Product name
- Quantity sold
- Sales amount
- Various breakdowns
```

### Content
- ~740 rows typically
- Detailed product-level sales
- Used for menu analysis and food cost calculation

### Parser Notes
- Complex structure with merged cells
- Need to identify actual data rows vs headers/totals

---

## 6. P&L (Profit & Loss) Sheet

**Purpose**: Monthly profit and loss summary.

### Schema
```
Row structure (typical 24 rows):
- Revenue section
  - Net Sales
  - Other Income
- Cost section
  - Food Cost
  - Labor Cost
  - Rent
  - Utilities
  - Other Expenses
- Profit calculations
  - Gross Profit
  - Operating Profit
  - Net Profit
```

### Sample Structure
| Category | Description | Amount |
|----------|-------------|--------|
| Revenue | Net Sales | 850000 |
| Cost | Food Cost | 280000 |
| Cost | Labor | 120000 |
| | Gross Profit | 450000 |

### Parser Notes
- Simple 3-column structure
- May have "P&L" or "p&l" sheet name (case varies)
- ~24 rows with financial summary

---

## 7. Balance with Activity and Costs Sheet

**Purpose**: Inventory tracking with opening/closing balances.

### Schema
```
Columns:
- Category: Product category
- Sub Category: Sub-category (in some versions)
- NAME: Product name
- MEASURING UNIT: UOM
- Opening Balance: Qty at start of month
- Opening Cost: Value at start
- Purchase/Inward: Qty received
- Purchase Cost: Value of purchases
- Transfer In: Internal transfers in
- Transfer Out: Internal transfers out
- Wastage: Waste qty
- Closing Balance: Qty at end of month
- Closing Cost: Value at end
```

### Parser Notes
- Row count varies significantly (210-1150)
- Column structure changed over time
- Links to Rate-List for pricing

---

## Data Quality Issues

1. **Inconsistent column names**: Some have spaces, some don't
2. **Date formats**: Mix of datetime objects and strings
3. **Empty sheets**: GLASSY-INVENTORY always empty
4. **Merged cells**: Causes "Unnamed" columns
5. **Format evolution**: Schema changed over 4 years

---

## Recommended Import Priority

1. **Rate-List** - Most consistent, master data
2. **ATTENDANCE** - Critical for payroll, well-structured
3. **P&L** - Simple structure, high value
4. **PCV** - Expense tracking
5. **Sale Report** - Complex but valuable
6. **BSR** - Detailed but complex
7. **Balance/Inventory** - Complex, variable structure

---

## Odoo Model Mapping

| Sheet | Odoo Model | Notes |
|-------|------------|-------|
| Rate-List | product.template | Create as ingredients |
| ATTENDANCE | hr.employee + hr.attendance | Custom fields for Indian payroll |
| Sale Report | pos.order or sale.order | May need custom model |
| PCV | account.move (journal entry) | Expense journal |
| P&L | account.report | Dashboard view |
| BSR | sale.report | Reporting only |
| Inventory | stock.quant | Monthly snapshots |
