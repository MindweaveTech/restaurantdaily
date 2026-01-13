# Restaurant Daily - MVP Scope

## Vision
A restaurant management ERP SaaS built on Odoo CE, targeting QSR franchises and small restaurant chains in India.

## GTM Strategy
**"Connect your Google Drive. We migrate your spreadsheets. Start managing in minutes."**

### The Hook
- Restaurants already track in Excel/Google Sheets
- Migration is painful - they won't do it themselves
- We auto-import their existing data → instant value
- Then enable real-time tracking going forward

### Pilot Customer
- **GR Kitchens** (Burger Singh franchise)
- 49 monthly reports already in Google Drive
- Data from Sep 2021 - Nov 2025 (4+ years)
- Known sheet structure to build parsers

---

## Discovery Questions

### 1. Core Problem
What's the #1 pain point with current spreadsheet tracking?

- [ ] Manual data entry across multiple sheets
- [ ] No real-time visibility into daily operations
- [ ] Difficult to track inventory/food costs
- [ ] Payroll/attendance is error-prone
- [ ] P&L takes too long to generate
- [ ] Multi-outlet consolidation is painful
- [ ] Other: _______________

### 2. Target User (MVP)
Who is the primary user?

- [ ] Restaurant owner (you - GR Kitchens)
- [ ] Store manager (Indirapuram outlet)
- [ ] Accountant/bookkeeper
- [ ] Franchise operations team
- [ ] Other: _______________

### 3. Daily Workflow
What does a typical day look like?

```
Morning:
- [ ] Check yesterday's sales
- [ ] Review inventory levels
- [ ] Mark attendance

During Day:
- [ ] Record expenses/petty cash
- [ ] Track sales (POS/aggregators)
- [ ] Manage stock issues

End of Day:
- [ ] Close daily sales
- [ ] Update inventory counts
- [ ] Generate daily report

Monthly:
- [ ] Payroll processing
- [ ] P&L generation
- [ ] Inventory reconciliation
```

### 4. Current Pain Intensity (1-5)

| Area | Pain Level | Notes |
|------|------------|-------|
| Daily Sales Tracking | ? | |
| Inventory/Stock | ? | |
| Staff Attendance | ? | |
| Petty Cash/Expenses | ? | |
| Monthly P&L | ? | |
| Multi-outlet view | ? | |

---

## MVP Feature Matrix

### Must Have (P0) - Launch blocker
| Feature | Module | Complexity |
|---------|--------|------------|
| ? | ? | ? |

### Should Have (P1) - Within 1 month of launch
| Feature | Module | Complexity |
|---------|--------|------------|
| ? | ? | ? |

### Nice to Have (P2) - Future
| Feature | Module | Complexity |
|---------|--------|------------|
| ? | ? | ? |

---

## MVP Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ONBOARDING FLOW                          │
├─────────────────────────────────────────────────────────────┤
│  1. Connect Google Drive (OAuth or Service Account)         │
│  2. Auto-detect monthly report folders                      │
│  3. Parse sheets → Normalize data                           │
│  4. Import into Odoo models                                 │
│  5. Show dashboard with historical data                     │
│  6. Enable going-forward tracking                           │
└─────────────────────────────────────────────────────────────┘
```

## MVP Modules

### Module 0: Google Drive Sync (`rd_drive_sync`) ⭐ KEY DIFFERENTIATOR
- Connect restaurant's Google Drive
- Auto-detect report folder structure
- Sheet parser (configurable per restaurant format)
- Monthly sync / on-demand import
- **Already built**: GR Kitchens service account working

### Module 1: Daily Sales (`rd_sales`)
- Import from: `Sale report` sheet
- Sales by day, category, payment mode
- Monthly trends from historical data
- Comparison: This month vs last month vs last year

### Module 2: Staff & Payroll (`rd_staff`)
- Import from: `ATTENDANCE` sheet
- Employee master with bank details
- Attendance tracking (P/A/OFF/Leave)
- Auto salary calculation with OT
- Payroll summary

### Module 3: Expense Management (`rd_expenses`)
- Import from: `IMPREST`, `PCV` sheets
- Petty cash tracking
- Expense categorization
- Monthly expense reports

### Module 4: Inventory & Costing (`rd_inventory`)
- Import from: `Rate-List`, `GLASSY-INVENTORY` sheets
- Ingredient price master
- Stock levels (manual or imported)
- Food cost % calculation

### Module 5: P&L Dashboard (`rd_pnl`)
- Import from: `p&l`, `Balance with Activity` sheets
- Auto-generate P&L from sales - expenses
- Monthly/quarterly/yearly views
- Outlet comparison (future: multi-outlet)

---

## Sheet → Odoo Model Mapping

| Sheet | Odoo Model | Custom Fields |
|-------|------------|---------------|
| Rate-List | `product.template` | `is_ingredient`, `uom`, `cost_price` |
| ATTENDANCE | `hr.attendance` + `hr.employee` | `shift_type`, `ot_hours`, `salary_calc` |
| IMPREST | `account.move` (journal entry) | `imprest_type`, `approved_by` |
| Sale report | `pos.order` or custom | `sale_date`, `category`, `amount` |
| p&l | `account.report` or custom | Auto-calculated |
| PCV | `account.move.line` | `pcv_number`, `expense_category` |
| BSR | Dashboard view | Computed from other models |
| Inventory | `stock.quant` | `last_count_date` |

---

## Out of Scope for MVP

- [ ] Multi-tenant SaaS (start single-tenant for GR Kitchens)
- [ ] POS integration (Swiggy/Zomato API)
- [ ] Mobile app
- [ ] Automated inventory deduction from sales
- [ ] Recipe/BOM management
- [ ] Supplier purchase orders
- [ ] Advanced analytics/forecasting
- [ ] Other restaurant onboarding (manual for now)

---

## Success Metrics

**MVP is successful if:**
1. All 49 historical reports imported into Odoo
2. GR Kitchens can view 4 years of data in dashboards
3. New monthly reports auto-sync from Drive
4. Monthly P&L visible without manual calculation
5. Staff payroll calculated automatically from attendance

---

## Technical Stack

| Component | Technology |
|-----------|------------|
| ERP Core | Odoo 17 CE |
| Database | PostgreSQL |
| Deployment | Docker Compose |
| Domain | restaurantdaily.mindweave.tech |
| Drive Sync | Python + Google Drive API |
| Sheet Parsing | pandas + openpyxl |

---

## Development Phases

### Phase 1: Foundation (Current)
- [x] Google Drive service account setup
- [x] Drive API connection working
- [x] Can list and read sheets
- [ ] Set up Odoo instance at restaurant-daily.mindweave.tech
- [ ] Create custom module skeleton

### Phase 2: Data Import Pipeline
- [ ] Build sheet parsers for each sheet type
- [ ] Create Odoo models for restaurant data
- [ ] Import historical data (49 reports)
- [ ] Validate data integrity

### Phase 3: Core Modules
- [ ] rd_drive_sync - Drive connection UI in Odoo
- [ ] rd_sales - Sales dashboard
- [ ] rd_staff - Attendance & payroll
- [ ] rd_expenses - Petty cash tracking
- [ ] rd_inventory - Rate list & stock

### Phase 4: Dashboard & Reports
- [ ] P&L dashboard
- [ ] Monthly comparison views
- [ ] Export to Excel (familiar format)

### Phase 5: Going Forward
- [ ] Manual entry forms for daily ops
- [ ] Auto-sync new monthly reports
- [ ] Alerts & notifications

---

## Open Questions

1. How many outlets do you currently manage?
2. Timeline - when do you want this live?
3. Who will use it - you, store manager, accountant?
4. Should we keep existing odoo.mindweave.tech or new instance?

---

## Next Steps

1. [x] Define GTM and MVP scope
2. [ ] Set up restaurant-daily.mindweave.tech (new Odoo instance)
3. [ ] Create rd_* module skeleton
4. [ ] Build sheet parsers for GR Kitchens format
5. [ ] Import first month's data as proof of concept
6. [ ] Iterate based on what works
