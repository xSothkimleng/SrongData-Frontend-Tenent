export interface OptionType {
  value: string;
  displaySectionIds: string[] | [];
}
export interface OptionLocalizationType {
  en: string;
  km: string;
}
interface skipLogic {
  answer: string; // option value
  action: string; // jump_to
  target: string; // section ID
}
export interface SectionType {
  order: number;
  title: string;
  description: string;
}
export interface DataDesignForm {
  order: number;
  label: string;
  is_required: boolean;
  type: string;
  data_type: string;
  options: string[];
  section: SectionType;
  skip_logics: skipLogic[] | null;
}
type QuestionDataType = 'string' | 'number' | 'array' | 'date' | 'time';
export interface QuestionType {
  type: 'text' | 'number' | 'decimal' | 'text_area' | 'multiple' | 'single' | 'dropdown' | 'date' | 'time';
  label: string;
  data_type: QuestionDataType;
}
