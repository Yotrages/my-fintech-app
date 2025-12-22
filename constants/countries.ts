export const SUPPORTED_COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', flag: '🇳🇬' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
  { code: 'KE', name: 'Kenya', currency: 'KES', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', flag: '🇬🇭' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', flag: '🇿🇦' },
  { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
  { code: 'IN', name: 'India', currency: 'INR', flag: '🇮🇳' },
];

export const getCurrencySymbol = (currency: string) => {
  const symbols: Record<string, string> = {
    USD: '$', NGN: '₦', GBP: '£', EUR: '€', KES: 'KSh',
    GHS: '₵', ZAR: 'R', CAD: 'C$', INR: '₹'
  };
  return symbols[currency] || currency;
};