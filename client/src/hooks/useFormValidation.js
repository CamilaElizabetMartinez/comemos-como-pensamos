import { useState, useCallback } from 'react';

const VALIDATORS = {
  required: (value) => !value || value.trim() === '' ? 'Este campo es obligatorio' : null,
  
  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? 'Introduce un email válido' : null;
  },
  
  minLength: (min) => (value) => {
    if (!value) return null;
    return value.length < min ? `Mínimo ${min} caracteres` : null;
  },
  
  maxLength: (max) => (value) => {
    if (!value) return null;
    return value.length > max ? `Máximo ${max} caracteres` : null;
  },
  
  password: (value) => {
    if (!value) return null;
    if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return null;
  },
  
  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
    return !phoneRegex.test(value) ? 'Introduce un teléfono válido' : null;
  },
};

const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    for (const rule of rules) {
      let validator;
      let errorMessage;

      if (typeof rule === 'string') {
        validator = VALIDATORS[rule];
      } else if (typeof rule === 'object') {
        const { type, value: ruleValue, message } = rule;
        validator = typeof VALIDATORS[type] === 'function' 
          ? VALIDATORS[type](ruleValue) 
          : VALIDATORS[type];
        errorMessage = message;
      }

      if (validator) {
        const error = validator(value);
        if (error) return errorMessage || error;
      }
    }
    return null;
  }, [validationRules]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((event) => {
    const { name, value } = event.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    return isValid;
  }, [values, validationRules, validateField]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': touched[name] && errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  }), [values, handleChange, handleBlur, touched, errors]);

  const getFieldState = useCallback((name) => ({
    error: touched[name] ? errors[name] : null,
    touched: touched[name],
    hasError: touched[name] && !!errors[name],
  }), [errors, touched]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    getFieldProps,
    getFieldState,
    setValues,
  };
};

export default useFormValidation;
export { VALIDATORS };
