/**
 * Application Constants
 *
 * Centralized configuration for the Restaurant Daily app
 * All sensitive values are read from environment variables
 */

// Get superadmin phones from environment variable (comma-separated)
// Example: SUPERADMIN_PHONES="+919625670084,+911234567890"
function getSuperadminPhones(): string[] {
  const phones = process.env.SUPERADMIN_PHONES || '';
  if (!phones) return [];
  return phones.split(',').map(p => p.trim()).filter(Boolean);
}

// Check if a phone number is a superadmin
export function isSuperadminPhone(phone: string): boolean {
  const superadminPhones = getSuperadminPhones();
  if (superadminPhones.length === 0) {
    console.warn('⚠️ No SUPERADMIN_PHONES configured in environment');
    return false;
  }

  // Normalize the phone number for comparison
  const normalizedPhone = phone.replace(/\s+/g, '');
  return superadminPhones.some(adminPhone => {
    const normalizedAdmin = adminPhone.replace(/\s+/g, '');
    return normalizedPhone === normalizedAdmin ||
           normalizedPhone.endsWith(normalizedAdmin.slice(-10)) ||
           normalizedAdmin.endsWith(normalizedPhone.slice(-10));
  });
}

// Get demo phones from environment variable (comma-separated)
// Example: DEMO_PHONES="+918826175074"
function getDemoPhones(): string[] {
  const phones = process.env.DEMO_PHONES || '';
  if (!phones) return [];
  return phones.split(',').map(p => p.trim()).filter(Boolean);
}

export function isDemoPhone(phone: string): boolean {
  const demoPhones = getDemoPhones();
  if (demoPhones.length === 0) return false;

  const normalizedPhone = phone.replace(/\s+/g, '');
  return demoPhones.some(demoPhone => {
    const normalizedDemo = demoPhone.replace(/\s+/g, '');
    return normalizedPhone === normalizedDemo ||
           normalizedPhone.endsWith(normalizedDemo.slice(-10)) ||
           normalizedDemo.endsWith(normalizedPhone.slice(-10));
  });
}
