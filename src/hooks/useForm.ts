import { useState, useCallback } from "react";

type FormErrors = Record<string, string>;
type ValidationRules<T> = Partial<{ [K in keyof T]: (value: T[K]) => string | null }>;

export function useForm<T extends Record<string, unknown>>(initialValues: T, validationRules?: ValidationRules<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setValues(prev => {
      // Handle nested objects with dot notation (e.g., "address.city")
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        return {
          ...prev,
          [parent]: {
            ...(typeof prev[parent] === 'object' && prev[parent] !== null ? prev[parent] : {}),
            [child]: value
          }
        };
      }
      
      return { ...prev, [name]: value };
    });
    
    setIsDirty(true);
    
    // Validate on change if rules exist
    if (validationRules && validationRules[name as keyof T]) {
      const key = name as keyof T;
      const castedValue = value as T[typeof key];
      const validationResult = validationRules[key]?.(castedValue);
      setErrors(prev => ({
        ...prev,
        [name]: validationResult
      }));
    }
  }, [validationRules]);
  
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate on blur if rules exist
    if (validationRules && validationRules[name as keyof T]) {
      const validationResult = validationRules[name as keyof T]!(values[name as keyof T]);
      setErrors(prev => ({
        ...prev,
        [name]: validationResult
      }));
    }
  }, [validationRules, values]);
  
  const validateAll = useCallback(() => {
    if (!validationRules) return true;
    
    const newErrors: FormErrors = {};
    let isValid = true;
    
    Object.keys(validationRules).forEach((key) => {
      const rule = validationRules[key as keyof T];
      if (rule) {
        const error = rule(values[key as keyof T]);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [validationRules, values]);
  
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
  }, [initialValues]);
  
  return {
    values,
    errors,
    touched,
    isDirty,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues
  };
}
