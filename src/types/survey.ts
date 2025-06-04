export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface ApiLocation {
  id: string;
  code: number;
  name_km: string;
  name_en: string;
  is_active: boolean;
}

export interface ApiSkipLogic {
  answer_index: number;
  action: string;
  target: number;
}

export interface ApiQuestion {
  id: string;
  label: {
    en: string;
    km: string;
  };
  order: number;
  is_required: boolean;
  type: 'text' | 'decimal' | 'single' | 'multiple' | 'text_area';
  data_type: 'string' | 'number' | 'array';
  options: Array<{
    en: string;
    km: string;
  }>;
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

// Transformed types for frontend use
export interface TransformedQuestion {
  id: string;
  type: 'text' | 'decimal' | 'single' | 'multiple' | 'text_area';
  label: string;
  required: boolean;
  order: number;
  options: string[];
  skip_logics: ApiSkipLogic[];
  data_type: 'string' | 'number' | 'array';
}

export interface TransformedSection {
  id: string;
  title: string;
  description: string;
  order: number;
  questions: TransformedQuestion[];
}

export interface TransformedSurvey {
  id: string;
  title: string;
  description: string;
  sections: TransformedSection[];
}

export interface Answer {
  value: string | string[] | number;
  type: string;
}

export interface AnswerState {
  [questionId: string]: Answer;
}
