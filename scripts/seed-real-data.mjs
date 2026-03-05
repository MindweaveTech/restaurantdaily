import XLSX from 'xlsx';
import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data', '.sheets');

// Parse Feb 2026 workbook
const febWorkbook = XLSX.readFile(join(dataDir, 'Attendance Feb 2026.xlsx'));

// Extract Pay Summary
const paySummarySheet = febWorkbook.Sheets['Pay Summary'];
const payData = XLSX.utils.sheet_to_json(paySummarySheet, { header: 1 });

// Staff names from row 3
const staffNames = payData[2].slice(2, 8); // Rishabh, Deepak, Abhishek, Ajay, Kanchan, Arun

// Build staff payroll data
const staffPayroll = staffNames.map((name, i) => {
  const col = i + 2;
  return {
    name: name,
    role: getRole(name),
    monthlySalary: payData[3][col],
    shiftHours: payData[6][col],
    daysPresent: payData[9][col],
    paidOffs: payData[10][col],
    totalPaidDays: payData[11][col],
    daysAbsent: payData[12][col],
    daysLeave: payData[13][col],
    unusedPaidLeave: payData[16][col],
    basePay: Math.round(payData[18][col]),
    otHours: payData[19][col],
    otAmount: Math.round(payData[20][col]),
    leaveCompensation: Math.round(payData[21][col]),
    totalSalary: Math.round(payData[22][col])
  };
});

function getRole(name) {
  const roles = {
    'Rishabh': 'Restaurant Manager',
    'Deepak': 'Shift Manager',
    'Abhishek': 'Team Member',
    'Ajay': 'Team Member',
    'Kanchan': 'Day Shift',
    'Arun': 'Maintenance'
  };
  return roles[name] || 'Team Member';
}

// Extract Attendance data
const attendanceSheet = febWorkbook.Sheets['Attendance - Feb 2026'];
const attData = XLSX.utils.sheet_to_json(attendanceSheet, { header: 1 });

// Parse Daily Hours
const dailyHoursSheet = febWorkbook.Sheets['Daily Hours'];
const dailyData = XLSX.utils.sheet_to_json(dailyHoursSheet, { header: 1 });

// Build attendance records by day
const attendanceRecords = [];
const dateRow = dailyData[0]; // First row has dates

staffNames.forEach((staffName, staffIdx) => {
  const staffRow = dailyData.find(row => row[0] === staffName);
  if (!staffRow) return;

  // Iterate through days (columns 1-28 for Feb)
  for (let day = 1; day <= 28; day++) {
    const hours = staffRow[day];
    if (hours && hours > 0) {
      const date = new Date(2026, 1, day); // Feb 2026
      const checkInTime = new Date(date);
      checkInTime.setHours(10, 0, 0); // Assume 10 AM check-in

      const checkOutTime = new Date(date);
      const totalHours = parseFloat(hours) || 0;
      checkOutTime.setHours(10 + Math.floor(totalHours), (totalHours % 1) * 60, 0);

      const shiftHours = staffName === 'Kanchan' ? 9 : 10;
      const otHours = Math.max(0, totalHours - shiftHours);

      attendanceRecords.push({
        staffName,
        date: date.toISOString().split('T')[0],
        checkInTime: checkInTime.toISOString(),
        checkOutTime: checkOutTime.toISOString(),
        hoursWorked: totalHours,
        overtimeHours: otHours,
        status: 'checked_out'
      });
    }
  }
});

// Build final data structure
const seedData = {
  restaurant: {
    name: 'Burger Singh Indirapuram',
    address: 'GG-15, GC Grand Street, Windsor Rd, Vaibhav Khand, Indirapuram, Ghaziabad, UP 201301',
    phone: '+918826175074',
    gst_number: '09BENPR6281N1ZG',
    fssai_number: '12720052000784'
  },
  staff: staffPayroll.map((s, i) => ({
    ...s,
    phone: '+9199990000' + (i + 1).toString().padStart(2, '0'),
    status: 'active',
    joinDate: i < 4 ? '2025-01-01' : '2026-02-0' + (i + 2)
  })),
  payrollSummary: {
    month: 'February 2026',
    totalPayroll: staffPayroll.reduce((sum, s) => sum + s.totalSalary, 0),
    totalStaff: staffPayroll.length,
    totalOTHours: staffPayroll.reduce((sum, s) => sum + s.otHours, 0),
    totalOTAmount: staffPayroll.reduce((sum, s) => sum + s.otAmount, 0)
  },
  attendance: attendanceRecords
};

// Save seed data
writeFileSync(
  join(dataDir, 'seed-data.json'),
  JSON.stringify(seedData, null, 2)
);

console.log('=== Seed Data Generated ===');
console.log('Restaurant:', seedData.restaurant.name);
console.log('Staff count:', seedData.staff.length);
console.log('Attendance records:', seedData.attendance.length);
console.log('Total Payroll:', '₹' + seedData.payrollSummary.totalPayroll.toLocaleString('en-IN'));
console.log('\nStaff Details:');
seedData.staff.forEach(s => {
  console.log(`  ${s.name} (${s.role}): ₹${s.totalSalary.toLocaleString('en-IN')} | ${s.otHours}h OT`);
});
console.log('\nSaved to: data/.sheets/seed-data.json');
