import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  Typography,
  Avatar,
} from "@mui/material";
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
import MenuDropDown from "@/components/menuDropDown";
import { getLocaleValue } from "@/utils/language";

interface SurveyContainerProps {
  surveyId?: string;
}

interface LanguageOption {
  label: string;
  flagUrl: string;
  displayName: string;
}

const LANGUAGE_OPTIONS: Record<string, LanguageOption> = {
  en: {
    label: "english",
    flagUrl: "/dist/images/Flag_of_the_United_States.svg",
    displayName: "English",
  },
  km: {
    label: "khmer",
    flagUrl: "/dist/images/Flag_of_Cambodia.svg",
    displayName: "ខ្មែរ",
  },
};

const WebSurveyForm: React.FC<SurveyContainerProps> = ({ surveyId }) => {
  const router = useRouter();
  const [survey, setSurvey] = useState<TransformedSurvey | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [navigationHistory, setNavigationHistory] = useState<number[]>([0]);

  // localization
  const [locale, setLocale] = useState<string[]>(["en", "km"]);
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const availableOptions = locale.map((lang) => ({
    value: lang,
    ...LANGUAGE_OPTIONS[lang],
  }));
  const currentLang =
    LANGUAGE_OPTIONS[selectedLang as string] || LANGUAGE_OPTIONS[locale[0]];

  // loading state
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [proj, setProj] = useState<ApiSurveyData | null>(null);

  // Fetch survey data
  useEffect(() => {
    const loadSurvey = async (): Promise<void> => {
      try {
        // console.log("fetching....");
        setLoading(true);
        if (!surveyId) {
          setError("Survey ID is required.");
          return;
        }
        // console.log("continue fetching");
        const apiData = await fetchSurveyQuestionnaire(surveyId);

        // console.log("Fetched survey data:", apiData);
        // set locale from survey data if available
        if (apiData.locales) {
          console.log("Setting locale from survey data:", apiData.locales);
          const defaultLocale =
            (Array.isArray(apiData.locales) ? apiData.locales[0] : undefined) ||
            "en";
          console.log("Default locale:", defaultLocale);
          setLocale(
            Array.isArray(apiData.locales) ? apiData.locales.map(String) : [],
          );
          setSelectedLang(defaultLocale);
        }

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

  // @ts-ignore
  const handleSelectLanguage = (selectedOption) => {
    setSelectedLang(selectedOption.value);
  };

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
            console.log(
              "Selected answer: ",
              Number(answer.value) + 1,
              " | Skiplogic: ",
              skipLogic,
              " | Type of answer: ",
              typeof answer.value,
            );
            if (
              typeof answer.value === "number" ||
              typeof answer.value === "string"
            ) {
              if (Number(answer.value) + 1 === skipLogic.answer_index) {
                // 1-based indexing
                applicableSkipLogic = skipLogic;
              }
            }
            // convert to 1-based index
          }
        });
        console.log("skip logic exist: ", applicableSkipLogic);
        // Apply skip logic if found
        // @ts-expect-error - applicableSkipLogic type doesn't include action property
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

  const buttonLabel = (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <Avatar
        src={currentLang.flagUrl}
        variant="rounded"
        sx={{
          color: "white",
          width: 30,
          height: 20,
        }}
      />
      {currentLang.displayName}
    </div>
  );

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
      {locale.length > 1 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <MenuDropDown buttonLabel={buttonLabel}>
            {availableOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelectLanguage(option)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  cursor: "pointer",
                  background:
                    selectedLang === option.value ? "rgba(0,0,0,0.1)" : "none",
                }}
              >
                <Avatar
                  src={option.flagUrl}
                  variant="rounded"
                  sx={{
                    bgcolor: "rgba(0,0,0,0.3)",
                    color: "white",
                    width: 30,
                    height: 20,
                  }}
                />
                {option.label}
              </div>
            ))}
          </MenuDropDown>
        </Box>
      )}
      <Box
        sx={{
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            mb: 1,
            borderBottom: "1px solid #eee",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <SurveyHeader
              title={survey.title}
              page={`${isLastPage ? "End of Survey" : `Page ${currentPage + 1}`}`}
            />
            <ProgressIndicator
              currentStep={currentPage + 1}
              totalSteps={totalPages}
            />
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              {getLocaleValue(currentSection?.title, selectedLang)}
            </Typography>
            {currentSection?.description && (
              <Typography variant="body2" color="text.secondary">
                {getLocaleValue(currentSection.description, selectedLang)}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <SectionContent
            section={currentSection}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            selectedLang={selectedLang}
          />
        </Box>

        <NavigationControls
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSubmit={handleSubmit}
          showPrevious={!isFirstPage}
          showNext={!isLastPage}
          showSubmit={isLastPage}
        />
      </Box>
    </Container>
  );
};

export default WebSurveyForm;
