import React from 'react';

const Input = ({ type = 'text', className = '', ...props }) => (
  <input
    type={type}
    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${className}`}
    {...props}
  />
);

const FormField = ({
  label,
  name,
  type = 'text',
  value = '',
  onChange,
  onBlur,
  errors = [],
  placeholder = '',
  required = false,
  as: Component = Input,
  ...props
}) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-gray-700 text-sm font-bold mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Component
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={errors.length ? 'border-red-500' : ''}
      {...props}
    />
    {errors.length > 0 && (
      <div className="text-red-500 text-xs italic mt-1">
        {errors.map((error, index) => (
          <div key={index}>{error}</div>
        ))}
      </div>
    )}
  </div>
);

export default FormField;
