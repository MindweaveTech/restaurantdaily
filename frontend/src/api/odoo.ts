// Odoo API client with multi-tenant support

let currentDatabase: string = 'restaurantdaily';
let currentToken: string | null = null;
let uid: number | null = null;

// For development fallback when Keycloak is not configured
const DEV_USERNAME = 'admin';
const DEV_PASSWORD = 'admin';

interface JsonRpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data: { message: string };
  };
}

export function setTenant(database: string) {
  if (database !== currentDatabase) {
    currentDatabase = database;
    uid = null; // Reset auth when tenant changes
  }
}

export function setAccessToken(token: string | null) {
  currentToken = token;
  uid = null; // Reset auth when token changes
}

async function jsonRpc<T>(service: string, method: string, args: unknown[]): Promise<T> {
  const response = await fetch('/jsonrpc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {}),
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: { service, method, args },
      id: Date.now(),
    }),
  });

  const data: JsonRpcResponse<T> = await response.json();

  if (data.error) {
    throw new Error(data.error.data?.message || data.error.message);
  }

  return data.result as T;
}

export async function authenticate(): Promise<number> {
  if (uid) return uid;

  // In dev mode without token, use hardcoded credentials
  // In production, this would use the Keycloak token
  uid = await jsonRpc<number>('common', 'authenticate', [
    currentDatabase,
    DEV_USERNAME,
    DEV_PASSWORD,
    {},
  ]);

  if (!uid) {
    throw new Error('Authentication failed');
  }

  return uid;
}

export async function searchRead<T>(
  model: string,
  domain: unknown[][] = [],
  fields: string[] = [],
  options: { limit?: number; offset?: number; order?: string } = {}
): Promise<T[]> {
  const userId = await authenticate();

  return jsonRpc<T[]>('object', 'execute_kw', [
    currentDatabase,
    userId,
    DEV_PASSWORD,
    model,
    'search_read',
    [domain],
    { fields, ...options },
  ]);
}

// Sales API
export interface SalesRecord {
  id: number;
  date: string;
  day_name: string;
  store: string;
  net_sales: number;
  gross_sales: number;
  total_orders: number;
  delivery_sales: number;
  delivery_orders: number;
  dine_in_sales: number;
  dine_in_orders: number;
  takeaway_sales: number;
  takeaway_orders: number;
  basket_per_order: number;
}

export async function getSales(limit = 100, order = 'date desc'): Promise<SalesRecord[]> {
  return searchRead<SalesRecord>('rd.daily.sales', [], [], { limit, order });
}

// Expenses API
export interface ExpenseRecord {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  pcv_number: string;
  store: string;
  year: number;
  month: number;
}

export async function getExpenses(limit = 100, order = 'date desc'): Promise<ExpenseRecord[]> {
  return searchRead<ExpenseRecord>('rd.expense', [], [], { limit, order });
}

// Employees API
export interface EmployeeRecord {
  id: number;
  name: string;
  phone: string;
  store: string;
  role_code: string;
  base_salary: number;
  bank_name: string;
  account_no: string;
}

export async function getEmployees(): Promise<EmployeeRecord[]> {
  return searchRead<EmployeeRecord>('rd.employee', [], []);
}

// Attendance API
export interface AttendanceRecord {
  id: number;
  employee_id: [number, string];
  year: number;
  month: number;
  present_days: number;
  leave_days: number;
  weekly_off: number;
  absent_days: number;
  paid_salary: number;
}

export async function getAttendance(limit = 100): Promise<AttendanceRecord[]> {
  return searchRead<AttendanceRecord>('rd.attendance', [], [], { limit });
}

// Ingredients API
export interface IngredientRecord {
  id: number;
  name: string;
  category: string;
  uom: string;
}

export async function getIngredients(): Promise<IngredientRecord[]> {
  return searchRead<IngredientRecord>('rd.ingredient', [], []);
}
