interface QuestionFilter {
  label: string;
  type: string;
  data_type: string;
  index: number;
  values: any[];
  options: any[];
  project_id?: string;
  color?: string;
}

interface GroupQuestionFilter {
  project_id: string;
  project_name?: string;
  filters: QuestionFilter[];
}
