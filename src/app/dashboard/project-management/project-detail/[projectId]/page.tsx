"use client";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  Box,
  Paper,
} from "@mui/material";
import axios from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  FormatListBulleted as SectionIcon,
  QuestionAnswer as QuestionIcon,
  BarChart as IndicatorIcon,
  RadioButtonChecked as RadioIcon,
  CheckBox as CheckBoxIcon,
  TextFields as TextFieldIcon,
  CalendarToday as DateIcon,
  AccessTime as TimeIcon,
  KeyboardArrowRight as ArrowRightIcon,
  Place as LocationIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Locale } from "@/types/projectDetail";
import { GetContext } from "@/utils/language";
import { Commune, District, Location, Village } from "@/types/locations";

// Updated interfaces to match new API structure
interface MultilingualText {
  en: string;
  km: string;
}

interface MultilingualOption {
  en: string;
  km: string;
}

interface SkipLogic {
  answer_index: number;
  action: string;
  target: number;
}

interface Section {
  id: string;
  title: Locale;
  description: Locale;
  order: number;
}

interface Question {
  id: string;
  label: MultilingualText;
  order: number;
  is_required: boolean;
  type: string;
  data_type: string;
  options: MultilingualOption[];
  skip_logics: SkipLogic[];
  section: Section;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SectionWithQuestions {
  id: string;
  title: {
    en: string;
    km: string;
  };
  description: {
    en: string;
    km: string;
  };
  order: number;
  questions: Question[];
}

interface Filter {
  index: number;
  function: string;
  values: (string | number)[];
}

interface Indicator {
  label: string;
  description: string;
  filters: Filter[];
}

interface LocationDetails {
  id: string;
  provinces: Location[] | null;
  districts: District[] | null;
  communes: Commune[] | null;
  villages: Village[] | null;
}

interface ProjectData {
  id: string;
  name: MultilingualText;
  description: MultilingualText;
  questions: Question[];
  indicators: Indicator[];
  location_details: LocationDetails;
  sections_questions: SectionWithQuestions[];
  locales: string[];
}

interface ProjectDetailPageProps {
  params: {
    projectId: string;
  };
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ params }) => {
  const { projectId } = params;
  const router = useRouter();
  const [projectDetails, setProjectDetails] = useState<ProjectData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [currentLocale, setCurrentLocale] = useState<"en" | "km">("en");

  // Utility function to get text in current locale with fallback
  const getLocalizedText = (
    text: MultilingualText | string | undefined,
  ): string => {
    if (!text) return "";
    if (typeof text === "string") return text;
    return text[currentLocale] || text.en || Object.values(text)[0] || "";
  };

  // Utility function to get option text in current locale
  const getLocalizedOption = (option: MultilingualOption | string): string => {
    if (typeof option === "string") return option;
    return option[currentLocale] || option.en || Object.values(option)[0] || "";
  };

  const handleBack = () => {
    router.back();
  };

  const getProjectDetails = async (id: string) => {
    setLoading(true);
    try {
      console.log("Fetching project details for ID:", id);
      const projectRes = await axios.get("/api/config", {
        params: {
          endpoint: `project/project-details/${id}?edit_project=0&data_view=1`,
        },
      });
      console.log("Project details response:", projectRes.data.data);
      setProjectDetails(projectRes.data.data);
    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      getProjectDetails(projectId.toString());
    }
  }, [projectId]);

  if (loading)
    return (
      <div className="p-6 text-gray-500 text-center">
        Loading project details...
      </div>
    );
  if (!projectDetails)
    return (
      <div className="p-6 text-gray-500 text-center">
        No project data available
      </div>
    );

  // Function to render the question type icon based on the question type
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "text":
      case "text_area":
      case "decimal":
        return <TextFieldIcon />;
      case "single":
        return <RadioIcon />;
      case "multiple":
        return <CheckBoxIcon />;
      case "date":
        return <DateIcon />;
      case "time":
        return <TimeIcon />;
      case "dropdown":
        return <ExpandMoreIcon />;
      default:
        return <QuestionIcon />;
    }
  };

  // Function to get a human-readable description of a filter
  const getFilterDescription = (filter: Filter, questions: Question[]) => {
    const question = questions.find((q) => q.order === filter.index + 1);
    if (!question) return "Unknown filter";

    let operation = "";
    switch (filter.function) {
      case "eq":
        operation = "equals";
        break;
      case "gt":
        operation = "greater than";
        break;
      case "gte":
        operation = "greater than or equal to";
        break;
      case "lt":
        operation = "less than";
        break;
      case "lte":
        operation = "less than or equal to";
        break;
      case "btw":
        operation = "between";
        break;
      case "in":
        operation = "is one of";
        break;
      case "isempty":
        operation = "is empty";
        break;
      default:
        operation = filter.function;
    }

    let valueStr = "";
    if (filter.values && filter.values.length > 0) {
      if (
        question.options &&
        filter.values.some((v) => typeof v === "number")
      ) {
        // For options-based questions, show the actual option text
        valueStr = filter.values
          .map((v) => {
            if (typeof v === "number" && question.options[v - 1]) {
              return getLocalizedOption(question.options[v - 1]);
            }
            return v.toString();
          })
          .join(", ");
      } else {
        valueStr = filter.values.join(" and ");
      }
    }

    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {getLocalizedText(question.label)}
        </Typography>
        <Typography variant="body2">Operation : {operation}</Typography>
        {valueStr && (
          <Typography variant="body2">Value : {valueStr}</Typography>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back
        </Button>

        {/* Language Toggle */}
        {projectDetails.locales && projectDetails.locales.length > 1 && (
          <Box sx={{ display: "flex", gap: 1 }}>
            {projectDetails.locales.map((locale) => (
              <Button
                key={locale}
                variant={currentLocale === locale ? "contained" : "outlined"}
                size="small"
                onClick={() => setCurrentLocale(locale as "en" | "km")}
              >
                {locale.toUpperCase()}
              </Button>
            ))}
          </Box>
        )}
      </Box>

      {/* Project Header */}
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 500 }}>
            {getLocalizedText(projectDetails.name)}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {getLocalizedText(projectDetails.description) ||
              "No description available"}
          </Typography>
        </CardContent>
      </Card>

      {/* Project Location */}
      <Accordion
        elevation={0}
        sx={{
          mb: 2,
          border: "1px solid rgba(0, 0, 0, 0.12)",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <LocationIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6">Project Location</Typography>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 0 }}>
          <Card elevation={1} sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                {(projectDetails.location_details?.provinces ?? []).length >
                  0 && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Provinces
                    </Typography>
                    <Box
                      sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}
                    >
                      {projectDetails.location_details.provinces?.map(
                        (province, index) => (
                          <Chip
                            key={index}
                            label={
                              currentLocale === "en"
                                ? province.name_en
                                : province.name_km
                            }
                            size="small"
                          />
                        ),
                      )}
                    </Box>
                  </Grid>
                )}

                {(projectDetails.location_details?.districts ?? []).length >
                  0 && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Districts
                    </Typography>
                    <Box
                      sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}
                    >
                      {projectDetails.location_details.districts?.map(
                        (district, index) => (
                          <Chip
                            key={index}
                            label={
                              currentLocale === "en"
                                ? district.name_en
                                : district.name_km
                            }
                            size="small"
                          />
                        ),
                      )}
                    </Box>
                  </Grid>
                )}

                {(projectDetails.location_details?.communes ?? []).length >
                  0 && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Communes
                    </Typography>
                    <Box
                      sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}
                    >
                      {projectDetails.location_details.communes?.map(
                        (commune, index) => (
                          <Chip
                            key={index}
                            label={
                              currentLocale === "en"
                                ? commune.name_en
                                : commune.name_km
                            }
                            size="small"
                          />
                        ),
                      )}
                    </Box>
                  </Grid>
                )}

                {(projectDetails.location_details?.villages ?? []).length >
                  0 && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Villages
                    </Typography>
                    <Box
                      sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}
                    >
                      {projectDetails.location_details.villages?.map(
                        (village, index) => (
                          <Chip
                            key={index}
                            label={
                              currentLocale === "en"
                                ? village.name_en
                                : village.name_km
                            }
                            size="small"
                          />
                        ),
                      )}
                    </Box>
                  </Grid>
                )}

                {!projectDetails.location_details?.provinces &&
                  !projectDetails.location_details?.districts &&
                  !projectDetails.location_details?.communes &&
                  !projectDetails.location_details?.villages && (
                    <Grid item xs={12}>
                      <Typography variant="body1" color="text.secondary">
                        No location details available
                      </Typography>
                    </Grid>
                  )}
              </Grid>
            </CardContent>
          </Card>
        </AccordionDetails>
      </Accordion>
      {/* Project Questions */}
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <QuestionIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6">Project Questions</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {(projectDetails.sections_questions ?? []).length > 0 ? (
            projectDetails.sections_questions?.map((section) => (
              <Accordion
                key={section.id}
                elevation={0}
                sx={{
                  mb: 2,
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <SectionIcon sx={{ mr: 1 }} color="action" />
                    <Typography variant="subtitle1">
                      {GetContext("section_title", currentLocale)}{" "}
                      {section.order}:{" "}
                      {currentLocale == "en"
                        ? section.title.en
                        : section.title.km}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  {section.questions.length > 0 ? (
                    section.questions.map((question) => (
                      <Paper
                        key={question.id}
                        elevation={0}
                        sx={{
                          p: 2,
                          mb: 1,
                          borderRadius: 0,
                          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              {getQuestionTypeIcon(question.type)}
                              <Typography
                                variant="subtitle1"
                                sx={{ ml: 1, fontWeight: 500 }}
                              >
                                {question.order}.{" "}
                                {getLocalizedText(question.label)}
                              </Typography>
                              {question.is_required && (
                                <Chip
                                  label="Required"
                                  size="small"
                                  color="primary"
                                  sx={{ ml: 2 }}
                                />
                              )}
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 4 }}
                            >
                              Type: {question.type} | Data Type:{" "}
                              {question.data_type}
                            </Typography>
                          </Grid>

                          {question.options && question.options.length > 0 && (
                            <Grid item xs={12}>
                              <Box sx={{ ml: 4 }}>
                                <Typography
                                  variant="body2"
                                  sx={{ mb: 1, fontWeight: 500 }}
                                >
                                  Options:
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 1,
                                  }}
                                >
                                  {question.options.map((option, optIndex) => {
                                    // Check if this option has skip logic (using answer_index which is 1-based)
                                    const skipLogic =
                                      question.skip_logics?.find(
                                        (logic) =>
                                          logic.answer_index === optIndex + 1,
                                      );

                                    return (
                                      <Chip
                                        key={optIndex}
                                        label={getLocalizedOption(option)}
                                        variant={
                                          skipLogic ? "outlined" : "filled"
                                        }
                                        color={
                                          skipLogic ? "success" : "default"
                                        }
                                        sx={{
                                          maxWidth: "100%",
                                          height: "auto",
                                          "& .MuiChip-label": {
                                            whiteSpace: "normal",
                                            padding: skipLogic
                                              ? "5px 8px"
                                              : undefined,
                                          },
                                        }}
                                      />
                                    );
                                  })}
                                </Box>
                              </Box>
                            </Grid>
                          )}

                          {question.skip_logics &&
                            question.skip_logics.length > 0 && (
                              <Grid item xs={12}>
                                <Box sx={{ ml: 4, mt: 1 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{ mb: 1, fontWeight: 500 }}
                                  >
                                    Skip Logic:
                                  </Typography>
                                  {question.skip_logics.map(
                                    (logic, logicIndex) => {
                                      // Find the target section by order
                                      const targetSection =
                                        projectDetails.sections_questions?.find(
                                          (s) => s.order === logic.target,
                                        );

                                      // Get the option text for this answer_index
                                      const optionText =
                                        question.options &&
                                        question.options[logic.answer_index - 1]
                                          ? getLocalizedOption(
                                              question.options[
                                                logic.answer_index - 1
                                              ],
                                            )
                                          : `Option ${logic.answer_index}`;

                                      return (
                                        <Box
                                          key={logicIndex}
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            mb: 0.5,
                                          }}
                                        >
                                          <Chip
                                            label={optionText}
                                            size="small"
                                            variant="outlined"
                                            sx={{ mr: 1 }}
                                          />
                                          <ArrowRightIcon
                                            fontSize="small"
                                            sx={{ mx: 1 }}
                                          />
                                          <Typography variant="body2">
                                            {logic.action === "go_to"
                                              ? "Go to"
                                              : logic.action}
                                          </Typography>
                                          <Chip
                                            label={
                                              targetSection
                                                ? `Section ${targetSection.order}: ${targetSection.title}`
                                                : `Section ${logic.target}`
                                            }
                                            size="small"
                                            color="primary"
                                            sx={{ ml: 1 }}
                                          />
                                        </Box>
                                      );
                                    },
                                  )}
                                </Box>
                              </Grid>
                            )}
                        </Grid>
                      </Paper>
                    ))
                  ) : (
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body1" color="text.secondary">
                        No questions in this section
                      </Typography>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Typography variant="body1" color="text.secondary">
              No questions available for this project
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Project Indicators */}
      <Card elevation={1}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IndicatorIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6">Project Indicators</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {projectDetails.indicators?.length > 0 ? (
            projectDetails.indicators.map((indicator, index) => (
              <Accordion
                key={index}
                elevation={0}
                sx={{
                  mb: 2,
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                  }}
                >
                  <Typography variant="subtitle1">
                    Indicator {index + 1}: {indicator.label}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" paragraph>
                    {indicator.description || "No description available"}
                  </Typography>

                  {indicator.filters && indicator.filters.length > 0 ? (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{ mt: 2, mb: 1, fontWeight: 500 }}
                      >
                        Filters:
                      </Typography>
                      <Box sx={{ ml: 2 }}>
                        {indicator.filters.map((filter, filterIndex) => (
                          <Paper
                            key={filterIndex}
                            elevation={0}
                            sx={{
                              p: 2,
                              mb: 1,
                              backgroundColor: "rgba(0, 0, 0, 0.02)",
                              border: "1px solid rgba(0, 0, 0, 0.08)",
                            }}
                          >
                            <Typography variant="body2">
                              {getFilterDescription(
                                filter,
                                projectDetails.questions || [],
                              )}
                            </Typography>
                          </Paper>
                        ))}
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No filters for this indicator
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Typography variant="body1" color="text.secondary">
              No indicators available for this project
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectDetailPage;
