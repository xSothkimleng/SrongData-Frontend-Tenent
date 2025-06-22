'use client';
import React, { useEffect, useState, ChangeEvent, useRef } from 'react';
import axios from 'axios';
const xlsx = require('json-as-xlsx');
import { GridColDef } from '@mui/x-data-grid';
import AuthorizationCheck from '@/components/AuthorizationCheck';
import { permissionCode } from '@/utils/permissionCode';
import useLang from '@/store/lang';
import DataViewSelectProjects from './SelectProjects';
import SelectQuestionFilter from './SelectQuestionFilter';
import VisualizationDataView from './Visualization';
import DataViewTable from './DataTable';
import FilterDrawer from './filter/FilterDrawer';
import DataSummary from './DataSummary';
import { SelectChangeEvent, Box, Typography } from '@mui/material';
// import dynamic from 'next/dynamic';
// const Map = dynamic(() => import('@/components/dashboard/map'), { ssr: false });

interface Project {
  id: string;
  name: string | { en: string; km: string };
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
  status: 'pending' | 'loading' | 'success' | 'error';
  message?: string;
  color?: string;
}

const PROJECT_COLORS = ['#1976d2', '#388e3c', '#d32f2f', '#f57c00', '#7b1fa2', '#00796b'];

interface dataViewProps {
  singleProjectView?: boolean;
  singleProjectDetail?: {
    id: string;
    name: { en?: string; km?: string };
  };
}

const DataView: React.FC<dataViewProps> = ({ singleProjectView = false, singleProjectDetail }) => {
  const lang = useLang(state => state.lang);

  const [masterProjectDetails, setMasterProjectDetails] = useState<ProjectDetail[] | []>([]);
  const [selectedProjects, setSelectedProjects] = useState<{ id: string }[]>([]);
  const [projectLoadingStatus, setProjectLoadingStatus] = useState<ProjectLoadingStatus[]>([]);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [gridCols, setGridCols] = useState<GridColDef[]>([]);
  const [gridRows, setGridRows] = useState<{ [key: string]: string | { en: string; km: string } }[]>([]);
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
    if (typeof project.name === 'string') {
      return project.name;
    }
    return project.name[lang as 'en' | 'km'] || project.name.en || 'Unnamed Project';
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
      setProjectLoadingStatus(prev => prev.map(p => ({ ...p, status: 'loading' })));

      const data = {
        projects: selectedProjects,
      };

      console.log('Loading projects:', data);

      // Single API call to get questions and responses
      const response = await axios.post('/api/config', {
        endpoint: `responses/multiple-projects?lang=${lang}`,
        body: {
          projects: selectedProjects,
        },
      });

      console.log('API response:', response.data);
      const { projects, responses, count, total } = response.data.data;
      console.log('API DATA Projects:', projects);
      console.log('API DATA Responses:', responses);
      console.log('API DATA Total:', total);

      // Processing one questions - convert _id to id for consistency with existing code
      const processedQuestions = (questions: any, project_id: string) => {
        const result = questions.map((question: any) => ({
          ...question,
          id: question.id,
          label: typeof question.label === 'object' ? question.label[lang] || question.label.en : question.label,
          label_km: typeof question.label === 'object' ? question.label.km : question.label,
          project_id: project_id || '',
        }));

        return result;
      };

      // Process responses to extract the correct language values
      const processedResponses = responses.map((response: any) => {
        const processedResponse = { ...response };

        // Process each field in the response
        Object.keys(processedResponse).forEach(key => {
          const value = processedResponse[key];

          // If the value is an object with 'en' and 'km' properties
          if (value && typeof value === 'object' && ('en' in value || 'km' in value)) {
            // Use the current language, fallback to 'en' if the selected language doesn't exist
            // condition wrong, missing fallback if there's no locale
            processedResponse[key] = value[lang] || value['en'] || value['km'] || 'N/A';
          }
          // If it's already a string, keep it as is
        });

        return processedResponse;
      });

      // Create a simplified project detail structure
      const processedProjectDetails = projects.map((project: any) => ({
        id: project.id,
        name: lang == 'en' ? project.name.en : project.name.km,
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
      setProjectLoadingStatus(prev =>
        prev.map(p => ({
          ...p,
          status: 'success',
          message: 'Loaded successfully',
        })),
      );

      setIsDataReady(true);
    } catch (error) {
      console.error('Error loading projects:', error);
      // Update all project statuses to error
      setProjectLoadingStatus(prev => prev.map(p => ({ ...p, status: 'error', message: 'Failed to load' })));
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

    responses.forEach(response => {
      if (response.province) provinces.add(response.province);
      if (response.district) districts.add(response.district);
      if (response.commune) communes.add(response.commune);
      if (response.village) villages.add(response.village);
    });

    return {
      provinces: Array.from(provinces).map(name => ({
        id: name,
        name_en: name,
        name_km: name,
      })),
      districts: Array.from(districts).map(name => ({
        id: name,
        name_en: name,
        name_km: name,
      })),
      communes: Array.from(communes).map(name => ({
        id: name,
        name_en: name,
        name_km: name,
      })),
      villages: Array.from(villages).map(name => ({
        id: name,
        name_en: name,
        name_km: name,
      })),
    };
  };

  // Helper function to extract unique users from responses
  const extractUniqueUsers = (responses: any[]) => {
    const users = new Set();

    responses.forEach(response => {
      if (response.user) {
        users.add(response.user);
      }
    });

    return Array.from(users).map(userName => ({
      id: userName,
      first_name: (userName as string).split(' ')[0] || userName,
      last_name: (userName as string).split(' ').slice(1).join(' ') || '',
    }));
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/config', {
        params: { endpoint: 'project/all?status=1,2' },
      });
      setProjects(response.data.data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    if (singleProjectView && singleProjectDetail) {
      setSelectedProjects([{ id: singleProjectDetail.id }]);
      loadAllSelectedProjects();
    } else {
      fetchProjects();
    }
  }, []);

  const downloadFile = async () => {
    const settings = {
      fileName: 'multi_project_data',
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
      selectedQuestions.map(question => {
        if (question.order != -1) {
          body.selected_question_indexs.push(question.order - 1);
        } else {
          if (question.type == 'province') {
            body.is_province = true;
          } else if (question.type == 'district') {
            body.is_district = true;
          } else if (question.type == 'commune') {
            body.is_commune = true;
          } else if (question.type == 'user') {
            body.is_submit_user = true;
          }
        }
      });
      const response = await axios.post('/api/config', {
        endpoint: `responses/export/${selectedProjects}?lang=${lang}`,
        body,
      });
      const sheetData = [
        {
          sheet: 'Sheet1',
          columns: response.data.data.col,
          content: response.data.data.con,
        },
      ];
      xlsx(sheetData, settings);
    } catch (error) {
      console.error('Error exporting data:', error);
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

      const response = await axios.post('/api/config', {
        endpoint: `responses/visualize`,
        body,
      });

      setDataset(response.data.data);
      setIsChartLoading(false);
    } catch (error) {
      setIsChartLoading(false);
      setDataset([]);
      console.error('Error fetching visualization data:', error);
    }
  };

  // Clear all value in filter
  const handleClearFilter = async () => {
    var newFilter = filters;
    newFilter.map(filter => {
      filter.values = [];
    });
    setFilters(newFilter);
    setDrawerKey(prevKey => prevKey + 1);
  };

  // filter all the question
  // function transformGroupFilters(groupFilters: any) {
  //   return {
  //     // @ts-ignore
  //     projects: groupFilters.map(project => ({
  //       id: project.project_id,
  //       // @ts-ignore
  //       questions: project.filters.map(filter => ({
  //         index: filter.index,
  //         type: filter.type,
  //         values: filter.values || [],
  //       })),
  //     })),
  //   };
  // }

  // filter only the question and that has values
  function transformGroupFilters(groupFilters: any) {
    return {
      // @ts-ignore
      projects: groupFilters.map(project => ({
        id: project.project_id,
        questions: project.filters
          // @ts-ignore
          .filter(filter => filter.values && filter.values.length > 0)
          // @ts-ignore
          .map(filter => ({
            index: filter.index,
            type: filter.type,
            values: filter.values,
          })),
      })),
    };
  }

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
      // console.log('filter body: ', filters);
      console.log('Group Filters: ', groupFilters);
      const body = transformGroupFilters(groupFilters);
      console.log('Transformed Group Filters:', { body });
      // Single request with filters for all projects
      const response = await axios.post('/api/config', {
        endpoint: `responses/multiple-projects?lang=${lang}`,
        body: body,
      });

      console.log('API response for filter:', response.data);

      const { project, responses, count, total } = response.data.data;
      console.log('Filtered project:', project);
      console.log('Filtered responses:', responses);
      console.log('Filtered count:', count);
      console.log('Filtered total:', total);

      // Process questions - convert _id to id for consistency with existing code
      // const processedQuestions = questions.map((question: any) => ({
      //   ...question,
      //   id: question._id, // Map _id to id for DataGrid compatibility
      //   label: typeof question.label === 'object' ? question.label[lang] || question.label.en : question.label,
      //   label_km: typeof question.label === 'object' ? question.label.km : question.label,
      // }));

      // console.log('New questionnaire: ', responses);

      // Process responses to extract the correct language values
      // const processedResponses = responses.map((response: any) => {
      //   const processedResponse = { ...response };

      //   // Process each field in the response
      //   Object.keys(processedResponse).forEach(key => {
      //     const value = processedResponse[key];

      //     // If the value is an object with 'en' and 'km' properties
      //     if (value && typeof value === 'object' && ('en' in value || 'km' in value)) {
      //       // Use the current language, fallback to 'en' if the selected language doesn't exist
      //       processedResponse[key] = value[lang] || value['en'] || value['km'] || 'N/A';
      //     }
      //     // If it's already a string, keep it as is
      //   });

      //   return processedResponse;
      // });

      // console.log('process response: ', processedResponses);
      // setGridRows(processedResponses);
      // setRowSize(count);
      // setTotalData(total);
      console.log('Filtered');
    } catch (error) {
      console.error('Error filtering data:', error);
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

    setSelectedProjects(selectedValues.map(id => ({ id })));

    console.log('Selected projects:', selectedValues);

    // Setup project colors for each selected project
    const newProjectStatus: ProjectLoadingStatus[] = [];

    selectedValues.forEach((projectId, index) => {
      const project = projects.find(p => p.id === projectId);
      const projectName = project ? getProjectName(project) : projectId;
      const colorIndex = index % PROJECT_COLORS.length;

      newProjectStatus.push({
        projectId,
        projectName,
        status: 'pending',
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
    setSelectedProjects(prev => prev.filter(p => p.id !== projectId));
    setProjectLoadingStatus(prev => prev.filter(p => p.projectId !== projectId));
    setGridRows(prev => prev.filter(row => row.project_id !== projectId));
    setDataMaps(prev => prev.filter(item => item.project_id !== projectId));

    const removeCount = gridRows.filter(row => row.project_id === projectId).length;
    setRowSize(prev => prev - removeCount);

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
    if (typeof event.target.value == 'string') {
      const selectedQuestion = JSON.parse(event.target.value) as Question;
      setQuestionVisualize(selectedQuestion);
      getDataVisualization(selectedQuestion);
    }
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
          const response = await axios.post('/api/config', {
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
          console.error('Error loading paginated data:', error);
        } finally {
          setIsDataLoading(false);
        }
      };

      loadData();
    }
  }, [paginationModel, lang]);

  // Map grid col when selected questions changes
  useEffect(() => {
    var headerColumn: GridColDef[] = [];
    var tempQuestion: QuestionFilter[] = [];
    let tempGroupFilter: GroupQuestionFilter[] = [];

    selectedQuestions.map(item => {
      // console.log('Selected Question in main:', item);
      // Get Label for DataGrid header
      let colLabel: string;
      if (typeof item.label === 'object') {
        colLabel = lang === 'en' ? item.label.en : item.label.km;
      } else {
        colLabel = item.label;
      }

      // Get Filter item by grouping
      // filter out question that are not selected from the project in masterProjectDetails
      if (masterProjectDetails && !masterProjectDetails.some(p => p.questions.some(q => q.id === item.id))) {
        console.warn(`Question with id ${item.id} not found in selected projects`);
        return;
      }

      // const addStaticQuestionFilter = () => {
      //   if (item.type == 'user') {
      //     if (masterProjectDetails) {
      //       if (masterProjectDetails.submitted_users.length > 0) {
      //         tempQuestion.push({
      //           label:
      //             typeof item.label === 'object'
      //               ? lang === 'en'
      //                 ? item.label.en
      //                 : item.label.km
      //               : lang === 'en'
      //               ? item.label
      //               : item.label_km || item.label,
      //           type: item.type,
      //           data_type: item.data_type,
      //           index: item.order,
      //           values: [],
      //           options: masterProjectDetails.submitted_users,
      //         });
      //       }
      //     }
      //   } else if (item.type == 'province') {
      //     tempQuestion.push({
      //       label:
      //         typeof item.label === 'object'
      //           ? lang === 'en'
      //             ? item.label.en
      //             : item.label.km
      //           : lang === 'en'
      //           ? item.label
      //           : item.label_km || item.label,
      //       type: item.type,
      //       data_type: item.data_type,
      //       index: item.order,
      //       values: [],
      //       options: masterProjectDetails ? masterProjectDetails.location_details.provinces : [],
      //     });
      //   } else if (item.type == 'district') {
      //     tempQuestion.push({
      //       label:
      //         typeof item.label === 'object'
      //           ? lang === 'en'
      //             ? item.label.en
      //             : item.label.km
      //           : lang === 'en'
      //           ? item.label
      //           : item.label_km || item.label,
      //       type: item.type,
      //       data_type: item.data_type,
      //       index: item.order,
      //       values: [],
      //       options: masterProjectDetails ? masterProjectDetails.location_details.districts : [],
      //     });
      //   } else if (item.type == 'commune') {
      //     tempQuestion.push({
      //       label:
      //         typeof item.label === 'object'
      //           ? lang === 'en'
      //             ? item.label.en
      //             : item.label.km
      //           : lang === 'en'
      //           ? item.label
      //           : item.label_km || item.label,
      //       type: item.type,
      //       data_type: item.data_type,
      //       index: item.order,
      //       values: [],
      //       options: masterProjectDetails ? masterProjectDetails.location_details.communes : [],
      //     });
      //   } else if (item.type == 'village') {
      //     tempQuestion.push({
      //       label:
      //         typeof item.label === 'object'
      //           ? lang === 'en'
      //             ? item.label.en
      //             : item.label.km
      //           : lang === 'en'
      //           ? item.label
      //           : item.label_km || item.label,
      //       type: item.type,
      //       data_type: item.data_type,
      //       index: item.order,
      //       values: [],
      //       options: masterProjectDetails ? masterProjectDetails.location_details.villages : [],
      //     });
      //   } else if (item.type == 'project') {
      //     tempQuestion.push({
      //       label:
      //         typeof item.label === 'object'
      //           ? lang === 'en'
      //             ? item.label.en
      //             : item.label.km
      //           : lang === 'en'
      //           ? item.label
      //           : item.label_km || item.label,
      //       type: item.type,
      //       data_type: item.data_type,
      //       index: item.order,
      //       values: [],
      //       options: item.options,
      //     });
      //   } else {
      //     tempQuestion.push({
      //       label: typeof item.label === 'object' ? (lang === 'en' ? item.label.en : item.label.km) : item.label,
      //       type: item.type,
      //       data_type: item.data_type,
      //       index: item.order - 1,
      //       values: [],
      //       options: item.options,
      //     });
      //   }
      // };

      // create Group Question Filter
      const groupFilter: GroupQuestionFilter = {
        project_id: item.project_id || '',
        project_name: item.project_name || getProjectName(projects.find(p => p.id === item.project_id) || { id: '', name: '' }),
        filters: [
          {
            label: colLabel,
            type: item.type,
            data_type: item.data_type,
            index: item.order - 1,
            values: [],
            options: item.options || [],
          },
        ],
      };

      // Check if the project already exists in groupFilters
      const existingGroup = tempGroupFilter.find(g => g.project_id === groupFilter.project_id);
      if (existingGroup) {
        // If it exists, add the filter to the existing group
        existingGroup.filters.push(...groupFilter.filters);
        tempGroupFilter = tempGroupFilter.map(g => (g.project_id === groupFilter.project_id ? existingGroup : g));
      } else {
        // If it doesn't exist, add the new group
        tempGroupFilter.push(groupFilter);
      }

      // Add column to the grid
      headerColumn.push({
        field: item.id,
        headerName: colLabel,
        cellClassName: 'text-left',
      });
    });

    console.log('tempGroupFilter', tempGroupFilter);

    setGridCols(headerColumn);
    setFilters(tempQuestion);
    setGroupFilters(tempGroupFilter);
  }, [selectedQuestions, lang, masterProjectDetails]);

  return (
    <AuthorizationCheck requiredPermissions={permissionCode.viewDataView}>
      <div>
        <Box sx={{ mb: 4 }}>
          <Typography variant='h5' fontWeight='bold' gutterBottom>
            Data View
          </Typography>

          {/* 1 . Project Selection */}
          <DataViewSelectProjects
            singleProjectView={singleProjectView}
            singleProjectName={singleProjectDetail?.name.en || 'Unknown'}
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
            <DataSummary selectedProjects={selectedProjects} totalData={totalData} selectedQuestions={selectedQuestions} />
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
