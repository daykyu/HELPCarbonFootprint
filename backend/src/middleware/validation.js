// backend/src/middleware/validation.js
const validateProfile = (req, res, next) => {
  const { username, email, phone, reminderFrequency } = req.body;
  const errors = [];

  if (!username || username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Valid email is required');
  }

  if (!phone || !phone.match(/^\d{10,12}$/)) {
    errors.push('Valid phone number is required (10-12 digits)');
  }

  if (!reminderFrequency || !['daily', 'weekly', 'monthly'].includes(reminderFrequency)) {
    errors.push('Valid reminder frequency is required (daily, weekly, or monthly)');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = {
  validateProfile
};