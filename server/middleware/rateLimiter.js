import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter for Public Adoption Enquiry Submission
 * Prevents automated form spamming & denial-of-service on public enquiry endpoints.
 */
export const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 inquiries per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many adoption enquiries submitted from this network. Please wait a few minutes before trying again or contact us directly via WhatsApp/Call.',
  },
});

/**
 * Rate Limiter for Admin Authentication
 * Protects against brute-force password guessing attacks on admin login.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. For security reasons, please wait 15 minutes before attempting to log in again.',
  },
});

/**
 * General API Limiter for Public Endpoints
 */
export const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // 300 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});
