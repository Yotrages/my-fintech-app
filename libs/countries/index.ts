// Dynamic countries list using ISO 3166-1
// This integrates with libphonenumber-js for phone validation
import { getCountries, getCountryCallingCode, isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

export interface Country {
  name: string;
  code: string;
  currency: string;
  flag: string;
  callingCode: string;
}

// Currency symbols mapping
const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
  NGN: '₦',
  KES: 'KSh',
  GHS: '₵',
  ZAR: 'R',
  CAD: 'C$',
  AUD: 'A$',
  BRL: 'R$',
  MXN: '$',
  CNY: '¥',
};

// Country name mapping (ISO codes to full names)
const countryNames: Record<string, string> = {
  US: 'United States',
  NG: 'Nigeria',
  GB: 'United Kingdom',
  KE: 'Kenya',
  GH: 'Ghana',
  ZA: 'South Africa',
  CA: 'Canada',
  IN: 'India',
  AU: 'Australia',
  JP: 'Japan',
  DE: 'Germany',
  FR: 'France',
  BR: 'Brazil',
  MX: 'Mexico',
  CN: 'China',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  SE: 'Sweden',
  CH: 'Switzerland',
  SG: 'Singapore',
  MY: 'Malaysia',
  TH: 'Thailand',
  PH: 'Philippines',
  VN: 'Vietnam',
  ID: 'Indonesia',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  LK: 'Sri Lanka',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  QA: 'Qatar',
  KW: 'Kuwait',
  BH: 'Bahrain',
  OM: 'Oman',
  JO: 'Jordan',
  EG: 'Egypt',
  UG: 'Uganda',
  TZ: 'Tanzania',
  RW: 'Rwanda',
  ET: 'Ethiopia',
  SN: 'Senegal',
  CI: 'Ivory Coast',
  CM: 'Cameroon',
};

// Currency mapping by country
const countryCurrency: Record<string, string> = {
  US: 'USD',
  GB: 'GBP',
  JP: 'JPY',
  IN: 'INR',
  NG: 'NGN',
  KE: 'KES',
  GH: 'GHS',
  ZA: 'ZAR',
  CA: 'CAD',
  AU: 'AUD',
  BR: 'BRL',
  MX: 'MXN',
  CN: 'CNY',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  SE: 'EUR',
  CH: 'CHF',
  SG: 'SGD',
  MY: 'MYR',
  TH: 'THB',
  PH: 'PHP',
  VN: 'VND',
  ID: 'IDR',
  PK: 'PKR',
  BD: 'BDT',
  LK: 'LKR',
  AE: 'AED',
  SA: 'SAR',
  QA: 'QAR',
  KW: 'KWD',
  BH: 'BHD',
  OM: 'OMR',
  JO: 'JOD',
  EG: 'EGP',
  UG: 'UGX',
  TZ: 'TZS',
  RW: 'RWF',
  ET: 'ETB',
  SN: 'XOF',
  CI: 'XOF',
  CM: 'XAF',
};

// Flag emoji mapping
const countryFlags: Record<string, string> = {
  US: '🇺🇸',
  GB: '🇬🇧',
  JP: '🇯🇵',
  IN: '🇮🇳',
  NG: '🇳🇬',
  KE: '🇰🇪',
  GH: '🇬🇭',
  ZA: '🇿🇦',
  CA: '🇨🇦',
  AU: '🇦🇺',
  BR: '🇧🇷',
  MX: '🇲🇽',
  CN: '🇨🇳',
  DE: '🇩🇪',
  FR: '🇫🇷',
  IT: '🇮🇹',
  ES: '🇪🇸',
  NL: '🇳🇱',
  SE: '🇸🇪',
  CH: '🇨🇭',
  SG: '🇸🇬',
  MY: '🇲🇾',
  TH: '🇹🇭',
  PH: '🇵🇭',
  VN: '🇻🇳',
  ID: '🇮🇩',
  PK: '🇵🇰',
  BD: '🇧🇩',
  LK: '🇱🇰',
  AE: '🇦🇪',
  SA: '🇸🇦',
  QA: '🇶🇦',
  KW: '🇰🇼',
  BH: '🇧🇭',
  OM: '🇴🇲',
  JO: '🇯🇴',
  EG: '🇪🇬',
  UG: '🇺🇬',
  TZ: '🇹🇿',
  RW: '🇷🇼',
  ET: '🇪🇹',
  SN: '🇸🇳',
  CI: '🇨🇮',
  CM: '🇨🇲',
};

/**
 * Get all countries with their metadata
 * Uses libphonenumber-js as base, enriched with currency and flag data
 */
export function getAllCountries(): Country[] {
  const isoCountries = getCountries();
  
  const countries: Country[] = [];
  
  for (const code of isoCountries) {
    const name = countryNames[code];
    const currency = countryCurrency[code];
    
    // Skip countries without mapped data
    if (!name || !currency) continue;
    
    try {
      const callingCode = getCountryCallingCode(code as any);
      
      countries.push({
        code,
        name,
        currency,
        flag: countryFlags[code] || '🌍',
        callingCode: `+${callingCode}`,
      });
    } catch (e) {
      // Skip countries with invalid calling codes
      continue;
    }
  }

  return countries.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a specific country by code
 */
export function getCountryByCode(code: string): Country | null {
  const countries = getAllCountries();
  return countries.find(c => c.code === code) || null;
}

/**
 * Get currency symbol for a country
 */
export function getCurrencySymbol(code: string): string {
  const country = getCountryByCode(code);
  if (!country) return '💰';
  return currencySymbols[country.currency] || country.currency;
}

/**
 * Popular countries (for quick access)
 */
export function getPopularCountries(): Country[] {
  const codes = ['US', 'GB', 'NG', 'KE', 'GH', 'IN', 'SG', 'AU', 'CA'];
  const countries = getAllCountries();
  return codes
    .map(code => countries.find(c => c.code === code))
    .filter((country): country is Country => country !== null);
}

/**
 * Search countries by name
 */
export function searchCountries(query: string): Country[] {
  const countries = getAllCountries();
  const lowerQuery = query.toLowerCase();
  return countries.filter(
    c => c.name.toLowerCase().includes(lowerQuery) ||
         c.code.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get countries by currency
 */
export function getCountriesByCurrency(currency: string): Country[] {
  const countries = getAllCountries();
  return countries.filter(c => c.currency === currency);
}

/**
 * Validate phone number for a specific country
 * @param phoneNumber - Phone number to validate (with or without +)
 * @param countryCode - ISO country code (e.g., 'NG', 'KE', 'US')
 * @returns Object with validation result and error message if invalid
 */
export function validatePhoneNumber(phoneNumber: string, countryCode: string): { isValid: boolean; error?: string; formattedNumber?: string } {
  try {
    // Remove spaces and hyphens
    const cleaned = phoneNumber.trim().replace(/[\s\-()]/g, '');
    
    // Check if phone number is empty
    if (!cleaned) {
      return { isValid: false, error: 'Phone number is required' };
    }
    
    // Check minimum length (international format)
    if (cleaned.length < 7) {
      return { isValid: false, error: 'Phone number is too short' };
    }
    
    // Check maximum length
    if (cleaned.length > 15) {
      return { isValid: false, error: 'Phone number is too long' };
    }
    
    // Use libphonenumber-js for validation
    try {
      const parsed = parsePhoneNumber(cleaned, countryCode as any);
      
      if (!parsed) {
        return { isValid: false, error: 'Invalid phone number format for this country' };
      }
      
      if (!isValidPhoneNumber(cleaned, countryCode as any)) {
        return { isValid: false, error: 'Phone number is not valid for this country' };
      }
      
      return {
        isValid: true,
        formattedNumber: parsed.format('INTERNATIONAL'),
      };
    } catch (e) {
      return { isValid: false, error: 'Invalid phone number format' };
    }
  } catch (e) {
    return { isValid: false, error: 'Error validating phone number' };
  }
}

/**
 * Detect country from phone number
 * @param phoneNumber - Phone number to check
 * @returns Country code if detected, null otherwise
 */
export function detectCountryFromPhone(phoneNumber: string): string | null {
  try {
    const cleaned = phoneNumber.trim().replace(/[\s\-()]/g, '');
    
    if (!cleaned) return null;
    
    const parsed = parsePhoneNumber(cleaned);
    
    if (!parsed) return null;
    
    return parsed.country || null;
  } catch (e) {
    return null;
  }
}

/**
 * Check if phone number matches a specific country's pattern
 * Useful for fraud detection
 * @param phoneNumber - Phone number to check
 * @param countryCode - Expected country code
 * @returns true if phone belongs to the country, false otherwise
 */
export function isPhoneNumberFromCountry(phoneNumber: string, countryCode: string): boolean {
  try {
    const cleaned = phoneNumber.trim().replace(/[\s\-()]/g, '');
    const detectedCountry = detectCountryFromPhone(cleaned);
    return detectedCountry === countryCode;
  } catch (e) {
    return false;
  }
}

/**
 * Sanitize and normalize phone number for storage
 * Removes all formatting and special characters
 * @param phoneNumber - Phone number to sanitize
 * @returns Cleaned phone number (digits only)
 */
export function sanitizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.trim().replace(/\D/g, '');
}

/**
 * Format phone number for display
 * @param phoneNumber - Phone number to format
 * @param countryCode - ISO country code
 * @returns Formatted phone number or original if formatting fails
 */
export function formatPhoneNumber(phoneNumber: string, countryCode: string): string {
  try {
    const cleaned = phoneNumber.trim().replace(/[\s\-()]/g, '');
    const parsed = parsePhoneNumber(cleaned, countryCode as any);
    
    if (!parsed) return phoneNumber;
    
    return parsed.format('NATIONAL');
  } catch (e) {
    return phoneNumber;
  }
}
