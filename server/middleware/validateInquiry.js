// Sanitize helper to prevent script injection
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
};

export const validateInquiryPayload = (req, res, next) => {
  let { customerName, phone, city, puppyId, puppyName, breed, message } = req.body;

  const errors = [];

  // 1. Customer Name Validation
  customerName = sanitizeString(customerName);
  if (!customerName || customerName.length < 2) {
    errors.push('Customer name is required (minimum 2 characters)');
  }

  // 2. Phone Validation (Clean +91, spaces, dashes)
  if (typeof phone === 'string') {
    let cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    if (cleanPhone.startsWith('+91')) {
      cleanPhone = cleanPhone.substring(3);
    } else if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      cleanPhone = cleanPhone.substring(2);
    } else if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
      cleanPhone = cleanPhone.substring(1);
    }
    phone = cleanPhone;
  }

  const indianMobileRegex = /^[6-9]\d{9}$/;
  if (!phone || !indianMobileRegex.test(phone)) {
    errors.push('Please enter a valid 10-digit Indian mobile number (e.g. 9893012345)');
  }

  // 3. City Validation
  city = sanitizeString(city);
  if (!city) {
    errors.push('City is required');
  }

  // 4. Puppy Selection Validation
  puppyId = sanitizeString(puppyId);
  if (!puppyId) {
    errors.push('Please select a puppy for your enquiry');
  }

  puppyName = sanitizeString(puppyName) || 'Puppy';
  breed = sanitizeString(breed) || 'Standard';
  message = sanitizeString(message);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Enquiry validation failed',
      errors,
    });
  }

  // Set sanitized values back onto req.body
  req.body.customerName = customerName;
  req.body.phone = phone;
  req.body.city = city;
  req.body.puppyId = puppyId;
  req.body.puppyName = puppyName;
  req.body.breed = breed;
  req.body.message = message;

  next();
};

export const validateInquiryStatus = (req, res, next) => {
  const { status } = req.body;
  const allowedStatuses = ['New', 'Contacted', 'Follow-up', 'Closed'];

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid inquiry status. Allowed values: ${allowedStatuses.join(', ')}`,
    });
  }

  next();
};
