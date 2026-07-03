export type FieldType = "text" | "dropdown" | "toggle" | "phone" | "number" | "long_text";

export interface FieldCondition {
  field: string;
  value: string | boolean | number;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[];
  condition?: FieldCondition;
  section?: string;
}

export interface TalkingScript {
  id: string;
  section: string;
  text: string;
  condition?: FieldCondition;
}

export interface FormSchema {
  id: string;
  version: number;
  name: string;
  fields: FormField[];
  scripts: TalkingScript[];
  is_active: boolean;
  published_at: string;
}
