import React, { useState, useEffect } from "react";
import { Box, Container, Paper, CircularProgress, Alert } from "@mui/material";
import SurveyHeader from "./SurveyHeader";
import SectionContent from "./SectionContent";
import NavigationControls from "./NavigationControls";
import ProgressIndicator from "./ProgressIndicator";
import {
  fetchSurveyQuestionnaire,
  submitSurveyResponse,
} from "@/services/surveyApi";
import {
  extractValuesFromAnswers,
  transformSurveyData,
} from "@/utils/surveyTransform";
import {
  TransformedSurvey,
  AnswerState,
  ApiSkipLogic,
  Answer,
  DataCollection,
  ApiSurveyData,
  ApiLocation,
} from "@/types/survey";
import { getCookie } from "@/utils/cookies";
import { useRouter } from "next/navigation";

interface SurveyContainerProps {
  surveyId?: string;
}

const SurveyContainer: React.FC<SurveyContainerProps> = ({
  surveyId = "683b04f07eadb773b81e5358",
}) => {
  const [survey, setSurvey] = useState<TransformedSurvey | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [navigationHistory, setNavigationHistory] = useState<number[]>([0]);

  const router = useRouter();
  // loading state
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const [proj, setProj] = useState<ApiSurveyData | null>(null);

  // Fetch survey data
  useEffect(() => {
    const loadSurvey = async (): Promise<void> => {
      try {
        console.log("fetching");
        setLoading(true);
        const apiData = await fetchSurveyQuestionnaire(surveyId);
        console.log("Fetched survey data:", apiData);
        const transformedData = transformSurveyData(apiData);
        setSurvey(transformedData);
        setProj(apiData);
        setError(null);
      } catch (err) {
        setError("Failed to load survey. Please try again.");
        console.error("Survey loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSurvey();
  }, [surveyId]);

  // Handle answer changes
  const handleAnswerChange = (
    questionId: string,
    value: Answer["value"],
    type: string,
  ): void => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { value, type },
    }));
  };

  // Skip logic implementation
  const getNextPageWithSkipLogic = (currentPageIndex: number): number => {
    if (!survey) return currentPageIndex + 1;

    const currentSection = survey.sections[currentPageIndex];
    let nextPage = currentPageIndex + 1;

    // Check each question in current section for skip logic
    currentSection.questions.forEach((question) => {
      const answer = answers[question.id];
      if (answer && question.skip_logics && question.skip_logics.length > 0) {
        // Process skip logics (use last matching one like Google Forms)
        let applicableSkipLogic: ApiSkipLogic | null = null;

        question.skip_logics.forEach((skipLogic) => {
          if (question.type === "single" || question.type === "dropdown") {
            // For single choice, check if selected option matches
            // const selectedIndex = question.options.findIndex(
            //   (opt) => opt === answer.value,
            // );
            console.log("Selected answer: ", typeof answer);
            if (typeof answer.value === "number") {
              if (answer.value + 1 == skipLogic.answer_index) {
                // 1-based indexing
                applicableSkipLogic = skipLogic;
              }
            }
            // convert to 1-based index
          }
        });

        // Apply skip logic if found
        if (
          applicableSkipLogic !== null &&
          applicableSkipLogic?.action === "go_to"
        ) {
          const targetSectionIndex = survey.sections.findIndex(
            (section) => section.order === applicableSkipLogic?.target,
          );
          if (targetSectionIndex !== -1) {
            nextPage = targetSectionIndex;
          }
        }
      }
    });

    return nextPage;
  };

  const handleNext = (): void => {
    if (!survey) return;

    const nextPage = getNextPageWithSkipLogic(currentPage);

    if (nextPage < survey.sections.length) {
      setCurrentPage(nextPage);
      setNavigationHistory((prev) => [...prev, nextPage]);
    }
  };

  const handlePrevious = (): void => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current page
      const previousPage = newHistory[newHistory.length - 1];

      setCurrentPage(previousPage);
      setNavigationHistory(newHistory);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!survey || !proj) {
      console.error("No Survey");
      alert(`Survey or Project Not Found!`);
      return;
    }

    setLoading(true);
    setSubmitSuccess(false);

    try {
      const formattedDate = new Date().toISOString().split(".")[0];
      const profile = getCookie("profile");
      const decodeProfile = JSON.parse(profile ?? "");
      const lat = getCookie("lat");
      const long = getCookie("long");

      const province = getCookie("province");
      if (!province || !decodeProfile.email) {
        console.error("no province");
        alert(`Email and Province Not Found!`);
        return;
      }

      const matchedLocation = proj.location.find(
        (loc: ApiLocation) =>
          loc.name_en.toLowerCase() === province.toLowerCase(),
      );

      const projLocations = proj.location
        .map((loc: ApiLocation) => loc.name_en)
        .join(", ");

      if (!matchedLocation) {
        console.log("no location");
        alert(
          `You are in wrong location. Your Location is ${province}. Required Location is ${projLocations}`,
        );
        return;
      }

      const flatAnswers = extractValuesFromAnswers(answers);
      const dataCollection: DataCollection = {
        date: formattedDate,
        respondent: {
          name: `${decodeProfile.last_name ?? ""}${decodeProfile.first_name ?? ""}`,
          email: decodeProfile.email ?? "",
          user_id: decodeProfile.id ?? "",
        },
        location: {
          lat: Number(lat) ?? 0,
          lon: Number(long) ?? 0,
          province: matchedLocation.id,
        },
        responses: flatAnswers,
        survey_code: getCookie("survey_id") ?? "",
      };

      const res = await submitSurveyResponse(dataCollection);

      console.log("res: ", res);

      setSubmitSuccess(true);
      router.push("/survey/thankyou");
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to submit the survey. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container
        maxWidth="sm"
        sx={{ py: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // No survey data
  if (!survey || !survey.sections || survey.sections.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="warning">No survey data available.</Alert>
      </Container>
    );
  }

  const totalPages = survey.sections.length;
  const currentSection = survey.sections[currentPage];
  const isLastPage = currentPage === totalPages - 1;
  const isFirstPage = navigationHistory.length === 1;

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SurveyHeader
          title={`${survey.title} - ${isLastPage ? "Ready to Submit" : `Page ${currentPage + 1}`}`}
        />

        <Box sx={{ p: 3, flex: 1, overflowY: "auto" }}>
          <SectionContent
            section={currentSection}
            answers={answers}
            onAnswerChange={handleAnswerChange}
          />
        </Box>

        <Box sx={{ p: 2 }}>
          <NavigationControls
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSubmit={handleSubmit}
            showPrevious={!isFirstPage}
            showNext={!isLastPage}
            showSubmit={isLastPage}
          />
          <ProgressIndicator
            currentStep={currentPage + 1}
            totalSteps={totalPages}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default SurveyContainer;
