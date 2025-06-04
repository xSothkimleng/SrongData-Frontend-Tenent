import { ApiSurveyData, TransformedSurvey, TransformedSection, TransformedQuestion } from '@/types/survey';

export const transformSurveyData = (apiData: ApiSurveyData | null): TransformedSurvey | null => {
  if (!apiData) return null;

  // Transform sections and sort by order
  const sections: TransformedSection[] = apiData.questionsSections
    .map(
      (section): TransformedSection => ({
        id: section.id,
        title: section.title,
        description: section.description,
        order: section.order,
        questions: section.questions
          .map(
            (question): TransformedQuestion => ({
              id: question.id,
              type: question.type,
              label: question.label?.en || String(question.label),
              required: question.is_required,
              order: question.order,
              options: question.options?.map(opt => opt.en || String(opt)) || [],
              skip_logics: question.skip_logics || [],
              data_type: question.data_type,
            }),
          )
          .sort((a, b) => a.order - b.order), // Sort questions by order
      }),
    )
    .sort((a, b) => a.order - b.order); // Sort sections by order

  return {
    id: apiData.project_id,
    title: apiData.project_name?.en || String(apiData.project_name) || 'Survey',
    description: apiData.project_desc?.en || String(apiData.project_desc) || '',
    sections,
  };
};
