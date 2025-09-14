const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;

export const validateEmail = email => email && emailRegex.test(String(email).toLowerCase());
export const validatePhone = phone => phone && phoneRegex.test(phone);
export const validateRequired = value => value && value.trim() !== '';
export const validateMinLength = (value, min) => value && value.length >= min;

export const validateDate = (dateString) => {
  if (!dateString) return false;
  const selectedDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
};

export const validateTime = (timeString) => 
  timeString && (([hours] = timeString.split(':').map(Number)) => hours >= 9 && hours < 18)();

export const validateForm = (fields) => {
  const errors = {};
  let isValid = true;
  const validators = {
    required: { test: validateRequired, message: 'This field is required' },
    minLength: { test: (v, l) => validateMinLength(v, l), message: (_, l) => `Must be at least ${l} characters` },
    email: { test: validateEmail, message: 'Please enter a valid email' },
    phone: { test: validatePhone, message: 'Please enter a valid phone number' },
    date: { test: validateDate, message: 'Please select a future date' },
    time: { test: validateTime, message: 'Appointment time must be between 9 AM and 6 PM' }
  };

  Object.entries(fields).forEach(([field, { value, required, minLength, type }]) => {
    const fieldErrors = [];
    const addError = (validator) => {
      fieldErrors.push(typeof validator.message === 'function' ? validator.message(value, minLength) : validator.message);
      isValid = false;
    };

    if (required && !validators.required.test(value)) addError(validators.required);
    if (minLength && !validators.minLength.test(value, minLength)) addError(validators.minLength);
    if (type && validators[type] && value && !validators[type].test(value)) addError(validators[type]);
    
    if (fieldErrors.length) errors[field] = fieldErrors;
  });

  return { isValid, errors };
};
