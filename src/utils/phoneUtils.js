/**
 * Utility functions for sanitizing and formatting phone numbers and WhatsApp links.
 */

/**
 * Sanitizes an Indian phone number to 12 digits (with 91 country code) for WhatsApp API / wa.me links.
 * E.g.:
 *  "9826543210" -> "919826543210"
 *  "+91 98265 43210" -> "919826543210"
 *  "09826543210" -> "919826543210"
 *  "919826543210" -> "919826543210"
 */
export function sanitizeWhatsAppPhone(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = digits.replace(/^0+/, '');
  }
  if (!digits.startsWith('91') && digits.length === 10) {
    digits = `91${digits}`;
  }
  return digits;
}

/**
 * Builds a direct wa.me URL with optional pre-filled text message.
 */
export function buildWhatsAppUrl(phone, message = '') {
  const cleaned = sanitizeWhatsAppPhone(phone);
  if (!cleaned) return '#';
  if (!message) {
    return `https://wa.me/${cleaned}`;
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

/**
 * Formats a phone number for display (e.g. +91 98265 43210).
 */
export function formatPhoneDisplay(phone) {
  if (!phone) return '';
  const cleaned = sanitizeWhatsAppPhone(phone);
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    const num = cleaned.slice(2);
    return `+91 ${num.slice(0, 5)} ${num.slice(5)}`;
  }
  return phone;
}
