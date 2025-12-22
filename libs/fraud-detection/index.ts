/**
 * Fraud Detection & Input Validation Module
 * Comprehensive checks to prevent fraudulent transactions
 */

import { validatePhoneNumber, isPhoneNumberFromCountry, detectCountryFromPhone } from '@/libs/countries';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate airtime transaction inputs
 * @param phoneNumber - Phone number to validate
 * @param amount - Transaction amount
 * @param country - Selected country code
 * @param provider - Selected provider
 * @returns Validation result with errors and warnings
 */
export function validateAirtimeTransaction(
  phoneNumber: string,
  amount: number,
  country: string,
  provider: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Validate phone number
  const phoneValidation = validatePhoneNumber(phoneNumber, country);
  if (!phoneValidation.isValid) {
    errors.push(phoneValidation.error || 'Invalid phone number');
  }

  // 2. Check if phone belongs to selected country
  if (phoneValidation.isValid && !isPhoneNumberFromCountry(phoneNumber, country)) {
    warnings.push(`Phone number appears to be from a different country than selected. This may result in delivery failure.`);
  }

  // 3. Validate amount
  if (amount <= 0) {
    errors.push('Amount must be greater than 0');
  }
  if (!Number.isFinite(amount)) {
    errors.push('Invalid amount entered');
  }
  if (amount > 1000000) {
    warnings.push('Very large transaction amount. Please verify this is intentional.');
  }

  // 4. Check for suspicious patterns
  if (amount % 100 === 0 && amount > 50000) {
    warnings.push('Round number transaction - verify amount is correct');
  }

  // 5. Validate inputs exist
  if (!phoneNumber?.trim()) {
    errors.push('Phone number is required');
  }
  if (!country?.trim()) {
    errors.push('Country selection is required');
  }
  if (!provider?.trim()) {
    errors.push('Provider selection is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate bill payment inputs
 * @param accountNumber - Bill account number
 * @param amount - Payment amount
 * @param provider - Bill provider
 * @param country - Selected country
 * @returns Validation result with errors and warnings
 */
export function validateBillPayment(
  accountNumber: string,
  amount: number,
  provider: string,
  country: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Validate account number
  if (!accountNumber?.trim()) {
    errors.push('Account number is required');
  }
  if (accountNumber.length < 3) {
    errors.push('Account number is too short');
  }
  if (accountNumber.length > 30) {
    errors.push('Account number is too long');
  }

  // 2. Check for suspicious account numbers
  if (/(\d)\1{4,}/.test(accountNumber)) {
    warnings.push('Account number contains repeated digits - verify this is correct');
  }
  if (/^0+$/.test(accountNumber.replace(/\D/g, ''))) {
    errors.push('Account number appears invalid');
  }

  // 3. Validate amount
  if (amount <= 0) {
    errors.push('Amount must be greater than 0');
  }
  if (!Number.isFinite(amount)) {
    errors.push('Invalid amount entered');
  }
  if (amount > 10000000) {
    warnings.push('Very large payment amount. Please verify before proceeding.');
  }

  // 4. Validate provider
  if (!provider?.trim()) {
    errors.push('Provider selection is required');
  }

  // 5. Validate country
  if (!country?.trim()) {
    errors.push('Country selection is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate cryptocurrency transaction
 * @param amount - Transaction amount
 * @param type - 'buy' or 'sell'
 * @param country - Selected country
 * @returns Validation result with errors and warnings
 */
export function validateCryptoTransaction(
  amount: number,
  type: 'buy' | 'sell',
  country: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Validate amount
  if (amount <= 0) {
    errors.push('Amount must be greater than 0');
  }
  if (!Number.isFinite(amount)) {
    errors.push('Invalid amount entered');
  }
  if (amount > 100000000) {
    errors.push('Amount exceeds maximum limit');
  }

  // 2. Check for suspicious amounts
  if (amount > 50000) {
    warnings.push(`Large ${type} transaction. Ensure you have sufficient funds and understand the risks.`);
  }

  // 3. Decimal precision
  if (amount.toString().split('.')[1]?.length > 8) {
    errors.push('Too many decimal places - maximum 8 decimal places allowed');
  }

  // 4. Validate country
  if (!country?.trim()) {
    errors.push('Country selection is required');
  }

  // 5. Transaction type
  if (!['buy', 'sell'].includes(type)) {
    errors.push('Invalid transaction type');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Rate limit check - prevent rapid successive transactions
 * @param lastTransactionTime - Timestamp of last transaction
 * @param minIntervalMs - Minimum milliseconds between transactions (default: 5000ms)
 * @returns true if allowed, false if too soon
 */
export function checkRateLimit(lastTransactionTime: number, minIntervalMs: number = 5000): boolean {
  if (!lastTransactionTime) return true;
  const now = Date.now();
  return now - lastTransactionTime >= minIntervalMs;
}

/**
 * Detect potentially fraudulent patterns
 * @param amount - Transaction amount
 * @param frequencyInMinutes - How often user is transacting (transactions per minute)
 * @returns Object with fraud risk assessment
 */
export function assessFraudRisk(
  amount: number,
  frequencyInMinutes: number
): { riskLevel: 'low' | 'medium' | 'high'; reasons: string[] } {
  const reasons: string[] = [];
  let riskScore = 0;

  // High transaction amount
  if (amount > 100000) {
    riskScore += 2;
    reasons.push('High transaction amount');
  }

  // Rapid transactions
  if (frequencyInMinutes > 5) {
    riskScore += 2;
    reasons.push('Multiple rapid transactions');
  }

  // Round amounts (common in fraud)
  if (amount % 1000 === 0 && amount > 10000) {
    riskScore += 1;
    reasons.push('Round amount transaction');
  }

  // Very small amounts (testing stolen cards)
  if (amount < 10 && frequencyInMinutes > 2) {
    riskScore += 1;
    reasons.push('Multiple small transactions');
  }

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (riskScore >= 3) riskLevel = 'high';
  else if (riskScore >= 2) riskLevel = 'medium';

  return { riskLevel, reasons };
}

/**
 * Sanitize user input to prevent injection attacks
 * @param input - User input to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    // Remove potentially dangerous characters
    .replace(/[<>\"'%;()&+]/g, '')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Limit length
    .substring(0, 255);
}

/**
 * Validate and sanitize all transaction fields
 * @param fields - Object with transaction fields
 * @returns Sanitized fields and validation result
 */
export function validateAndSanitizeInput(fields: Record<string, any>): {
  sanitized: Record<string, any>;
  validation: ValidationResult;
} {
  const sanitized: Record<string, any> = {};
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'number') {
      // Ensure number is finite and valid
      if (!Number.isFinite(value)) {
        errors.push(`Invalid ${key}`);
      } else {
        sanitized[key] = value;
      }
    } else {
      sanitized[key] = value;
    }
  }

  return {
    sanitized,
    validation: {
      isValid: errors.length === 0,
      errors,
      warnings,
    },
  };
}
