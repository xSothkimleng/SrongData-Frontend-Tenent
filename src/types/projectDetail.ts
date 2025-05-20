// constants
export const PROJECT_DATA_COLLECTION_METHOD = {
  CAPI: 'capi',
  WEB: 'web',
};

export type DataCollectionSetting = {
  isRequiredNID: boolean;
  isAnonymous: boolean;
};

// Skip logic definition for questions
interface SkipLogic {
  answer: string;
  action: string;
  target: string;
}

// Filter definition for indicators
interface Filter {
  function: string;
  index: number;
  values: any[];
}

// For the indicators array
interface Indicator {
  description: string;
  filters: Filter[];
  label: string;
}

// Location details structure
interface LocationDetails {
  communes: null | string[];
  districts: null | string[];
  id: string;
  provinces: null | string[];
  villages: null | string[];
}

// Basic question structure
interface Question {
  created_at: string;
  data_type: string;
  id: string;
  is_required: boolean;
  label: string;
  options: string[];
  order: number;
  section: {
    id: string;
    title: string;
    description: string;
    order: number;
  };
  skip_logics: SkipLogic[] | null;
  type: string;
  updated_at: string;
}

// Section with questions
interface SectionWithQuestions {
  description: string;
  id: string;
  order: number;
  questions: Question[];
  title: string;
}

// User detail structure
interface UserDetail {
  created_at: string;
  dob: string;
  email: string;
  first_name: string;
  id: string;
  is_master: boolean;
  last_name: string;
  password: string;
  password_changed: boolean;
  phone_number: string;
  profile: string;
  roles: string[] | null;
  status: number;
  tenant_id: string;
  updated_at: string;
}

// Main project data interface
interface ProjectData {
  id: string;
  name: string;
  description: string;
  status: number;
  location_details: LocationDetails;
  project_location: LocationDetails;
  questions: Question[];
  sections_questions: SectionWithQuestions[] | null;
  indicators: Indicator[];
  users: string[];
  users_detail: UserDetail[];
  submitted_users: null | string[];
}
