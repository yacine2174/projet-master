import React, { forwardRef } from 'react';

interface InputProps {
  id?: string;
  name?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  className = '',
  icon,
  showPasswordToggle = false,
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${showPasswordToggle ? 'pr-10' : ''}`}
        />
        
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <span className="text-gray-400">🙈</span>
            ) : (
              <span className="text-gray-400">👁️</span>
            )}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
