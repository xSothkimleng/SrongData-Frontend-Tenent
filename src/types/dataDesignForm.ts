import { Locale } from "./projectDetail";

export interface OptionType {
  value: string;
  displaySectionIds: string[] | [];
}
export interface OptionLocalizationType {
  en: string;
  km: string;
}
export interface skipLogic {
  answer_index: number;
  action: string;
  target: number | null; //null in case action === 'submit_form'
}
export interface SectionType {
  order: number;
  title: Locale;
  description: Locale;
}

export interface DataDesignForm {
  order: number;
  label: { en: string; km: string };
  is_required: boolean;
  type: string;
  data_type: string;
  options: { en: string; km: string }[];
  section: SectionType;
  skip_logics: skipLogic[] | null;
}

type QuestionDataType = "string" | "number" | "array" | "date" | "time";
export interface QuestionType {
  type:
    | "text"
    | "number"
    | "decimal"
    | "text_area"
    | "multiple"
    | "single"
    | "dropdown"
    | "date"
    | "time";
  label: string;
  data_type: QuestionDataType;
}
