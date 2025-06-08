"use client";
import React, { useEffect, useState, ChangeEvent, useRef } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import axios from "axios";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
const Map = dynamic(() => import("@/components/dashboard/map"), { ssr: false });
const xlsx = require("json-as-xlsx");
import {
  DataGrid,
  GridColDef,
  GridSlots,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import AuthorizationCheck from "@/components/AuthorizationCheck";
import { permissionCode } from "@/utils/permissionCode";
import useLang from "@/store/lang";
import { GetContext } from "@/utils/language";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import ErrorIcon from "@mui/icons-material/Error";
import FilterItem from "./filter";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Button,
  Drawer,
  CircularProgress,
  Typography,
  Chip,
  Alert,
  IconButton,
  Paper,
  Divider,
  LinearProgress,
} from "@mui/material";
import CustomToolbar from "@/components/DataGridToolbar";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string | { en: string; km: string };
}

interface ProjectDetail {
  id: string;
  name: string;
  questions: Question[];
  location_details: LocationMap;
  submitted_users: any[];
}

interface MapData {
  lat: number;
  lon: number;
  submitted_by: string;
  created_at: string;
  project_id?: string;
  project_name?: string;
  color?: string;
}

interface LocationMap {
  provinces: any[];
  districts: any[];
  communes: any[];
  villages: any[];
}

interface Question {
  id: string;
  _id?: string;
  order: number;
  label: string | { en: string; km: string };
  label_km?: string;
  type: string;
  data_type: string;
  options: any[];
  project_id?: string;
  project_name?: string;
  color?: string;
}

interface ProjectLoadingStatus {
  projectId: string;
  projectName: string;
  status: "pending" | "loading" | "success" | "error";
  message?: string;
  color?: string;
}

const MAX_RECOMMENDED_PROJECTS = 3;

const PROJECT_COLORS = [
  "#1976d2", // blue
  "#388e3c", // green
  "#d32f2f", // red
  "#f57c00", // orange
  "#7b1fa2", // purple
  "#00796b", // teal
];

const AddQuestions: Question[] = [
  {
    id: "user",
    order: -1,
    label: "Submitted By",
    label_km: "អ្នកបញ្ខូលទិន្នន័យ",
    type: "user",
    data_type: "array",
    options: [],
  },
  {
    id: "province",
    order: -1,
    label: "Provinces",
    label_km: "ខេត្ត",
    type: "province",
    data_type: "array",
    options: [],
  },
  {
    id: "district",
    order: -1,
    label: "District",
    label_km: "ស្រុក",
    type: "district",
    data_type: "array",
    options: [],
  },
  {
    id: "commune",
    order: -1,
    label: "Commune",
    label_km: "ឃុំ",
    type: "commune",
    data_type: "array",
    options: [],
  },
  {
    id: "village",
    order: -1,
    label: "Village",
    label_km: "ភូមិ",
    type: "village",
    data_type: "array",
    options: [],
  },
  {
    id: "project",
    order: -1,
    label: "Project",
    label_km: "គម្រោង",
    type: "project",
    data_type: "array",
    options: [],
  },
];

interface dataViewProps {
  singleProjectView?: boolean;
  singleProjectDetail?: {
    id: string;
    name: { en?: string; km?: string };
  };
}

const DataView: React.FC<dataViewProps> = ({
  singleProjectView = false,
  singleProjectDetail,
}) => {
  const lang = useLang((state) => state.lang);
  const chartRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projectLoadingStatus, setProjectLoadingStatus] = useState<
    ProjectLoadingStatus[]
  >([]);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [masterProjectDetails, setMasterProjectDetails] =
    useState<ProjectDetail | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [gridCols, setGridCols] = useState<GridColDef[]>([]);
  const [gridRows, setGridRows] = useState<
    { [key: string]: string | { en: string; km: string } }[]
  >([]);
  const [rowSize, setRowSize] = useState<number>(0);
  const [totalData, setTotalData] = useState<number>(0);
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [filters, setFilters] = useState<QuestionFilter[]>([]);
  const [drawerKey, setDrawerKey] = useState(0);
  const [questionVisualize, setQuestionVisualize] = useState<Question>();
  const [dataset, setDataset] = useState<any[]>([]);
  const [currentFilter, setCurrentFilter] = useState<QuestionFilter[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [dataMaps, setDataMaps] = useState<MapData[]>([]);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [showTooManyProjectsWarning, setShowTooManyProjectsWarning] =
    useState(false);

  // Helper function to get project name
  const getProjectName = (project: Project): string => {
    if (typeof project.name === "string") {
      return project.name;
    }
    return (
      project.name[lang as "en" | "km"] || project.name.en || "Unnamed Project"
    );
  };

  // Helper function to extract unique location details from responses
  const extractLocationDetails = (responses: any[]) => {
    const provinces = new Set();
    const districts = new Set();
    const communes = new Set();
    const villages = new Set();

    responses.forEach((response) => {
      if (response.province) provinces.add(response.province);
      if (response.district) districts.add(response.district);
      if (response.commune) communes.add(response.commune);
      if (response.village) villages.add(response.village);
    });

    return {
      provinces: Array.from(provinces).map((name) => ({
        id: name,
        name_en: name,
        name_km: name,
      })),
      districts: Array.from(districts).map((name) => ({
        id: name,
        name_en: name,
        name_km: name,
      })),
      communes: Array.from(communes).map((name) => ({
        id: name,
        name_en: name,
        name_km: name,
      })),
      villages: Array.from(villages).map((name) => ({
        id: name,
        name_en: name,
        name_km: name,
      })),
    };
  };

  // Helper function to extract unique users from responses
  const extractUniqueUsers = (responses: any[]) => {
    const users = new Set();

    responses.forEach((response) => {
      if (response.user) {
        users.add(response.user);
      }
    });

    return Array.from(users).map((userName) => ({
      id: userName,
      first_name: (userName as string).split(" ")[0] || userName,
      last_name: (userName as string).split(" ").slice(1).join(" ") || "",
    }));
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/api/config", {
        params: { endpoint: "project/all?status=1,2" },
      });
      setProjects(response.data.data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    if (singleProjectView && singleProjectDetail) {
      setSelectedProjects([singleProjectDetail.id]);
      loadAllSelectedProjects();
    } else {
      fetchProjects();
    }
  }, []);

  const downloadFile = async () => {
    const settings = {
      fileName: "multi_project_data",
      extraLength: 3,
      writeOptions: {},
    };
    try {
      let body = {
        filter: {
          questions: currentFilter,
        },
        selected_question_indexs: [] as number[],
        is_province: false,
        is_district: false,
        is_commune: false,
        is_submit_user: false,
      };
      selectedQuestions.map((question) => {
        if (question.order != -1) {
          body.selected_question_indexs.push(question.order - 1);
        } else {
          if (question.type == "province") {
            body.is_province = true;
          } else if (question.type == "district") {
            body.is_district = true;
          } else if (question.type == "commune") {
            body.is_commune = true;
          } else if (question.type == "user") {
            body.is_submit_user = true;
          }
        }
      });
      const response = await axios.post("/api/config", {
        endpoint: `responses/export/${selectedProjects}?lang=${lang}`,
        body,
      });
      const sheetData = [
        {
          sheet: "Sheet1",
          columns: response.data.data.col,
          content: response.data.data.con,
        },
      ];
      xlsx(sheetData, settings);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  // Simplified loadAllSelectedProjects function
  const loadAllSelectedProjects = async () => {
    setIsLoadingProjects(true);
    setIsDataLoading(true);
    setIsDataReady(false);

    // Reset data
    setRowSize(0);
    setTotalData(0);
    setGridRows([]);
    setDataMaps([]);

    try {
      // Update all project statuses to loading
      setProjectLoadingStatus((prev) =>
        prev.map((p) => ({ ...p, status: "loading" })),
      );

      console.log("Loading projects:", selectedProjects);

      // Single API call to get questions and responses
      const response = await axios.post("/api/config", {
        endpoint: `responses/multiple-projects?lang=${lang}`,
        body: {
          project_ids: selectedProjects,
        },
      });

      console.log("API response:", response.data);

      const { questions, responses, count, total } = response.data.data;

      // Process questions - convert _id to id for consistency with existing code
      const processedQuestions = questions.map((question: any) => ({
        ...question,
        id: question._id, // Map _id to id for DataGrid compatibility
        label:
          typeof question.label === "object"
            ? question.label[lang] || question.label.en
            : question.label,
        label_km:
          typeof question.label === "object"
            ? question.label.km
            : question.label,
      }));

      // Process responses to extract the correct language values
      const processedResponses = responses.map((response: any) => {
        const processedResponse = { ...response };

        // Process each field in the response
        Object.keys(processedResponse).forEach((key) => {
          const value = processedResponse[key];

          // If the value is an object with 'en' and 'km' properties
          if (
            value &&
            typeof value === "object" &&
            ("en" in value || "km" in value)
          ) {
            // Use the current language, fallback to 'en' if the selected language doesn't exist
            processedResponse[key] =
              value[lang] || value["en"] || value["km"] || "N/A";
          }
          // If it's already a string, keep it as is
        });

        return processedResponse;
      });

      // Create a simplified project detail structure
      const masterProjectDetail = {
        id: "combined",
        name: "Combined Projects",
        questions: processedQuestions,
        location_details: extractLocationDetails(responses),
        submitted_users: extractUniqueUsers(responses),
      };

      // Set the master project details
      setMasterProjectDetails(masterProjectDetail);

      setGridRows(processedResponses); // Use processed responses instead of raw responses
      setRowSize(count);
      setTotalData(total);

      // Update all project statuses to success
      setProjectLoadingStatus((prev) =>
        prev.map((p) => ({
          ...p,
          status: "success",
          message: "Loaded successfully",
        })),
      );

      setIsDataReady(true);
    } catch (error) {
      console.error("Error loading projects:", error);

      // Update all project statuses to error
      setProjectLoadingStatus((prev) =>
        prev.map((p) => ({ ...p, status: "error", message: "Failed to load" })),
      );
    } finally {
      setIsLoadingProjects(false);
      setIsDataLoading(false);
    }
  };

  // Get data visualization
  const getDataVisualization = async (qSelected: Question) => {
    setIsChartLoading(true);
    try {
      const projectId = selectedProjects[0]; // Use first project for now

      if (!projectId) {
        setIsChartLoading(false);
        return;
      }

      let body = {
        project_id: projectId,
        question: qSelected,
        filters: currentFilter,
      };

      const response = await axios.post("/api/config", {
        endpoint: `responses/visualize`,
        body,
      });

      setDataset(response.data.data);
      setIsChartLoading(false);
    } catch (error) {
      setIsChartLoading(false);
      setDataset([]);
      console.error("Error fetching visualization data:", error);
    }
  };

  // Clear all value in filter
  const handleClearFilter = async () => {
    var newFilter = filters;
    newFilter.map((filter) => {
      filter.values = [];
    });
    setFilters(newFilter);
    setDrawerKey((prevKey) => prevKey + 1);
  };

  // Filter function
  const handleFilter = async () => {
    setPaginationModel({
      page: 0,
      pageSize: paginationModel.pageSize,
    });

    setIsDataLoading(true);
    setRowSize(0);
    setTotalData(0);
    setGridRows([]);
    setDataMaps([]);

    try {
      console.log("filter body: ", filters);
      // Single request with filters for all projects
      const response = await axios.post("/api/config", {
        endpoint: `responses/multiple-projects?lang=${lang}&page=${1}&limit=${paginationModel.pageSize}`,
        body: {
          project_ids: selectedProjects,
          questions: filters,
        },
      });

      const { questions, responses, count, total } = response.data.data;

      // Process questions - convert _id to id for consistency with existing code
      const processedQuestions = questions.map((question: any) => ({
        ...question,
        id: question._id, // Map _id to id for DataGrid compatibility
        label:
          typeof question.label === "object"
            ? question.label[lang] || question.label.en
            : question.label,
        label_km:
          typeof question.label === "object"
            ? question.label.km
            : question.label,
      }));

      console.log("New questionnaire: ", responses);

      // Process responses to extract the correct language values
      const processedResponses = responses.map((response: any) => {
        const processedResponse = { ...response };

        // Process each field in the response
        Object.keys(processedResponse).forEach((key) => {
          const value = processedResponse[key];

          // If the value is an object with 'en' and 'km' properties
          if (
            value &&
            typeof value === "object" &&
            ("en" in value || "km" in value)
          ) {
            // Use the current language, fallback to 'en' if the selected language doesn't exist
            processedResponse[key] =
              value[lang] || value["en"] || value["km"] || "N/A";
          }
          // If it's already a string, keep it as is
        });

        return processedResponse;
      });
      console.log("process response: ", processedResponses);
      setGridRows(processedResponses);
      setRowSize(count);
      setTotalData(total);
    } catch (error) {
      console.error("Error filtering data:", error);
    } finally {
      setIsDataLoading(false);
      setOpenDrawer(false);
      setCurrentFilter(filters);

      if (questionVisualize) {
        getDataVisualization(questionVisualize);
      }
    }
  };

  // Handle project selection change
  const handleProjectChange = async (event: SelectChangeEvent<string[]>) => {
    const selectedValues = event.target.value as string[];

    setShowTooManyProjectsWarning(
      selectedValues.length > MAX_RECOMMENDED_PROJECTS,
    );
    setSelectedProjects(selectedValues);

    // Setup project colors for each selected project
    const newProjectStatus: ProjectLoadingStatus[] = [];

    selectedValues.forEach((projectId, index) => {
      const project = projects.find((p) => p.id === projectId);
      const projectName = project ? getProjectName(project) : projectId;
      const colorIndex = index % PROJECT_COLORS.length;

      newProjectStatus.push({
        projectId,
        projectName,
        status: "pending",
        color: PROJECT_COLORS[colorIndex],
      });
    });

    setProjectLoadingStatus(newProjectStatus);

    // Reset UI state
    setSelectedQuestions([]);
    setCurrentFilter([]);
    setIsMapOpen(false);
    setDataMaps([]);
    setQuestionVisualize(undefined);
    setMasterProjectDetails(null);
    setIsDataReady(false);
  };

  // Remove a single project
  const handleRemoveProject = (projectId: string) => {
    setSelectedProjects((prev) => prev.filter((id) => id !== projectId));
    setShowTooManyProjectsWarning(
      selectedProjects.length - 1 > MAX_RECOMMENDED_PROJECTS,
    );
    setProjectLoadingStatus((prev) =>
      prev.filter((p) => p.projectId !== projectId),
    );

    setGridRows((prev) => prev.filter((row) => row.project_id !== projectId));
    setDataMaps((prev) => prev.filter((item) => item.project_id !== projectId));

    const removeCount = gridRows.filter(
      (row) => row.project_id === projectId,
    ).length;
    setRowSize((prev) => prev - removeCount);

    if (selectedProjects.length <= 1) {
      setSelectedQuestions([]);
      setCurrentFilter([]);
      setIsMapOpen(false);
      setDataMaps([]);
      setQuestionVisualize(undefined);
      setIsDataReady(false);
    }
  };

  // Question on change function
  const handleQuestionChange = (event: SelectChangeEvent<Question[]>) => {
    const { value } = event.target;

    if (masterProjectDetails) {
      // @ts-ignore
      if (value.includes("all")) {
        // @ts-ignore
        if (
          selectedQuestions.length === masterProjectDetails.questions.length
        ) {
          setSelectedQuestions([]);
        } else {
          setSelectedQuestions(masterProjectDetails.questions);
        }
      } else {
        // @ts-ignore
        setSelectedQuestions(value);
      }
    }
  };

  // Question visualize change
  const handleQuestionVisualizeChange = (event: SelectChangeEvent<string>) => {
    if (typeof event.target.value == "string") {
      const selectedQuestion = JSON.parse(event.target.value) as Question;
      setQuestionVisualize(selectedQuestion);
      getDataVisualization(selectedQuestion);
    }
  };

  // Handle filter selection changes
  const handleFilterChange = (
    event:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<any[]>,
    index: number,
    numValue?: number,
  ) => {
    const { value } = event.target;
    setFilters((filters) => {
      const newFilters = [...filters];

      if (typeof value == "string") {
        if (numValue) {
          newFilters[index].values[numValue - 1] = value;
        } else {
          newFilters[index].values = [value];
        }
      } else {
        newFilters[index].values = value;
      }
      return newFilters;
    });
  };

  const handleCloseChart = () => {
    setQuestionVisualize(undefined);
    setDataset([]);
  };

  // On pagination model change
  useEffect(() => {
    if (selectedProjects.length > 0 && isDataReady) {
      setIsDataLoading(true);

      const loadData = async () => {
        try {
          const response = await axios.post("/api/config", {
            endpoint: `responses/multiple-projects?lang=${lang}&page=${paginationModel.page + 1}&limit=${
              paginationModel.pageSize
            }`,
            body: {
              project_ids: selectedProjects,
              filters: filters,
            },
          });

          const { questions, responses, count, total } = response.data.data;
          setGridRows(responses);
          setRowSize(count);
          setTotalData(total);
        } catch (error) {
          console.error("Error loading paginated data:", error);
        } finally {
          setIsDataLoading(false);
        }
      };

      loadData();
    }
  }, [paginationModel, lang]);

  // Map grid col when selected questions changes
  useEffect(() => {
    var temp: GridColDef[] = [];
    var tempQuestion: QuestionFilter[] = [];

    selectedQuestions.map((item) => {
      // Always resolve colLabel to a string for headerName
      let colLabel: string;
      if (typeof item.label === "object") {
        colLabel = lang === "en" ? item.label.en : item.label.km;
      } else {
        colLabel = item.label;
      }

      // Generate filter base on selected question
      if (item.type == "user") {
        if (masterProjectDetails) {
          if (masterProjectDetails.submitted_users.length > 0) {
            tempQuestion.push({
              label:
                typeof item.label === "object"
                  ? lang === "en"
                    ? item.label.en
                    : item.label.km
                  : lang === "en"
                    ? item.label
                    : item.label_km || item.label,
              type: item.type,
              data_type: item.data_type,
              index: item.order,
              values: [],
              options: masterProjectDetails.submitted_users,
            });
          }
        }
      } else if (item.type == "province") {
        tempQuestion.push({
          label:
            typeof item.label === "object"
              ? lang === "en"
                ? item.label.en
                : item.label.km
              : lang === "en"
                ? item.label
                : item.label_km || item.label,
          type: item.type,
          data_type: item.data_type,
          index: item.order,
          values: [],
          options: masterProjectDetails
            ? masterProjectDetails.location_details.provinces
            : [],
        });
      } else if (item.type == "district") {
        tempQuestion.push({
          label:
            typeof item.label === "object"
              ? lang === "en"
                ? item.label.en
                : item.label.km
              : lang === "en"
                ? item.label
                : item.label_km || item.label,
          type: item.type,
          data_type: item.data_type,
          index: item.order,
          values: [],
          options: masterProjectDetails
            ? masterProjectDetails.location_details.districts
            : [],
        });
      } else if (item.type == "commune") {
        tempQuestion.push({
          label:
            typeof item.label === "object"
              ? lang === "en"
                ? item.label.en
                : item.label.km
              : lang === "en"
                ? item.label
                : item.label_km || item.label,
          type: item.type,
          data_type: item.data_type,
          index: item.order,
          values: [],
          options: masterProjectDetails
            ? masterProjectDetails.location_details.communes
            : [],
        });
      } else if (item.type == "village") {
        tempQuestion.push({
          label:
            typeof item.label === "object"
              ? lang === "en"
                ? item.label.en
                : item.label.km
              : lang === "en"
                ? item.label
                : item.label_km || item.label,
          type: item.type,
          data_type: item.data_type,
          index: item.order,
          values: [],
          options: masterProjectDetails
            ? masterProjectDetails.location_details.villages
            : [],
        });
      } else if (item.type == "project") {
        tempQuestion.push({
          label:
            typeof item.label === "object"
              ? lang === "en"
                ? item.label.en
                : item.label.km
              : lang === "en"
                ? item.label
                : item.label_km || item.label,
          type: item.type,
          data_type: item.data_type,
          index: item.order,
          values: [],
          options: item.options,
        });
      } else {
        tempQuestion.push({
          label:
            typeof item.label === "object"
              ? lang === "en"
                ? item.label.en
                : item.label.km
              : item.label,
          type: item.type,
          data_type: item.data_type,
          index: item.order - 1,
          values: [],
          options: item.options,
        });
      }

      // Add column to the grid
      temp.push({
        field: item.id,
        headerName: colLabel,
        cellClassName: "text-left",
        // // flex: 1.6,
        // width: 250,
        // minWidth: 200,
      });
    });

    setGridCols(temp);
    setFilters(tempQuestion);
  }, [selectedQuestions, lang, masterProjectDetails]);

  const handleDownloadChart = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "chart.png";
      link.click();
    }
  };

  const handleSelectionChange = (newSelection: string | any[]) => {
    // Limit to single selection
    const singleSelection =
      newSelection.length > 0 ? [newSelection[newSelection.length - 1]] : [];
    setSelectedRows(singleSelection);

    // Get the actual row data if needed
    if (singleSelection.length > 0) {
      const selectedRowData = gridRows.find(
        (row) => row.id === singleSelection[0],
      );
      console.log("Selected row:", selectedRowData);
    }
  };

  const handleEditRecord = () => {
    // Check if there are any selected rows first
    if (!selectedRows || selectedRows.length === 0) {
      console.error("No row selected for editing");
      return;
    }

    // The selectedRow is the ID itself, not an object
    const responseId = selectedRows[0];
    console.log("Selected row for editing:", responseId);

    if (responseId == undefined || responseId == null || responseId === "") {
      console.error("Selected row does not have a valid id");
      return;
    }

    router.push(`/dashboard/data-view/edit-record/${responseId}`);
  };

  return (
    <AuthorizationCheck requiredPermissions={permissionCode.viewDataView}>
      <div>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Data View
          </Typography>

          {/* Project Selection */}

          {singleProjectView === false ? (
            <>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                1. Select Projects
              </Typography>

              <FormControl sx={{ minWidth: "100%", mb: 2 }}>
                <InputLabel id="project-select">
                  {selectedProjects.length === 0
                    ? GetContext("select_project_msg", lang)
                    : GetContext("select_project", lang)}{" "}
                </InputLabel>
                <Select
                  variant="standard"
                  id="project-select"
                  multiple
                  value={selectedProjects}
                  label="Projects"
                  onChange={handleProjectChange}
                >
                  {projects.length === 0 && (
                    <MenuItem key="empty" value="" disabled>
                      {GetContext("no_project", lang)}
                    </MenuItem>
                  )}
                  {projects.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {getProjectName(item)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          ) : (
            <div>All Response for Project : {singleProjectDetail?.name.en}</div>
          )}

          {/* Warning for too many projects */}
          {showTooManyProjectsWarning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography fontWeight="bold">Performance Warning</Typography>
              You have selected more than {MAX_RECOMMENDED_PROJECTS} projects.
              Loading and displaying data for multiple projects may be slow.
            </Alert>
          )}

          {/* Selected Projects Chips */}
          {selectedProjects.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {projectLoadingStatus.map((project) => (
                <Chip
                  key={project.projectId}
                  label={project.projectName}
                  onDelete={() => handleRemoveProject(project.projectId)}
                  sx={{
                    backgroundColor: project.color,
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                />
              ))}
            </Box>
          )}

          {/* Load Projects Button */}
          {selectedProjects.length > 0 && !isLoadingProjects && (
            <Button
              variant="contained"
              color="primary"
              onClick={loadAllSelectedProjects}
              startIcon={<RefreshIcon />}
              sx={{ mr: 1, mb: 2 }}
            >
              Load Selected Projects
            </Button>
          )}

          {/* Loading Status */}
          {isLoadingProjects && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Loading {selectedProjects.length} Projects...
              </Typography>
              <LinearProgress sx={{ mb: 2, height: 10, borderRadius: 5 }} />
              <Typography variant="body2" color="text.secondary">
                Fetching all project data in a single request...
              </Typography>
            </Paper>
          )}

          {/* Error Status */}
          {!isLoadingProjects &&
            projectLoadingStatus.some((p) => p.status === "error") && (
              <Paper
                variant="outlined"
                sx={{ p: 2, mb: 2, borderLeft: "4px solid #d32f2f" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ErrorIcon color="error" sx={{ mr: 1 }} />
                    <Typography fontWeight="bold" color="error">
                      Failed to load projects
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={loadAllSelectedProjects}
                    startIcon={<RefreshIcon />}
                  >
                    Retry All
                  </Button>
                </Box>
              </Paper>
            )}

          {/* Question Selection and Filtering - Only show when data is ready */}
          {isDataReady && masterProjectDetails && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                2. Select Questions and Filter Data
              </Typography>

              <FormControl sx={{ minWidth: "100%", marginBottom: 2 }}>
                <InputLabel id="select-question">
                  {selectedQuestions.length === 0
                    ? GetContext("select_question_msg", lang)
                    : GetContext("select_question", lang)}{" "}
                </InputLabel>

                <Select
                  variant="standard"
                  id="select-question"
                  value={selectedQuestions}
                  multiple
                  onChange={handleQuestionChange}
                >
                  <MenuItem key="all" value="all">
                    {selectedQuestions.length ===
                    masterProjectDetails.questions.length
                      ? GetContext("unselect_all", lang)
                      : GetContext("select_all", lang)}
                  </MenuItem>
                  {masterProjectDetails.questions.map((item) => (
                    // @ts-ignore
                    <MenuItem key={item.id} value={item}>
                      {item.order != -1
                        ? typeof item.label === "object"
                          ? lang === "en"
                            ? item.label.en
                            : item.label.km
                          : item.label
                        : lang === "en"
                          ? typeof item.label === "object"
                            ? item.label.en
                            : item.label
                          : item.label_km ||
                            (typeof item.label === "object"
                              ? item.label.km
                              : item.label)}
                    </MenuItem>
                  ))}
                  {AddQuestions.map((item) => (
                    // @ts-ignore
                    <MenuItem key={item.id} value={item}>
                      {typeof item.label === "object"
                        ? lang === "en"
                          ? item.label.en
                          : item.label.km
                        : lang === "en"
                          ? item.label
                          : item.label_km || item.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {selectedQuestions.length > 0 && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenDrawer(true)}
                  >
                    {GetContext("filter", lang)}
                  </Button>
                )}

                {selectedQuestions.length > 0 && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => downloadFile()}
                  >
                    {GetContext("export", lang)}
                  </Button>
                )}

                {masterProjectDetails && (
                  <Button
                    variant="outlined"
                    onClick={() =>
                      isMapOpen ? setIsMapOpen(false) : setIsMapOpen(true)
                    }
                  >
                    {isMapOpen
                      ? GetContext("close_map", lang)
                      : GetContext("open_map", lang)}
                  </Button>
                )}
              </Box>
            </Paper>
          )}

          {/* Visualization Section */}
          {isDataReady &&
            selectedQuestions.length > 0 &&
            gridRows.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  3. Visualize Data
                </Typography>

                <FormControl sx={{ minWidth: "100%", marginBottom: 2 }}>
                  <InputLabel id="project-filter-label">
                    {!questionVisualize
                      ? GetContext("select_question_msg", lang)
                      : GetContext("select_question", lang)}{" "}
                  </InputLabel>

                  <Select
                    variant="standard"
                    labelId="project-filter-label"
                    id="question-visualize"
                    value={JSON.stringify(questionVisualize)}
                    onChange={handleQuestionVisualizeChange}
                  >
                    {selectedQuestions.map((item) => (
                      <MenuItem key={item.id} value={JSON.stringify(item)}>
                        {typeof item.label === "object"
                          ? lang === "en"
                            ? item.label.en
                            : item.label.km
                          : item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            )}

          {/* Chart Loading */}
          {questionVisualize && isChartLoading && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ height: "400px", width: "100%" }}
            >
              <CircularProgress />
            </Box>
          )}

          {/* Chart Display */}
          {!isChartLoading && questionVisualize && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
                <Button
                  onClick={handleDownloadChart}
                  sx={{ marginRight: 1 }}
                  variant="contained"
                  startIcon={<RefreshIcon />}
                >
                  {GetContext("export", lang)}
                </Button>
                <Button
                  sx={{ backgroundColor: "white", color: "black" }}
                  variant="contained"
                  onClick={handleCloseChart}
                  startIcon={<CloseIcon />}
                >
                  {GetContext("close", lang)}
                </Button>
              </Box>
              <div ref={chartRef}>
                <BarChart
                  dataset={dataset}
                  xAxis={[{ scaleType: "band", dataKey: "value" }]}
                  series={[
                    {
                      dataKey: "freq",
                      label:
                        typeof questionVisualize.label === "object"
                          ? lang === "en"
                            ? questionVisualize.label.en
                            : questionVisualize.label.km
                          : questionVisualize.label,
                    },
                  ]}
                  height={400}
                  yAxis={[{ label: GetContext("responses", lang) }]}
                />
              </div>
            </Paper>
          )}

          {/* Data Summary */}
          {isDataReady && masterProjectDetails && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Data Summary
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Box
                  sx={{ p: 1, border: "1px solid #e0e0e0", borderRadius: 1 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Total Projects
                  </Typography>
                  <Typography variant="h6">
                    {selectedProjects.length}
                  </Typography>
                </Box>

                <Box
                  sx={{ p: 1, border: "1px solid #e0e0e0", borderRadius: 1 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Total Records
                  </Typography>
                  <Typography variant="h6">{totalData}</Typography>
                </Box>

                <Box
                  sx={{ p: 1, border: "1px solid #e0e0e0", borderRadius: 1 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Selected Questions
                  </Typography>
                  <Typography variant="h6">
                    {selectedQuestions.length}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>

        {/* Map View */}
        {isDataReady && isMapOpen && (
          <Box
            sx={{ width: "100%", height: "400px", marginTop: "1rem", mb: 2 }}
          >
            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Map View
              </Typography>
              <Map data={dataMaps} />
            </Paper>
          </Box>
        )}

        {/* Data Grid */}
        {isDataReady && gridCols.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              4. Data Table
            </Typography>

            {selectedRows.length > 0 && (
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {selectedRows.length} Record Selected
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleEditRecord()}
                >
                  Edit
                </Button>
              </Box>
            )}

            <DataGrid
              columns={gridCols}
              rows={gridRows}
              rowCount={rowSize}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              loading={isDataLoading}
              autoHeight
              disableColumnFilter
              disableColumnSelector
              disableDensitySelector
              disableRowSelectionOnClick
              disableColumnSorting
              disableColumnMenu
              checkboxSelection
              rowSelectionModel={selectedRows}
              onRowSelectionModelChange={handleSelectionChange}
              pageSizeOptions={[10, 25, 50, 100]}
              slots={{
                toolbar: CustomToolbar,
                loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
              }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                },
              }}
              sx={{
                width: "100%",
                height: "100%",
                marginTop: "1rem",
              }}
            />
          </Paper>
        )}

        {/* Filter Drawer */}
        <Drawer
          key={drawerKey}
          anchor="right"
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          sx={{ zIndex: "1300" }}
        >
          <Box sx={{ width: 500, padding: "1rem" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                {GetContext("filter", lang)}
              </Typography>
              <IconButton onClick={() => setOpenDrawer(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Show all filters */}
            {filters.map((filter, index) => (
              <FilterItem
                key={index}
                filter={filter}
                index={index}
                handleFilterChange={handleFilterChange}
                lang={lang}
                GetContext={GetContext}
              />
            ))}

            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleFilter}
                startIcon={<RefreshIcon />}
              >
                {GetContext("filter", lang)}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearFilter}
                startIcon={<CloseIcon />}
              >
                {GetContext("clear_filter", lang)}
              </Button>
            </Box>
          </Box>
        </Drawer>
      </div>
    </AuthorizationCheck>
  );
};

export default DataView;
