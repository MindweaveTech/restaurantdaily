/**
 * FSSAI License Number Validation
 *
 * FSSAI License format (14 digits):
 * - Digits 1-2: License type (10=Central, 11=State, 12=Registration, 21=Central, 22=State)
 * - Digits 3-4: State code
 * - Digits 5-6: Year of license
 * - Digits 7-14: Unique identifier
 */

export interface FSSAIValidationResult {
  valid: boolean;
  licenseType?: 'Central' | 'State' | 'Registration' | 'Unknown';
  state?: string;
  year?: string;
  error?: string;
}

// State codes for FSSAI
const STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman & Diu',
  '26': 'Dadra & Nagar Haveli',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh', // Also Telangana after 2014
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar',
  '36': 'Telangana',
  '37': 'Andhra Pradesh (new)',
  '38': 'Ladakh',
};

/**
 * License type prefixes
 * 10, 21 = Central License (turnover > 20 Cr)
 * 11, 22 = State License (turnover 12L - 20 Cr)
 * 12, 20 = Basic Registration (turnover < 12L)
 */
function getLicenseType(prefix: string): 'Central' | 'State' | 'Registration' | 'Unknown' {
  switch (prefix) {
    case '10':
    case '21':
      return 'Central';
    case '11':
    case '22':
      return 'State';
    case '12':
    case '20':
      return 'Registration';
    default:
      return 'Unknown';
  }
}

/**
 * Validate FSSAI license number and extract information
 */
export function validateFSSAI(licenseNumber: string): FSSAIValidationResult {
  // Remove any spaces or dashes
  const cleaned = licenseNumber.replace(/[\s-]/g, '');

  // Check if it's 14 digits
  if (!/^\d{14}$/.test(cleaned)) {
    return {
      valid: false,
      error: 'FSSAI license must be 14 digits',
    };
  }

  // Extract components
  const typePrefix = cleaned.substring(0, 2);
  const stateCode = cleaned.substring(2, 4);
  const yearCode = cleaned.substring(4, 6);

  // Validate license type
  const licenseType = getLicenseType(typePrefix);

  // Get state name
  const state = STATE_CODES[stateCode];

  // Parse year (assuming 20xx for codes 00-99)
  const yearNum = parseInt(yearCode, 10);
  const year = yearNum > 50 ? `19${yearCode}` : `20${yearCode}`;

  // Basic validation - check if state code is valid
  if (!state && !['00', '99'].includes(stateCode)) {
    // Some special codes might exist, so just warn
    console.warn(`Unknown FSSAI state code: ${stateCode}`);
  }

  return {
    valid: true,
    licenseType,
    state: state || `Unknown (${stateCode})`,
    year,
  };
}

/**
 * Format FSSAI number for display
 */
export function formatFSSAI(licenseNumber: string): string {
  const cleaned = licenseNumber.replace(/\D/g, '');
  if (cleaned.length !== 14) return licenseNumber;

  // Format as: XX-XX-XX-XXXXXXXX
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6)}`;
}

/**
 * Get FSSAI info summary
 */
export function getFSSAIInfo(licenseNumber: string): string {
  const result = validateFSSAI(licenseNumber);
  if (!result.valid) return result.error || 'Invalid';

  return `${result.licenseType} License | ${result.state} | Year: ${result.year}`;
}
