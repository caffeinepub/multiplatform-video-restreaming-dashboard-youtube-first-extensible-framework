import type { PlatformAdapter, PlatformFieldValue, ValidationResult } from './types';

export function validatePlatformFields(
  adapter: PlatformAdapter,
  values: Record<string, PlatformFieldValue>
): ValidationResult {
  const errors: ValidationResult = {};

  for (const field of adapter.fields) {
    const value = values[field.id];

    // Check required fields
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors[field.id] = `${field.label} is required`;
      continue;
    }

    // Type-specific validation
    if (value) {
      if (field.type === 'text' && typeof value === 'string') {
        // URL validation for ingest URLs
        if (field.id === 'ingestUrl') {
          try {
            new URL(value);
          } catch {
            errors[field.id] = 'Please enter a valid URL';
          }
        }
      }

      if (field.type === 'number' && typeof value === 'number') {
        if (value < 0) {
          errors[field.id] = `${field.label} must be a positive number`;
        }
      }
    }
  }

  return errors;
}
