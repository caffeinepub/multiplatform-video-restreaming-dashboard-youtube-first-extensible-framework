export type PlatformFieldType = 'text' | 'number' | 'select';

export type PlatformFieldValue = string | number | boolean;

export interface PlatformField {
  id: string;
  label: string;
  type: PlatformFieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  sensitive?: boolean;
  defaultValue?: PlatformFieldValue;
}

export interface PlatformAdapter {
  id: string;
  displayName: string;
  protocol: string;
  fields: PlatformField[];
  defaultCategories?: string[];
}

export interface ValidationResult {
  [fieldId: string]: string;
}
