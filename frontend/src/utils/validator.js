// src/utils/validators.js
export const validateForm = (formData) => {
  const errors = [];
  
  if (!validateRequired(formData.username)) {
    errors.push('Username is required');
  }
  
  if (!validateEmail(formData.email)) {
    errors.push('Valid email is required');
  }
  
  if (!validatePhone(formData.phone)) {
    errors.push('Valid phone number (10-12 digits) is required');
  }
  
  if (!['daily', 'weekly', 'monthly'].includes(formData.reminderFrequency)) {
    errors.push('Valid reminder frequency is required');
  }
  
  return errors;
};