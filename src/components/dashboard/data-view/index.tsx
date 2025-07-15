"use client";
import React, { useEffect, useState, ChangeEvent, useRef } from "react";
import axios from "axios";
const xlsx = require("json-as-xlsx");
import { GridColDef } from "@mui/x-data-grid";
import AuthorizationCheck from "@/components/AuthorizationCheck";
import { permissionCode } from "@/utils/permissionCode";
import useLang from "@/store/lang";
import DataViewSelectProjects from "./SelectProjects";
import SelectQuestionFilter from "./SelectQuestionFilter";
import VisualizationDataView from "./Visualization";
import DataViewTable from "./DataTable";
import FilterDrawer from "./filter/FilterDrawer";
import DataSummary from "./DataSummary";
import { SelectChangeEvent, Box, Typography } from "@mui/material";
import { Locale } from "@/types/projectDetail";
// import dynamic from 'next/dynamic';
// const Map = dynamic(() => import('@/components/dashboard/map'), { ssr: false });

interface Project {
  id: string;
  name: string | Locale;
}

export interface ProjectDetail {
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

export interface Question {
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

export interface ProjectLoadingStatus {
  projectId: string;
  projectName: string;
  status: "pending" | "loading" | "success" | "error";
  message?: string;
  color?: string;
}

const PROJECT_COLORS = [
  "#1976d2",
  "#388e3c",
  "#d32f2f",
  "#f57c00",
  "#7b1fa2",
  "#00796b",
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

  const [masterProjectDetails, setMasterProjectDetails] = useState<
    ProjectDetail[] | []
  >([]);
  const [selectedProjects, setSelectedProjects] = useState<{ id: string }[]>(
    [],
  );
  const [projectLoadingStatus, setProjectLoadingStatus] = useState<
    ProjectLoadingStatus[]
  >([]);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
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
  // temporary state
  const [groupFilters, setGroupFilters] = useState<GroupQuestionFilter[]>([]);
  // end
  const [drawerKey, setDrawerKey] = useState(0);
  const [questionVisualize, setQuestionVisualize] = useState<Question>();
  const [dataset, setDataset] = useState<any[]>([]);
  const [currentFilter, setCurrentFilter] = useState<QuestionFilter[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [dataMaps, setDataMaps] = useState<MapData[]>([]);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);

  // Helper function to get project name
  const getProjectName = (project: Project): string => {
    if (typeof project.name === "string") {
      return project.name;
    }
    return (
      project.name[lang as "en" | "km"] || project.name.en || "Unnamed Project"
    );
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

      const data = {
        projects: selectedProjects,
      };

      // console.log("Loading projects:", data);

      // Single API call to get questions and responses
      const response = await axios.post("/api/config", {
        endpoint: `responses/multiple-projects?lang=${lang}`,
        body: {
          projects: selectedProjects,
        },
      });

      const { projects, responses, count, total } = response.data.data;

      // Processing one questions - convert _id to id for consistency with existing code
      const processedQuestions = (questions: any, project_id: string) => {
        const result = questions.map((question: any) => ({
          ...question,
          id: question.id,
          label:
            typeof question.label === "object"
              ? question.label[lang] || question.label.en
              : question.label,
          label_km:
            typeof question.label === "object"
              ? question.label.km
              : question.label,
          project_id: project_id || "",
        }));

        return result;
      };

      // response row
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
            // condition wrong, missing fallback if there's no locale
            processedResponse[key] =
              value[lang] ?? value["en"] ?? value["km"] ?? "N/A";
          }
          // If it's already a string, keep it as is
        });

        return processedResponse;
      });

      // Create a simplified project detail structure
      const processedProjectDetails = projects.map((project: any) => ({
        id: project.id,
        name: lang == "en" ? project.name.en : project.name.km,
        questions: processedQuestions(project.questions, project.id),
        location_details: extractLocationDetails(responses),
        submitted_users: extractUniqueUsers(responses),
      }));

      // set all needed data
      setMasterProjectDetails(processedProjectDetails);
      setGridRows(processedResponses);
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
      const flatProject = selectedProjects[0].id;
      const response = await axios.post("/api/config", {
        endpoint: `responses/export/${flatProject}?lang=${lang}`,
        body,
      });
      const sheetData = [
        {
          sheet: "Sheet1",
          columns: response.data.data.col,
          content: response.data.data.con,
        },
      ];

      console.log(
        "📦 Exporting sheetData:",
        JSON.stringify(sheetData, null, 2),
      );
      xlsx(sheetData, settings);
    } catch (error) {
      console.error("Error exporting data:", error);
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

  // filter only the question and that has values
  function transformGroupFilters(groupFilters: any) {
    return {
      // @ts-ignore
      projects: groupFilters.map((project) => ({
        id: project.project_id,
        questions: project.filters
          // @ts-ignore
          .filter((filter) => filter.values && filter.values.length > 0)
          // @ts-ignore
          .map((filter) => ({
            index: filter.index,
            type: filter.type,
            values: filter.values,
          })),
      })),
    };
  }

  // Filter function
  const handleFilter = async () => {
    setIsDataLoading(true);
    setPaginationModel({
      page: 0,
      pageSize: paginationModel.pageSize,
    });
    setRowSize(0);
    setTotalData(0);
    setGridRows([]);

    try {
      const body = transformGroupFilters(groupFilters);

      console.log("Filtering with body:", body);

      // Single request with filters for all projects
      const response = await axios.post("/api/config", {
        endpoint: `responses/multiple-projects?lang=${lang}`,
        body: body,
      });

      console.log("Filter response:", response.data);

      const { responses, count, total } = response.data.data;

      // Process responses to extract the correct language values
      if (!responses || responses.length === 0 || responses === null) {
        console.log("No responses found for the selected projects.");
        setGridRows([]);
      } else {
        console.log("Processing responses 2...");
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
              // condition wrong, missing fallback if there's no locale
              processedResponse[key] =
                value[lang] || value["en"] || value["km"] || "N/A";
            }
            // If it's already a string, keep it as is
          });

          return processedResponse;
        });

        console.log("Processed responses:", processedResponses);
        setGridRows(processedResponses);
      }

      setRowSize(count);
      setTotalData(total);

      console.log("Filtered successfully:");
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

    setSelectedProjects(selectedValues.map((id) => ({ id })));

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
    setMasterProjectDetails([]);
    setIsDataReady(false);
  };

  // Remove a single project
  const handleRemoveProject = (projectId: string) => {
    setSelectedProjects((prev) => prev.filter((p) => p.id !== projectId));
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

  // Question visualize change
  const handleQuestionVisualizeChange = (event: SelectChangeEvent<string>) => {
    if (typeof event.target.value == "string") {
      const selectedQuestion = JSON.parse(event.target.value) as Question;
      setQuestionVisualize(selectedQuestion);
      getDataVisualization(selectedQuestion);
    }
  };

  const handleCloseChart = () => {
    setQuestionVisualize(undefined);
    setDataset([]);
  };

  useEffect(() => {
    if (singleProjectView && singleProjectDetail) {
      setSelectedProjects([{ id: singleProjectDetail.id }]);
      loadAllSelectedProjects();
    } else {
      fetchProjects();
    }
  }, []);

  // On pagination model change
  // useEffect(() => {
  //   console.log('trigger');
  //   if (selectedProjects.length > 0 && isDataReady) {
  //     setIsDataLoading(true);

  //     const loadData = async () => {
  //       try {
  //         const response = await axios.post('/api/config', {
  //           endpoint: `responses/multiple-projects?lang=${lang}&page=${paginationModel.page + 1}&limit=${
  //             paginationModel.pageSize
  //           }`,
  //           body: {
  //             project_ids: selectedProjects,
  //             filters: filters,
  //           },
  //         });

  //         const { questions, responses, count, total } = response.data.data;
  //         setGridRows(responses);
  //         setRowSize(count);
  //         setTotalData(total);
  //       } catch (error) {
  //         console.error('Error loading paginated data:', error);
  //       } finally {
  //         setIsDataLoading(false);
  //       }
  //     };

  //     loadData();
  //   }
  // }, [paginationModel, lang]);

  // Map grid col when selected questions changes
  useEffect(() => {
    const headerColumns: GridColDef[] = [];
    const groupFilterMap = new Map<string, GroupQuestionFilter>();

    // Define location type handlers
    const locationTypeHandlers = {
      user: (project: any) => project.submitted_users || [],
      province: (project: any) => project.location_details?.provinces || [],
      district: (project: any) => project.location_details?.districts || [],
      commune: (project: any) => project.location_details?.communes || [],
      village: (project: any) => project.location_details?.villages || [],
    };

    const getColumnLabel = (item: any): string => {
      if (typeof item.label === "object") {
        return lang === "en" ? item.label.en : item.label.km;
      }
      return item.label;
    };

    const createQuestionFilter = (
      item: any,
      colLabel: string,
      options: any[],
    ): QuestionFilter => ({
      label: colLabel,
      type: item.type,
      data_type: item.data_type,
      index:
        item.type === "user" ||
        item.type === "province" ||
        item.type === "district" ||
        item.type === "commune" ||
        item.type === "village"
          ? item.order
          : item.order - 1,
      values: [],
      options,
    });

    const addFilterToGroup = (
      projectId: string,
      projectName: string,
      filter: QuestionFilter,
    ) => {
      const existingGroup = groupFilterMap.get(projectId);

      if (existingGroup) {
        existingGroup.filters.push(filter);
      } else {
        groupFilterMap.set(projectId, {
          project_id: projectId,
          project_name: projectName,
          filters: [filter],
        });
      }
    };

    const handleLocationTypeQuestion = (
      item: any,
      colLabel: string,
      optionsGetter: (project: any) => any[],
    ) => {
      masterProjectDetails.forEach((project) => {
        const options = optionsGetter(project);
        const filter = createQuestionFilter(item, colLabel, options);
        addFilterToGroup(project.id, getProjectName(project), filter);
      });
    };

    const handleRegularQuestion = (item: any, colLabel: string) => {
      const projectId = item.project_id || "";
      const projectName =
        item.project_name ||
        getProjectName(
          projects.find((p) => p.id === item.project_id) || {
            id: "",
            name: "",
          },
        );

      const filter = createQuestionFilter(item, colLabel, item.options || []);
      addFilterToGroup(projectId, projectName, filter);
    };

    // Process each selected question
    selectedQuestions.forEach((item) => {
      const colLabel = getColumnLabel(item);

      // Handle different question types
      if (item.type in locationTypeHandlers) {
        console.log(
          `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} type question selected`,
        );
        handleLocationTypeQuestion(
          item,
          colLabel,
          locationTypeHandlers[item.type as keyof typeof locationTypeHandlers],
        );
      } else {
        handleRegularQuestion(item, colLabel);
      }

      const textLength = colLabel.length;
      const estimatedWidth = Math.max(100, textLength * 3); // ~10px per character

      headerColumns.push({
        field: item.id,
        headerName: colLabel,
        cellClassName: "text-left no-wrap-text",
        width: estimatedWidth,
        minWidth: estimatedWidth,
      });
    });

    const tempGroupFilter = Array.from(groupFilterMap.values());
    console.log("tempGroupFilter", tempGroupFilter);

    setGridCols(headerColumns);
    setGroupFilters(tempGroupFilter);
  }, [selectedQuestions, lang, masterProjectDetails]);

  return (
    <AuthorizationCheck requiredPermissions={permissionCode.viewDataView}>
      <div>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Data View
          </Typography>

          {/* 1 . Project Selection */}
          <DataViewSelectProjects
            singleProjectView={singleProjectView}
            singleProjectName={singleProjectDetail?.name.en || "Unknown"}
            selectedProjects={selectedProjects}
            handleProjectChange={handleProjectChange}
            projects={projects}
            getProjectName={getProjectName}
            handleRemoveProject={handleRemoveProject}
            projectLoadingStatus={projectLoadingStatus}
            loadAllSelectedProjects={loadAllSelectedProjects}
            isLoadingProjects={isLoadingProjects}
          />

          {/* 2 . Question Selection and Filtering - Only show when data is ready */}
          {isDataReady && (
            <SelectQuestionFilter
              masterProjectDetails={masterProjectDetails}
              selectedQuestions={selectedQuestions}
              setSelectedQuestions={setSelectedQuestions}
              setOpenDrawer={setOpenDrawer}
              downloadFile={downloadFile}
            />
          )}

          {/* 3. Visual */}
          {/* {isDataReady && (
            <VisualizationDataView
              selectedQuestions={selectedQuestions}
              gridRows={gridRows}
              dataset={dataset}
              handleCloseChart={handleCloseChart}
              isChartLoading={isChartLoading}
              questionVisualize={questionVisualize}
              handleQuestionVisualizeChange={handleQuestionVisualizeChange}
            />
          )} */}

          {/* Data Summary */}
          {isDataReady && masterProjectDetails && (
            <DataSummary
              selectedProjects={selectedProjects}
              totalData={totalData}
              selectedQuestions={selectedQuestions}
            />
          )}
        </Box>

        {/* Map View */}
        {/* {isDataReady && isMapOpen && (
          <Box sx={{ width: '100%', height: '400px', marginTop: '1rem', mb: 2 }}>
            <Paper variant='outlined' sx={{ p: 2, height: '100%' }}>
              <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                Map View
              </Typography>
              <Map data={dataMaps} />
            </Paper>
          </Box>
        )} */}

        {/* Data Grid */}
        {isDataReady && (
          <DataViewTable
            gridCols={gridCols}
            gridRows={gridRows}
            rowSize={rowSize}
            paginationModel={paginationModel}
            setPaginationModel={setPaginationModel}
            isDataLoading={isDataLoading}
          />
        )}

        {/* Filter Drawer */}
        <FilterDrawer
          drawerKey={drawerKey}
          groupFilters={groupFilters}
          setGroupFilters={setGroupFilters}
          handleClearFilter={handleClearFilter}
          handleFilter={handleFilter}
          openDrawer={openDrawer}
          setOpenDrawer={setOpenDrawer}
        />
      </div>
    </AuthorizationCheck>
  );
};

export default DataView;
