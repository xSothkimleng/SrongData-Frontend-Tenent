// app/types/dataDesignForm.ts
export interface DataDesignForm {
  label: string;
  order: number;
  is_required: boolean;
  type: string;
  data_type: string;
  options: string[];
}

type QuestionDataType = 'string' | 'number' | 'array' | 'date' | 'time';
export interface QuestionType {
  type: 'text' | 'number' | 'decimal' | 'text_area' | 'multiple' | 'single' | 'dropdown' | 'date' | 'time';
  label: string;
  data_type: QuestionDataType;
}
