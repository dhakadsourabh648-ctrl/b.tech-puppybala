export const validatePuppyPayload = (req, res, next) => {
  const { name, breed, age, gender, price, description, images, availability, vaccinationStatus } = req.body;

  // Security & rule enforcement: Do NOT include vaccinationStatus
  if (vaccinationStatus !== undefined) {
    delete req.body.vaccinationStatus;
  }

  const errors = [];

  if (req.method === 'POST') {
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push('Puppy name is required');
    }
    if (!breed || typeof breed !== 'string' || !breed.trim()) {
      errors.push('Puppy breed is required');
    } else {
      req.body.breed = breed.trim();
    }
    if (!age || typeof age !== 'string' || !age.trim()) {
      errors.push('Puppy age is required (e.g. "50 Days", "2 Months")');
    }
    if (!gender || !['Male', 'Female'].includes(gender)) {
      errors.push('Puppy gender must be either "Male" or "Female"');
    }
    if (price === undefined || typeof price !== 'number' || price < 0) {
      errors.push('Price must be a valid non-negative number');
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      errors.push('Puppy description is required');
    }
    if (!images || !Array.isArray(images) || images.length === 0) {
      errors.push('At least one image URL is required in the images array');
    }
  }

  // Handle PUT or PATCH updates
  if (req.method === 'PUT' || req.method === 'PATCH') {
    if (breed !== undefined) {
      if (typeof breed !== 'string' || !breed.trim()) {
        errors.push('Puppy breed cannot be empty');
      } else {
        req.body.breed = breed.trim();
      }
    }
  }

  if (availability && !['Available', 'Sold'].includes(availability)) {
    errors.push('Availability must be either "Available" or "Sold"');
  }

  if (gender && !['Male', 'Female'].includes(gender)) {
    errors.push('Gender must be either "Male" or "Female"');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

export const validateAvailabilityPayload = (req, res, next) => {
  const { availability } = req.body;
  if (!availability || !['Available', 'Sold'].includes(availability)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid availability status. Allowed values: "Available", "Sold".',
    });
  }
  next();
};
