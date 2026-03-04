/**
 * GST Verification Service using GSTINCheck.co.in API
 * API Documentation: https://documenter.getpostman.com/view/66843/SzmfYxcN
 */

export interface GSTVerificationResult {
  success: boolean;
  verified: boolean;
  data?: {
    gstin: string;
    legalName: string;
    tradeName: string;
    status: 'Active' | 'Inactive' | 'Cancelled' | 'Suspended';
    registrationDate: string;
    businessType: string;
    address: {
      full: string;
      building: string;
      street: string;
      city: string;
      district: string;
      state: string;
      pincode: string;
    };
    natureOfBusiness: string[];
    stateJurisdiction: string;
    centralJurisdiction: string;
  };
  error?: string;
}

export interface GSTAPIResponse {
  flag: boolean;
  message: string;
  data: {
    gstin: string;
    lgnm: string; // Legal Name
    tradeNam: string; // Trade Name
    sts: string; // Status
    rgdt: string; // Registration Date
    ctb: string; // Constitution of Business
    nba: string[]; // Nature of Business Activities
    stj: string; // State Jurisdiction
    ctj: string; // Central Jurisdiction
    pradr: {
      adr: string; // Full Address
      addr: {
        bnm: string; // Building Name
        st: string; // Street
        loc: string; // Locality/City
        dst: string; // District
        stcd: string; // State
        pncd: string; // Pincode
        flno: string; // Floor Number
        bno: string; // Building Number
      };
    };
    errorMsg: string | null;
  };
}

/**
 * Verify GST number and fetch business details
 */
export async function verifyGST(gstin: string): Promise<GSTVerificationResult> {
  const apiKey = process.env.GSTINCHECK_API_KEY;

  if (!apiKey) {
    console.error('GSTINCHECK_API_KEY not configured');
    return {
      success: false,
      verified: false,
      error: 'GST verification service not configured',
    };
  }

  // Validate GSTIN format
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
  if (!gstinRegex.test(gstin.trim())) {
    return {
      success: false,
      verified: false,
      error: 'Invalid GSTIN format',
    };
  }

  try {
    const response = await fetch(
      `https://sheet.gstincheck.co.in/check/${apiKey}/${gstin.trim().toUpperCase()}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result: GSTAPIResponse = await response.json();

    if (!result.flag || !result.data) {
      return {
        success: true,
        verified: false,
        error: result.message || 'GSTIN not found',
      };
    }

    const data = result.data;

    // Check if GST is active
    const isActive = data.sts?.toLowerCase() === 'active';

    return {
      success: true,
      verified: isActive,
      data: {
        gstin: data.gstin,
        legalName: data.lgnm,
        tradeName: data.tradeNam,
        status: data.sts as 'Active' | 'Inactive' | 'Cancelled' | 'Suspended',
        registrationDate: data.rgdt,
        businessType: data.ctb,
        address: {
          full: data.pradr?.adr || '',
          building: data.pradr?.addr?.bnm || '',
          street: data.pradr?.addr?.st || '',
          city: data.pradr?.addr?.loc || '',
          district: data.pradr?.addr?.dst || '',
          state: data.pradr?.addr?.stcd || '',
          pincode: data.pradr?.addr?.pncd || '',
        },
        natureOfBusiness: data.nba || [],
        stateJurisdiction: data.stj,
        centralJurisdiction: data.ctj,
      },
      error: !isActive ? `GST status is ${data.sts}` : undefined,
    };
  } catch (error) {
    console.error('GST verification error:', error);
    return {
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Validate GSTIN format (client-side)
 */
export function validateGSTINFormat(gstin: string): { valid: boolean; error?: string } {
  if (!gstin || !gstin.trim()) {
    return { valid: false, error: 'GST number is required' };
  }

  const cleaned = gstin.trim().toUpperCase();

  if (cleaned.length !== 15) {
    return { valid: false, error: 'GST number must be 15 characters' };
  }

  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(cleaned)) {
    return { valid: false, error: 'Invalid GST number format' };
  }

  // Validate state code (01-38)
  const stateCode = parseInt(cleaned.substring(0, 2), 10);
  if (stateCode < 1 || stateCode > 38) {
    return { valid: false, error: 'Invalid state code in GST number' };
  }

  return { valid: true };
}
