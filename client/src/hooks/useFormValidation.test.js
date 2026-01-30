import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useFormValidation, { VALIDATORS } from './useFormValidation';

describe('VALIDATORS', () => {
  describe('required', () => {
    it('returns error for empty string', () => {
      expect(VALIDATORS.required('')).toBe('Este campo es obligatorio');
    });

    it('returns error for whitespace only', () => {
      expect(VALIDATORS.required('   ')).toBe('Este campo es obligatorio');
    });

    it('returns null for valid value', () => {
      expect(VALIDATORS.required('hello')).toBeNull();
    });
  });

  describe('email', () => {
    it('returns null for empty value', () => {
      expect(VALIDATORS.email('')).toBeNull();
    });

    it('returns error for invalid email', () => {
      expect(VALIDATORS.email('invalid')).toBe('Introduce un email válido');
      expect(VALIDATORS.email('invalid@')).toBe('Introduce un email válido');
      expect(VALIDATORS.email('@invalid.com')).toBe('Introduce un email válido');
    });

    it('returns null for valid email', () => {
      expect(VALIDATORS.email('user@example.com')).toBeNull();
      expect(VALIDATORS.email('user.name@example.co.uk')).toBeNull();
    });
  });

  describe('minLength', () => {
    it('returns error when value is too short', () => {
      const validator = VALIDATORS.minLength(5);
      expect(validator('abc')).toBe('Mínimo 5 caracteres');
    });

    it('returns null when value meets minimum', () => {
      const validator = VALIDATORS.minLength(5);
      expect(validator('abcde')).toBeNull();
      expect(validator('abcdef')).toBeNull();
    });
  });

  describe('maxLength', () => {
    it('returns error when value is too long', () => {
      const validator = VALIDATORS.maxLength(5);
      expect(validator('abcdef')).toBe('Máximo 5 caracteres');
    });

    it('returns null when value meets maximum', () => {
      const validator = VALIDATORS.maxLength(5);
      expect(validator('abcde')).toBeNull();
      expect(validator('abc')).toBeNull();
    });
  });

  describe('password', () => {
    it('returns error for short password', () => {
      expect(VALIDATORS.password('12345')).toBe('La contraseña debe tener al menos 6 caracteres');
    });

    it('returns null for valid password', () => {
      expect(VALIDATORS.password('123456')).toBeNull();
    });
  });

  describe('phone', () => {
    it('returns null for empty value', () => {
      expect(VALIDATORS.phone('')).toBeNull();
    });

    it('returns error for invalid phone', () => {
      expect(VALIDATORS.phone('abc')).toBe('Introduce un teléfono válido');
    });

    it('returns null for valid phone formats', () => {
      expect(VALIDATORS.phone('123456789')).toBeNull();
      expect(VALIDATORS.phone('+34 612 345 678')).toBeNull();
      expect(VALIDATORS.phone('(123) 456-7890')).toBeNull();
    });
  });
});

describe('useFormValidation', () => {
  const initialValues = {
    email: '',
    password: '',
    name: '',
  };

  const validationRules = {
    email: ['required', 'email'],
    password: ['required', 'password'],
    name: ['required', { type: 'minLength', value: 2 }],
  };

  describe('initial state', () => {
    it('starts with initial values', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, validationRules)
      );

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
    });
  });

  describe('handleChange', () => {
    it('updates value on change', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, validationRules)
      );

      act(() => {
        result.current.handleChange({ 
          target: { name: 'email', value: 'test@example.com' } 
        });
      });

      expect(result.current.values.email).toBe('test@example.com');
    });

    it('validates field if already touched', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, validationRules)
      );

      // Touch the field first
      act(() => {
        result.current.handleBlur({ target: { name: 'email', value: '' } });
      });

      // Now change should trigger validation
      act(() => {
        result.current.handleChange({ 
          target: { name: 'email', value: 'invalid' } 
        });
      });

      expect(result.current.errors.email).toBe('Introduce un email válido');
    });
  });

  describe('handleBlur', () => {
    it('marks field as touched', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, validationRules)
      );

      act(() => {
        result.current.handleBlur({ target: { name: 'email', value: '' } });
      });

      expect(result.current.touched.email).toBe(true);
    });

    it('validates field on blur', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, validationRules)
      );

      act(() => {
        result.current.handleBlur({ target: { name: 'email', value: '' } });
      });

      expect(result.current.errors.email).toBe('Este campo es obligatorio');
    });
  });

  describe('validateAll', () => {
    it('returns false when validation fails', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, validationRules)
      );

      let isValid;
      act(() => {
        isValid = result.current.validateAll();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.email).toBe('Este campo es obligatorio');
      expect(result.current.errors.password).toBe('Este campo es obligatorio');
      expect(result.current.errors.name).toBe('Este campo es obligatorio');
    });

    it('returns true when validation passes', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, validationRules)
      );

      act(() => {
        result.current.handleChange({ target: { name: 'email', value: 'test@example.com' } });
        result.current.handleChange({ target: { name: 'password', value: '123456' } });
        result.current.handleChange({ target: { name: 'name', value: 'John' } });
      });

      let isValid;
      act(() => {
        isValid = result.current.validateAll();
      });

      expect(isValid).toBe(true);
      expect(result.current.errors).toEqual({});
    });
  });

  describe('reset', () => {
    it('resets to initial values', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, validationRules)
      );

      act(() => {
        result.current.handleChange({ target: { name: 'email', value: 'test@example.com' } });
        result.current.handleBlur({ target: { name: 'email', value: 'test@example.com' } });
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
    });
  });

  describe('getFieldProps', () => {
    it('returns correct props for field', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, validationRules)
      );

      const props = result.current.getFieldProps('email');

      expect(props.name).toBe('email');
      expect(props.value).toBe('');
      expect(typeof props.onChange).toBe('function');
      expect(typeof props.onBlur).toBe('function');
    });

    it('includes aria attributes when field has error', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, validationRules)
      );

      act(() => {
        result.current.handleBlur({ target: { name: 'email', value: '' } });
      });

      const props = result.current.getFieldProps('email');

      expect(props['aria-invalid']).toBe('true');
      expect(props['aria-describedby']).toBe('email-error');
    });
  });

  describe('getFieldState', () => {
    it('returns correct state for untouched field', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, validationRules)
      );

      const state = result.current.getFieldState('email');

      expect(state.error).toBeNull();
      expect(state.touched).toBeFalsy();
      expect(state.hasError).toBeFalsy();
    });

    it('returns correct state for touched field with error', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, validationRules)
      );

      act(() => {
        result.current.handleBlur({ target: { name: 'email', value: '' } });
      });

      const state = result.current.getFieldState('email');

      expect(state.error).toBe('Este campo es obligatorio');
      expect(state.touched).toBe(true);
      expect(state.hasError).toBe(true);
    });
  });
});
