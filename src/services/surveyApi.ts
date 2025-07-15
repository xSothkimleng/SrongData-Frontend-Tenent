import axios from "axios";
import { ApiResponse, ApiSurveyData, DataCollection } from "@/types/survey";

export const fetchSurveyQuestionnaire = async (
  surveyId?: string,
  responseId?: string,
): Promise<ApiSurveyData> => {
  try {
    console.log("Fetching survey questionnaire for ID:", surveyId);
    let url = `survey/get-questionnaire/${surveyId}`;
    if (responseId) {
      url += `?withResponse=true&r_id=${responseId}`;
    }
    const response = await axios.get<ApiResponse<ApiSurveyData>>(
      "/api/configWeb",
      {
        params: { endpoint: url },
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

export const editResponse = async (
  responseId: string,
  data: DataCollection["responses"],
): Promise<any> => {
  try {
    console.log("edit response body: ", data);
    // return;
    const b = {
      responses: data,
    };

    const response = await axios.put("/api/configWeb", {
      endpoint: `responses/edit/${responseId}`,
      body: b,
    });

    console.log("Edit Response successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error edit response:", error);
    throw error;
  }
};
