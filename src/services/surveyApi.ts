import axios from "axios";
import { ApiResponse, ApiSurveyData, DataCollection } from "@/types/survey";
import { getCookie } from "@/utils/cookies";

export const fetchSurveyQuestionnaire = async (
  surveyId: string,
): Promise<ApiSurveyData> => {
  try {
    console.log("Fetching survey questionnaire for ID:", surveyId);

    const response = await axios.get<ApiResponse<ApiSurveyData>>(
      "/api/configWeb",
      {
        params: { endpoint: `survey/get-questionnaire/${surveyId}` },
      },
    );

    console.log("Received response:", response.data);
    console.log("Survey questionnaire response:", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching survey questionnaire:", error);
    throw error;
  }
};

export const submitSurveyResponse = async (
  data: DataCollection,
): Promise<any> => {
  try {
    console.log("Submitting survey response:", data);

    const response = await axios.post("/api/configWeb", {
      endpoint: "survey/submit-response",
      body: data,
    });

    console.log("Submission successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error submitting survey response:", error);
    throw error;
  }
};
