/**
 * Form utilities for phone and email validation
 * Consolidated from duplicate code across popup and product components
 */

/**
 * Format phone number as user types (XXX-XXX-XXXX)
 * Strips non-digits and limits to 10 digits
 */
export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  const limited = digits.slice(0, 10);
  if (limited.length <= 3) return limited;
  if (limited.length <= 6) return `${limited.slice(0, 3)}-${limited.slice(3)}`;
  return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
}

/**
 * Validate phone number (must be exactly 10 digits)
 * Returns error message or null if valid
 */
export function validatePhone(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return null; // Empty is not an error (for optional fields)
  if (digits.length !== 10) return 'Whoops. Please enter a valid #';
  return null;
}

/**
 * Validate email with proper TLD
 * Returns error message or null if valid
 */
export function validateEmail(value: string): string | null {
  if (!value) return null; // Empty is not an error (for optional fields)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(value)) return 'Whoops. Please enter a valid email.';
  return null;
}

/**
 * Get raw digits from a formatted phone number
 */
export function getPhoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Check if a phone number is complete (10 digits)
 */
export function isPhoneComplete(value: string): boolean {
  return getPhoneDigits(value).length === 10;
}

/**
 * Check if an email is valid
 */
export function isEmailValid(value: string): boolean {
  return validateEmail(value) === null && value.length > 0;
}
