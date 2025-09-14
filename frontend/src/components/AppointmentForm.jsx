import React, { useState, useCallback } from 'react';
import { validateForm } from '../utils/validation';
import FormField from './FormField';

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  message: ''
};

const fieldValidations = {
  name: { required: true, minLength: 3 },
  email: { required: true, type: 'email' },
  phone: { required: true, type: 'phone' },
  date: { required: true, type: 'date' },
  time: { required: true, type: 'time' },
  message: { required: false }
};

const AppointmentForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const today = new Date().toISOString().split('T')[0];

  const handleChange = useCallback(({ target: { name, value } }) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (touched[field] || formData[field]) {
      const { errors: fieldErrors } = validateForm({
        [field]: { value: formData[field], ...fieldValidations[field] }
      });
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field] || [] }));
    }
  }, [formData, touched]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fieldsToValidate = Object.entries(fieldValidations).reduce((acc, [field, validation]) => ({
      ...acc,
      [field]: { value: formData[field], ...validation }
    }), {});

    const { isValid, errors: formErrors } = validateForm(fieldsToValidate);
    setErrors(formErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    if (isValid) onSubmit(formData);
  };

  const getFieldProps = (name) => ({
    name,
    value: formData[name],
    onChange: handleChange,
    onBlur: () => handleBlur(name),
    errors: touched[name] ? (errors[name] || []) : [],
    required: fieldValidations[name].required,
    ...(name === 'date' && { min: today }),
    ...(name === 'time' && { min: '09:00', max: '17:30', step: '1800' })
  });

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Book Appointment</h2>
      
      <FormField
        label="Full Name"
        placeholder="Enter your full name"
        {...getFieldProps('name')}
      />
      
      <FormField
        label="Email"
        type="email"
        placeholder="example@example.com"
        {...getFieldProps('email')}
      />
      
      <FormField
        label="Phone Number"
        type="tel"
        placeholder="+1 (555) 123-4567"
        {...getFieldProps('phone')}
      />
      
      <FormField
        label="Date"
        type="date"
        {...getFieldProps('date')}
      />
      
      <FormField
        label="Time"
        type="time"
        {...getFieldProps('time')}
      />
      
      <FormField
        label="Additional Notes (Optional)"
        as="textarea"
        rows="3"
        placeholder="Any additional information you'd like to share"
        className="resize-none"
        {...getFieldProps('message')}
      />
      
      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-150"
        >
          Confirm Booking
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;
