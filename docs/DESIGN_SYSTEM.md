# Restaurant Daily AI — Design System

## Design Philosophy

Restaurant Daily adopts PlacementPilot AI's premium dark theme design system, adapted for restaurant operations. The design prioritizes:

1. **Mobile-first** — Staff primarily use phones for check-in/out
2. **Clarity** — Critical data (hours, pay, attendance) must be instantly readable
3. **Speed** — Quick actions for time-sensitive operations
4. **Consistency** — Same design language as other Mindweave products

---

## Color Palette

### Primary Colors (Dark Theme)

Based on the Restaurant Daily logo (teal ring + orange center gradient):

```css
/* Background layers (from landing page) */
--background: #0a0a0a;        /* neutral-950 - Ultra dark */
--background-card: #171717;   /* neutral-900 - Elevated surfaces */
--background-hover: #262626;  /* neutral-800 - Interactive hover */

/* Primary accent - Orange (from logo center gradient) */
--primary: #F97316;           /* Orange-500 - Main brand color */
--primary-light: #FB923C;     /* Orange-400 - Lighter variant */
--primary-hover: #EA580C;     /* Orange-600 - Hover state */
--primary-dark: #7C2D12;      /* Orange-900 - Dark variant */
--primary-muted: rgba(249, 115, 22, 0.1);

/* Secondary accent - Teal (from logo outer ring) */
--accent: #2D6A6A;            /* Teal - Logo ring color */
--accent-light: #3D8A8A;      /* Teal light - Hover state */
--accent-muted: rgba(45, 106, 106, 0.1);

/* Status colors */
--success: #10B981;           /* Green - Checked In, On Time */
--warning: #F59E0B;           /* Amber - Late, Overtime */
--danger: #EF4444;            /* Red - Absent, Error */
--info: #06B6D4;              /* Cyan - Info, Neutral */

/* Text hierarchy */
--text-primary: #FFFFFF;
--text-secondary: #9CA3AF;
--text-muted: #6B7280;
--text-disabled: #4B5563;

/* Borders */
--border: rgba(59, 130, 246, 0.1);
--border-hover: rgba(59, 130, 246, 0.2);
--ring: #3B82F6;
```

### Chart Colors

```css
--chart-present: #10B981;     /* Green - Present/Working */
--chart-late: #F59E0B;        /* Amber - Late arrivals */
--chart-absent: #EF4444;      /* Red - Absent */
--chart-leave: #8B5CF6;       /* Purple - On Leave */
--chart-overtime: #3B82F6;    /* Blue - Overtime hours */
```

---

## Typography

### Font Family

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;
```

### Font Weights

- **300** Light — Subtle labels
- **400** Regular — Body text
- **500** Medium — UI labels, buttons
- **600** Semibold — Headings, emphasis
- **700** Bold — Large numbers, stats
- **800** Extrabold — Hero numbers

### Type Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero stat | 48px | 800 | 1 |
| Page title | 30px | 700 | 1.2 |
| Section heading | 20px | 600 | 1.4 |
| Card title | 16px | 600 | 1.5 |
| Body | 14px | 400 | 1.5 |
| Small/Caption | 12px | 500 | 1.4 |
| Micro | 10px | 500 | 1.2 |

---

## Border Radius

```css
--radius-sm: 4px;    /* Badges, small elements */
--radius: 6px;       /* Buttons, inputs */
--radius-md: 8px;    /* Cards */
--radius-lg: 12px;   /* Modals, large cards */
--radius-xl: 16px;   /* Hero sections */
--radius-full: 9999px; /* Avatars, pills */
```

---

## Shadows & Effects

### Glassmorphism

```css
.glass-card {
  background: rgba(10, 10, 26, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(59, 130, 246, 0.1);
}
```

### Glow Effects

```css
.glow-orange {
  box-shadow: 0 0 20px rgba(249, 115, 22, 0.3);
}

.glow-success {
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
}
```

---

## Navigation Structure

### Org Admin Sidebar

```
OVERVIEW
├── Dashboard

ATTENDANCE
├── Today
├── History
├── Calendar View

PAYROLL
├── Pay Summary
├── Salary Config
├── Reports

MANAGEMENT
├── Staff
├── Shifts
├── Settings
```

### Staff Mobile Nav (Bottom)

```
[Check In] [My Hours] [Profile]
```

---

## Component Specifications

### 1. Dashboard Shell

- Fixed left sidebar (280px, collapsible to 64px)
- Top header with profile dropdown
- Main content area with breadcrumb
- Mobile: Bottom navigation, hamburger menu

### 2. Stat Cards

```
┌─────────────────────────────────────┐
│  [icon]  Label                      │
│                                     │
│  42                          +12%   │
│  large number              change   │
└─────────────────────────────────────┘
```

### 3. Attendance List Item

```
┌─────────────────────────────────────────────────┐
│ [Avatar]  Name              In: 9:45 AM        │
│           Role              Out: —             │
│                                    [Working]   │
│           ━━━━━━━━━━━━━━━━━━━━━━ 6h 30m        │
└─────────────────────────────────────────────────┘
```

### 4. Check-In Card (Staff)

```
┌─────────────────────────────────────┐
│         ⏱️ WORKING                  │
│                                     │
│     6h 30m                          │
│     elapsed                         │
│                                     │
│  In: 9:45 AM    Expected: 10h      │
│                                     │
│  [━━━━━━━━━━━━━━━━━━━━━━━] 65%     │
│                                     │
│      [ CHECK OUT ]                  │
└─────────────────────────────────────┘
```

### 5. Pay Summary Card

```
┌─────────────────────────────────────┐
│  February 2026                      │
│                                     │
│  Base Pay        ₹14,000            │
│  Overtime        ₹ 2,340  (26h)     │
│  Leave Comp.     ₹   500  (1 day)   │
│  ──────────────────────────         │
│  Total           ₹16,840            │
└─────────────────────────────────────┘
```

---

## Animations

### Easing Curves

```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
```

### Transitions

```css
/* Default transition */
transition: all 150ms var(--ease-smooth);

/* Hover lift effect */
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Pulse animation for active check-in */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
}
```

---

## Responsive Breakpoints

```css
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
```

### Layout Behavior

| Breakpoint | Sidebar | Content | Nav |
|------------|---------|---------|-----|
| < 768px | Hidden | Full width | Bottom tabs |
| 768-1024px | Collapsed (64px) | Flex | Side |
| > 1024px | Expanded (280px) | Flex | Side |

---

## Accessibility

- **Contrast ratio**: Minimum 4.5:1 for text
- **Focus indicators**: 2px ring with --ring color
- **Touch targets**: Minimum 44x44px
- **Motion**: Respect `prefers-reduced-motion`

---

## Icons

Using **Lucide React** (same as PPAI):

| Context | Icons |
|---------|-------|
| Attendance | Clock, LogIn, LogOut, UserCheck, UserX |
| Payroll | DollarSign, Calculator, Receipt, Wallet |
| Staff | Users, UserPlus, UserCog, BadgeCheck |
| Navigation | LayoutDashboard, Calendar, FileText, Settings |
| Actions | Plus, Edit, Trash, Check, X, RefreshCw |

---

## File Structure

```
src/
├── app/
│   ├── globals.css          # Theme variables, animations
│   ├── (auth)/               # Login, forgot password
│   ├── (dashboard)/          # Admin dashboard pages
│   └── (staff)/              # Staff mobile pages
├── components/
│   ├── ui/                   # Shadcn/Radix primitives
│   ├── dashboard/
│   │   ├── shell.tsx         # Dashboard layout
│   │   ├── sidebar.tsx       # Navigation sidebar
│   │   └── header.tsx        # Top header
│   ├── attendance/
│   │   ├── check-in-card.tsx
│   │   ├── attendance-list.tsx
│   │   ├── attendance-calendar.tsx
│   │   └── daily-detail.tsx
│   ├── payroll/
│   │   ├── pay-summary.tsx
│   │   ├── salary-config.tsx
│   │   └── payslip.tsx
│   └── staff/
│       ├── staff-list.tsx
│       ├── staff-form.tsx
│       └── shift-calendar.tsx
└── lib/
    ├── utils.ts              # cn() helper
    └── constants.ts          # Pay rules, shift hours
```

---

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. Copy UI components from PPAI
2. Implement dark theme CSS
3. Create DashboardShell layout
4. Build navigation sidebar

### Phase 2: Attendance (Week 2)
1. Org Admin: Today's attendance view
2. Org Admin: Attendance history with filters
3. Org Admin: Calendar view
4. Staff: Check-in/out card (mobile)

### Phase 3: Payroll (Week 3)
1. Salary configuration (staff list with rates)
2. Pay summary calculator
3. Monthly payroll view
4. Export to Excel

### Phase 4: Polish (Week 4)
1. Animations and transitions
2. Mobile optimization
3. Error states and loading skeletons
4. Accessibility audit

---

*Design system aligned with PlacementPilot AI. Last updated: March 2026*
