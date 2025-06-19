import { ApiSurveyData, TransformedSurvey, TransformedSection, ApiQuestion, AnswerState } from '@/types/survey';

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
        questions: section.questions.sort((a, b) => a.order - b.order), // Sort questions by order
      }),
    )
    .sort((a, b) => a.order - b.order); // Sort sections by order

  console.log('Transformed sections:', sections);

  return {
    id: apiData.project_id,
    title: apiData.project_name?.en || String(apiData.project_name) || 'Survey',
    description: apiData.project_desc?.en || String(apiData.project_desc) || '',
    sections,
  };
};

export const extractValuesFromAnswers = (answers: AnswerState): Record<string, string | number | number[]> => {
  const result: Record<string, string | number | number[]> = {};

  for (const [questionId, answer] of Object.entries(answers)) {
    result[questionId] = answer.value;
  }

  return result;
};
