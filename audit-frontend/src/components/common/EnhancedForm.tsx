import React, { useState, useEffect } from 'react';
import { validateForm, ValidationSchema, ValidationResult } from '../../utils/formValidation';
import { useNotificationHelper } from '../../utils/notificationHelper';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea' | 'select' | 'file' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  helpText?: string;
}

export interface EnhancedFormProps {
  fields: FormField[];
  initialData?: any;
  validationSchema?: ValidationSchema;
  onSubmit: (data: any) => Promise<void> | void;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
  showCancel?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

const EnhancedForm: React.FC<EnhancedFormProps> = ({
  fields,
  initialData = {},
  validationSchema,
  onSubmit,
  submitLabel = 'Enregistrer',
  cancelLabel = 'Annuler',
  onCancel,
  loading = false,
  className = '',
  showCancel = true,
  autoSave = false,
  autoSaveDelay = 2000
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const { notifySuccess, notifyError } = useNotificationHelper();

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && validationSchema) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }

      const timer = setTimeout(() => {
        const validation = validateForm(formData, validationSchema);
        if (validation.isValid) {
          // Auto-save logic here
          console.log('Auto-saving form data:', formData);
        }
      }, autoSaveDelay);

      setAutoSaveTimer(timer);

      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [formData, autoSave, autoSaveDelay, validationSchema]);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate single field
    if (validationSchema && validationSchema[name]) {
      const fieldValidation = validateForm({ [name]: formData[name] }, { [name]: validationSchema[name] });
      if (!fieldValidation.isValid) {
        setErrors(prev => ({ ...prev, [name]: fieldValidation.errors[name] }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (validationSchema) {
        const validation: ValidationResult = validateForm(formData, validationSchema);
        if (!validation.isValid) {
          setErrors(validation.errors);
          setTouched(Object.keys(validation.errors).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
          notifyError('Erreur de validation', 'Veuillez corriger les erreurs dans le formulaire.');
          return;
        }
      }

      // Submit form
      await onSubmit(formData);
      notifySuccess('Succès', 'Le formulaire a été soumis avec succès.');
      
      // Reset form if needed
      setErrors({});
      setTouched({});
    } catch (error: any) {
      notifyError('Erreur', error.message || 'Une erreur s\'est produite lors de la soumission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const hasError = touched[field.name] && errors[field.name];
    const fieldClassName = `
      block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
      ${hasError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-600'}
      ${field.disabled ? 'bg-slate-800 cursor-not-allowed' : 'bg-slate-800'}
      ${field.className || ''}
    `;

    const commonProps = {
      id: field.name,
      name: field.name,
      value: formData[field.name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleChange(field.name, e.target.value),
      onBlur: () => handleBlur(field.name),
      placeholder: field.placeholder,
      disabled: field.disabled || loading,
      className: fieldClassName
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={field.rows || 3}
          />
        );

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Sélectionner...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            id={field.name}
            name={field.name}
            checked={formData[field.name] || false}
            onChange={(e) => handleChange(field.name, e.target.checked)}
            onBlur={() => handleBlur(field.name)}
            disabled={field.disabled || loading}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded"
          />
        );

      case 'file':
        return (
          <input
            type="file"
            id={field.name}
            name={field.name}
            onChange={(e) => handleChange(field.name, e.target.files)}
            onBlur={() => handleBlur(field.name)}
            disabled={field.disabled || loading}
            accept={field.accept}
            multiple={field.multiple}
            className={fieldClassName}
          />
        );

      default:
        return (
          <input
            {...commonProps}
            type={field.type}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {fields.map(field => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-slate-300 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {renderField(field)}
          
          {field.helpText && (
            <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
          )}
          
          {touched[field.name] && errors[field.name] && (
            <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
          )}
        </div>
      ))}

      <div className="flex justify-end space-x-4 pt-6">
        {showCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading || isSubmitting}
            className="px-4 py-2 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
        )}
        
        <button
          type="submit"
          disabled={loading || isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isSubmitting ? 'Enregistrement...' : submitLabel}
        </button>
      </div>

      {autoSave && (
        <div className="text-xs text-gray-500 text-center">
          💾 Sauvegarde automatique activée
        </div>
      )}
    </form>
  );
};

export default EnhancedForm;
