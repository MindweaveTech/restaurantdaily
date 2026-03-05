import XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data', '.sheets');

// Parse Jan 2026
const janWorkbook = XLSX.readFile(join(dataDir, 'Attendance Jan 2026.xlsx'));
console.log('=== Jan 2026 Sheets ===');
console.log(janWorkbook.SheetNames);

// Parse Feb 2026
const febWorkbook = XLSX.readFile(join(dataDir, 'Attendance Feb 2026.xlsx'));
console.log('\n=== Feb 2026 Sheets ===');
console.log(febWorkbook.SheetNames);

// Get Pay Summary data from Feb
const paySummarySheet = febWorkbook.Sheets['Pay Summary'];
if (paySummarySheet) {
  console.log('\n=== Feb 2026 Pay Summary ===');
  const payData = XLSX.utils.sheet_to_json(paySummarySheet, { header: 1 });
  payData.slice(0, 30).forEach((row, idx) => {
    if (row.length > 0) console.log('Row ' + (idx + 1) + ':', row);
  });
}

// Get Attendance data
const attendanceSheet = febWorkbook.Sheets['Attendance'];
if (attendanceSheet) {
  console.log('\n=== Feb 2026 Attendance (first 10 rows) ===');
  const attData = XLSX.utils.sheet_to_json(attendanceSheet, { header: 1 });
  attData.slice(0, 10).forEach((row, idx) => {
    console.log('Row ' + (idx + 1) + ':', row.slice(0, 10));
  });
}

// Export staff data for import
const staffData = {
  restaurant: {
    name: 'Burger Singh Indirapuram',
    address: 'GG-15, GC Grand Street, Windsor Rd, Vaibhav Khand, Indirapuram, Ghaziabad, UP 201301',
    phone: '+918826175074',
    gst_number: '09BENPR6281N1ZG',
    fssai_number: '12720052000784'
  },
  staff: [
    { name: 'Rishabh', role: 'Restaurant Manager', salary: 32000, shift_hours: 10, phone: '+919999000001' },
    { name: 'Deepak', role: 'Shift Manager', salary: 20240, shift_hours: 10, phone: '+919999000002' },
    { name: 'Abhishek', role: 'Team Member', salary: 14000, shift_hours: 10, phone: '+919999000003' },
    { name: 'Ajay', role: 'Team Member', salary: 14000, shift_hours: 10, phone: '+919999000004' },
    { name: 'Kanchan', role: 'Day Shift', salary: 19000, shift_hours: 9, phone: '+919999000005' },
    { name: 'Arun', role: 'Maintenance', salary: 17500, shift_hours: 10, phone: '+919999000006' }
  ]
};

// Save as JSON for import
writeFileSync(
  join(dataDir, 'staff-data.json'),
  JSON.stringify(staffData, null, 2)
);
console.log('\n=== Exported staff-data.json ===');
