import axios from 'axios';
import { ApiResponse, ApiSurveyData } from '@/types/survey';

export const fetchSurveyQuestionnaire = async (surveyId: string): Promise<ApiSurveyData> => {
  try {
    console.log('Fetching survey questionnaire for ID:', surveyId);
    const response = await axios.get<ApiResponse<ApiSurveyData>>('/api/configWeb', {
      params: { endpoint: `survey/get-questionnaire/${surveyId}` },
    });
    console.log('Received response:', response.data);
    console.log('Survey questionnaire response:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching survey questionnaire:', error);
    throw error;
  }
};
