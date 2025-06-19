import { Locale } from './projectDetail';

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface ApiVillage {
  id: string;
  code: number;
  name_km: string;
  name_en: string;
  is_active: boolean;
}

export interface ApiCommune {
  id: string;
  code: number;
  name_km: string;
  name_en: string;
  is_active: boolean;
  district_code: string; // foreign key link to district
  villages: ApiVillage[];
}

export interface ApiDistrict {
  id: string;
  code: number;
  name_km: string;
  name_en: string;
  is_active: boolean;
  province_code: string; // foreign key link to province
  communes: ApiCommune[];
}

export interface ApiLocation {
  id: string;
  code: number;
  name_km: string;
  name_en: string;
  is_active: boolean;
  districts: ApiDistrict[];
}

export interface ApiVillage extends ApiLocation {}

export interface ApiCommune extends ApiLocation {
  villages: ApiVillage[];
}

export interface ApiDistrict extends ApiLocation {
  communes: ApiCommune[];
}

export interface ApiProvince extends ApiLocation {
  districts: ApiDistrict[];
}

export interface ApiSkipLogic {
  answer_index: number;
  action: 'go_to' | 'submit_form' | string;
  target: number;
}

export interface ApiQuestion {
  id: string;
  label: Locale;
  order: number;
  is_required: boolean;
  type: 'text' | 'decimal' | 'single' | 'multiple' | 'text_area' | 'dropdown' | 'date' | 'time';
  data_type: 'string' | 'number' | 'array';
  options: Locale[];
  skip_logics: ApiSkipLogic[];
  section: {
    id: string;
    title: string;
    description: string;
    order: number;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiSection {
  id: string;
  title: string;
  description: string;
  order: number;
  questions: ApiQuestion[];
}

export interface ApiSurveyData {
  locales: Locale;
  location: ApiLocation[];
  project_desc: {
    en: string;
    km: string;
  };
  project_id: string;
  project_name: {
    en: string;
    km: string;
  };
  questions: ApiQuestion[];
  questionsSections: ApiSection[];
}

export interface DataCollection {
  date: string; // formatted as 'yyyy-MM-ddTHH:mm:ss'
  respondent: {
    name: string;
    email: string;
    user_id: string;
  };
  location: {
    lat: number;
    lon: number;
    province: string; // optional for extensibility
  };
  responses: Record<string, string | number | number[]>;
  survey_code: string;
}

// // Transformed types for frontend use
// export interface TransformedQuestion {
//   id: string;
//   type:
//     | "text"
//     | "decimal"
//     | "single"
//     | "multiple"
//     | "text_area"
//     | "dropdown"
//     | "date"
//     | "time";
//   label: Locale;
//   required: boolean;
//   order: number;
//   options: Locale[];
//   skip_logics: ApiSkipLogic[];
//   data_type: "string" | "number" | "array";
// }

export interface TransformedSection {
  id: string;
  title: string;
  description: string;
  order: number;
  questions: ApiQuestion[];
}

export interface TransformedSurvey {
  id: string;
  title: string;
  description: string;
  sections: TransformedSection[];
}

export interface Answer {
  value: string | number[] | number;
  type: string;
}

export interface AnswerState {
  [questionId: string]: Answer;
}
