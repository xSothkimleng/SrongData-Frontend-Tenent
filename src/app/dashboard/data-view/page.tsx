'use client';
import React, { useEffect, useState, ChangeEvent, useRef } from 'react';
import { styled } from '@mui/system';
import { BarChart } from '@mui/x-charts/BarChart';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import dynamic from 'next/dynamic';
import html2canvas from 'html2canvas';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
const Map = dynamic(() => import('@/components/dashboard/map'), { ssr: false });
const xlsx = require('json-as-xlsx');
import { DataGrid, GridColDef, GridToolbarQuickFilter } from '@mui/x-data-grid';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Button,
  Drawer,
  TextField,
  Checkbox,
  ListItemText,
  CircularProgress,
  Typography,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Stack,
  LinearProgress,
  Card,
  CardContent,
} from '@mui/material';
import AuthorizationCheck from '@/components/AuthorizationCheck';
import { permissionCode } from '@/utils/permissionCode';
import useLang from '@/store/lang';
import { GetContext } from '@/utils/language';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CancelIcon from '@mui/icons-material/Cancel';

interface Project {
  id: string;
  name: string | { en: string; km: string };
}

interface Location {
  province: string;
  district: string;
  commune: string;
  village: string;
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
  order: number;
  label: string;
  label_km: string;
  type: string;
  data_type: string;
  options: any[];
  project_id?: string;
  project_name?: string;
  color?: string;
}

interface QuestionFilter {
  label: string;
  type: string;
  data_type: string;
  index: number;
  values: any[];
  options: any[];
  project_id?: string;
  color?: string;
}

interface ProjectLoadingStatus {
  projectId: string;
  projectName: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  message?: string;
  color?: string;
}

interface BulkProjectData {
  projects: {
    [projectId: string]: {
      details: any;
      responses: any[];
      mapData: any[];
      count: number;
      total: number;
    };
  };
}

const MAX_RECOMMENDED_PROJECTS = 3;

const PROJECT_COLORS = [
  '#1976d2', // blue
  '#388e3c', // green
  '#d32f2f', // red
  '#f57c00', // orange
  '#7b1fa2', // purple
  '#00796b', // teal
];

const AddQuestions: Question[] = [
  {
    id: 'user',
    order: -1,
    label: 'Submitted By',
    label_km: 'អ្នកបញ្ខូលទិន្នន័យ',
    type: 'user',
    data_type: 'array',
    options: [],
  },
  {
    id: 'province',
    order: -1,
    label: 'Provinces',
    label_km: 'ខេត្ត',
    type: 'province',
    data_type: 'array',
    options: [],
  },
  {
    id: 'district',
    order: -1,
    label: 'District',
    label_km: 'ស្រុក',
    type: 'district',
    data_type: 'array',
    options: [],
  },
  {
    id: 'commune',
    order: -1,
    label: 'Commune',
    label_km: 'ឃុំ',
    type: 'commune',
    data_type: 'array',
    options: [],
  },
  {
    id: 'village',
    order: -1,
    label: 'Village',
    label_km: 'ភូមិ',
    type: 'village',
    data_type: 'array',
    options: [],
  },
  {
    id: 'project',
    order: -1,
    label: 'Project',
    label_km: 'គម្រោង',
    type: 'project',
    data_type: 'array',
    options: [],
  },
];

const ActionCell: React.FC<{ row: Project }> = ({ row }) => (
  <div>
    <Button variant='contained' color='primary' sx={{ borderRadius: '28px' }}>
      <ManageAccountsIcon />
    </Button>
    <Button variant='contained' color='secondary' sx={{ borderRadius: '28px', margin: '0 0.5rem' }}>
      <DeleteIcon />
    </Button>
  </div>
);

const CustomQuickFilter = styled(GridToolbarQuickFilter)(({ theme }) => ({
  padding: '1rem 0',
  '& .MuiSvgIcon-root': {
    fontSize: '2rem !important',
    color: theme.palette.primary.main,
  },
  '& .MuiInputBase-input': {
    fontSize: '1.5rem !important',
  },
}));

interface FilterItemProps {
  filter: QuestionFilter;
  index: number;
  handleFilterChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<any[]>,
    index: number,
    numValue?: number,
  ) => void;
  lang: string;
  GetContext: (key: string, lang: string) => string;
}

const FilterItem: React.FC<FilterItemProps> = ({ filter, index, handleFilterChange, lang, GetContext }) => {
  return (
    <div>
      {!(filter.data_type == 'date' || filter.data_type == 'time') && (
        <InputLabel
          sx={{
            marginBottom: '5px',
            color: filter.color && 'text.primary',
          }}>
          <Box
            component='span'
            sx={{
              fontWeight: 'bold',
              ...(filter.color && { borderLeft: `3px solid ${filter.color}`, paddingLeft: '6px' }),
            }}>
            {filter.label}
          </Box>
        </InputLabel>
      )}

      {filter.data_type == 'string' && (
        <TextField
          onChange={event => {
            handleFilterChange(event, index);
          }}
          value={filter.values[0] || ''}
          fullWidth
          sx={{ marginBottom: '10px' }}
          label={GetContext('enter_text', lang)}
          variant='outlined'
        />
      )}

      {filter.data_type == 'number' && (
        <Stack direction='row' spacing={1} sx={{ marginBottom: '10px' }}>
          <TextField
            onChange={event => {
              handleFilterChange(event, index, 1);
            }}
            value={filter.values[0] || ''}
            sx={{ flex: 1 }}
            type='number'
            label={GetContext('enter_first_num', lang)}
            variant='outlined'
          />
          <TextField
            onChange={event => {
              handleFilterChange(event, index, 2);
            }}
            value={filter.values[1] || ''}
            sx={{ flex: 1 }}
            type='number'
            label={GetContext('enter_second_num', lang)}
            variant='outlined'
          />
        </Stack>
      )}

      {filter.data_type == 'array' && filter.index != -1 && (
        <FormControl fullWidth sx={{ marginBottom: '10px' }}>
          <InputLabel id={`multi-select-label-${index}`}>{GetContext('select_option', lang)}</InputLabel>
          <Select
            labelId={`multi-select-label-${index}`}
            multiple
            value={filter.values}
            onChange={event => {
              handleFilterChange(event, index);
            }}
            renderValue={selected => {
              return selected
                .map(value => {
                  return filter.options[value];
                })
                .join(', ');
            }}>
            {filter.options.map((option, i) => (
              <MenuItem key={i} value={i}>
                <Checkbox checked={filter.values.indexOf(i) > -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {filter.data_type == 'array' && filter.index == -1 && filter.type != 'user' && filter.type != 'project' && (
        <FormControl fullWidth sx={{ marginBottom: '10px' }}>
          <InputLabel id={`multi-select-label-${index}`}>{GetContext('select_option', lang)}</InputLabel>
          <Select
            labelId={`multi-select-label-${index}`}
            multiple
            value={filter.values}
            onChange={event => {
              handleFilterChange(event, index);
            }}
            renderValue={selected => {
              return selected
                .map(value => {
                  const option = filter.options.find(option => value == option.id);
                  return option ? (lang == 'en' ? option.name_en : option.name_km) : '';
                })
                .join(', ');
            }}>
            {filter.options.map((option, i) => (
              <MenuItem key={i} value={option.id}>
                <Checkbox checked={filter.values.indexOf(option.id) > -1} />
                <ListItemText primary={lang == 'en' ? option.name_en : option.name_km} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {filter.data_type == 'array' && filter.index == -1 && filter.type == 'project' && (
        <FormControl fullWidth sx={{ marginBottom: '10px' }}>
          <InputLabel id={`multi-select-label-${index}`}>{GetContext('select_option', lang)}</InputLabel>
          <Select
            labelId={`multi-select-label-${index}`}
            multiple
            value={filter.values}
            onChange={event => {
              handleFilterChange(event, index);
            }}
            renderValue={selected => {
              return selected
                .map(value => {
                  const option = filter.options.find(option => value == option.id);
                  return option ? option.name_en : '';
                })
                .join(', ');
            }}>
            {filter.options.map((option, i) => (
              <MenuItem key={i} value={option.id}>
                <Checkbox checked={filter.values.indexOf(option.id) > -1} />
                <ListItemText primary={option.name_en} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {filter.data_type == 'array' && filter.index == -1 && filter.type == 'user' && (
        <FormControl fullWidth sx={{ marginBottom: '10px' }}>
          <InputLabel id={`multi-select-label-${index}`}>{GetContext('select_option', lang)}</InputLabel>
          <Select
            labelId={`multi-select-label-${index}`}
            multiple
            value={filter.values}
            onChange={event => {
              handleFilterChange(event, index);
            }}
            renderValue={selected => {
              return selected
                .map(value => {
                  const option = filter.options.find(option => value == option.id);
                  return option ? option.first_name + ' ' + option.last_name : '';
                })
                .join(', ');
            }}>
            {filter.options.map((option, i) => (
              <MenuItem key={i} value={option.id}>
                <Checkbox checked={filter.values.indexOf(option.id) > -1} />
                <ListItemText primary={option.first_name + ' ' + option.last_name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </div>
  );
};

const ProjectLegend: React.FC<{ projects: ProjectLoadingStatus[] }> = ({ projects }) => {
  if (projects.length <= 1) return null;

  return (
    <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
      <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
        Project Legend
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {projects.map(project => (
          <Chip
            key={project.projectId}
            label={project.projectName}
            sx={{
              backgroundColor: project.color,
              color: '#fff',
              fontWeight: 'bold',
            }}
          />
        ))}
      </Box>
    </Paper>
  );
};

const DataViewPage = () => {
  const lang = useLang(state => state.lang);
  const chartRef = useRef<HTMLDivElement>(null);

  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projectLoadingStatus, setProjectLoadingStatus] = useState<ProjectLoadingStatus[]>([]);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsDetails, setProjectsDetails] = useState<{ [projectId: string]: ProjectDetail }>({});
  const [masterProjectDetails, setMasterProjectDetails] = useState<ProjectDetail | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [gridCols, setGridCols] = useState<GridColDef[]>([]);
  const [gridRows, setGridRows] = useState<{ [key: string]: any }[]>([]);
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
  const [showTooManyProjectsWarning, setShowTooManyProjectsWarning] = useState(false);

  // Helper function to get project name
  const getProjectName = (project: Project): string => {
    if (typeof project.name === 'string') {
      return project.name;
    }
    return project.name[lang] || project.name.en || 'Unnamed Project';
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/config', { params: { endpoint: 'project/all?status=1,2' } });
        setProjects(response.data.data.projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const downloadFile = async () => {
    const settings = {
      fileName: 'multi_project_data',
      extraLength: 3,
      writeOptions: {},
    };
    try {
      let body = {
        project_ids: selectedProjects,
        filters: currentFilter,
        selected_questions: selectedQuestions,
        lang: lang,
      };

      const response = await axios.post('/api/config', {
        endpoint: `responses/export-multiple`,
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

  // Process bulk project data response
  const processBulkProjectData = (bulkData: any) => {
    // Check if the response has the expected structure
    if (!bulkData || (!bulkData.projects && !bulkData.responses)) {
      console.error('Invalid bulk data structure:', bulkData);
      return;
    }

    // If the response has a 'projects' property (new bulk structure)
    if (bulkData.projects) {
      const newProjectsDetails: { [projectId: string]: ProjectDetail } = {};
      const allGridRows: any[] = [];
      const allMapData: MapData[] = [];
      let totalRowSize = 0;
      let totalDataCount = 0;

      // Process each project's data
      Object.entries(bulkData.projects).forEach(([projectId, projectData]: [string, any]) => {
        const projectStatus = projectLoadingStatus.find(p => p.projectId === projectId);
        const projectColor = projectStatus?.color || '#000000';
        const projectName = projectData.details.name;

        // 1. Process project details
        const enhancedQuestions = projectData.details.questions.map((q: Question) => ({
          ...q,
          project_id: projectId,
          project_name: projectName,
          color: projectColor,
        }));

        newProjectsDetails[projectId] = {
          ...projectData.details,
          questions: enhancedQuestions,
        };

        // 2. Process responses
        const enhancedResponses = projectData.responses.map((item: any) => ({
          ...item,
          project_id: projectId,
          project_name: projectName,
          color: projectColor,
        }));
        allGridRows.push(...enhancedResponses);

        // 3. Process map data
        if (projectData.mapData) {
          const enhancedMapData = projectData.mapData.map((item: MapData) => ({
            ...item,
            project_id: projectId,
            project_name: projectName,
            color: projectColor,
          }));
          allMapData.push(...enhancedMapData);
        }

        // 4. Update counts
        totalRowSize += projectData.count || 0;
        totalDataCount += projectData.total || 0;
      });

      // Update all state at once
      setProjectsDetails(newProjectsDetails);
      setGridRows(allGridRows);
      setDataMaps(allMapData);
      setRowSize(totalRowSize);
      setTotalData(totalDataCount);
    }
    // If the response is a simple response array (current structure)
    else if (bulkData.responses !== undefined) {
      // For now, just set the responses
      // This looks like you're getting responses without project details
      setGridRows(bulkData.responses || []);
      setRowSize(bulkData.count || 0);
      setTotalData(bulkData.total || 0);

      // You'll need to load project details separately if not included
      console.warn('Received responses without project details. You may need to load project details separately.');
    }
  };

  // Load all selected projects with bulk API
  const loadAllSelectedProjects = async () => {
    setIsLoadingProjects(true);
    setIsDataLoading(true);
    setIsDataReady(false);

    // Reset counters and data
    setRowSize(0);
    setTotalData(0);
    setGridRows([]);
    setDataMaps([]);

    try {
      // Update all project statuses to loading
      setProjectLoadingStatus(prev => prev.map(p => ({ ...p, status: 'loading' })));

      // First, we need to check what endpoint structure your backend actually supports
      // Option 1: If backend returns project details + responses in one call
      const response = await axios.post('/api/config', {
        endpoint: `responses/multiple-projects?lang=${lang}`,
        body: {
          project_ids: selectedProjects,
        },
      });

      // Check the actual response structure
      console.log('Bulk API response structure:', response.data);

      // If we only get responses without project details, we need to load project details first
      if (response.data.data && response.data.data.responses !== undefined && !response.data.data.projects) {
        // Load project details separately for each project
        const projectDetailsPromises = selectedProjects.map(projectId =>
          axios.get('/api/config', {
            params: { endpoint: `project/project-details/${projectId}?data_view=1` },
          }),
        );

        const projectDetailsResponses = await Promise.all(projectDetailsPromises);

        // Process project details
        const newProjectsDetails: { [projectId: string]: ProjectDetail } = {};
        projectDetailsResponses.forEach((detailResponse, index) => {
          const projectId = selectedProjects[index];
          const projectStatus = projectLoadingStatus.find(p => p.projectId === projectId);
          const projectColor = projectStatus?.color || '#000000';

          // Add source project metadata to each question
          const projectName = detailResponse.data.data.name;
          const enhancedQuestions = detailResponse.data.data.questions.map((q: Question) => ({
            ...q,
            project_id: projectId,
            project_name: projectName,
            color: projectColor,
          }));

          detailResponse.data.data.questions = enhancedQuestions;
          newProjectsDetails[projectId] = detailResponse.data.data;
        });

        setProjectsDetails(newProjectsDetails);

        // Now process the responses
        processBulkProjectData(response.data.data);
      } else {
        // If backend returns everything in one response
        processBulkProjectData(response.data.data);
      }

      // Update all project statuses to success
      setProjectLoadingStatus(prev => prev.map(p => ({ ...p, status: 'success', message: 'Loaded successfully' })));
    } catch (error) {
      console.error('Error loading projects:', error);

      // Update all project statuses to error
      setProjectLoadingStatus(prev => prev.map(p => ({ ...p, status: 'error', message: 'Failed to load' })));
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Create a merged master project detail
  useEffect(() => {
    if (Object.keys(projectsDetails).length === 0) {
      setMasterProjectDetails(null);
      return;
    }

    const firstProjectId = Object.keys(projectsDetails)[0];
    const firstProject = projectsDetails[firstProjectId];

    if (!firstProject) {
      setMasterProjectDetails(null);
      return;
    }

    const master: ProjectDetail = {
      id: 'master',
      name: 'Combined Projects',
      questions: [],
      location_details: {
        provinces: [],
        districts: [],
        communes: [],
        villages: [],
      },
      submitted_users: [],
    };

    const uniqueIds = new Set<string>();
    const uniqueProvinces = new Set<string>();
    const uniqueDistricts = new Set<string>();
    const uniqueCommunes = new Set<string>();
    const uniqueVillages = new Set<string>();
    const uniqueUsers = new Set<string>();

    // Merge all projects
    for (const projectId in projectsDetails) {
      const project = projectsDetails[projectId];
      const projectStatus = projectLoadingStatus.find(p => p.projectId === projectId);
      const projectColor = projectStatus?.color || '#000000';

      project.questions.forEach(question => {
        const enhancedQuestion = {
          ...question,
          project_id: project.id,
          project_name: project.name,
          color: projectColor,
        };

        const compositeId = selectedProjects.length > 1 ? `${project.id}_${question.id}` : question.id;

        if (!uniqueIds.has(compositeId)) {
          if (selectedProjects.length > 1) {
            enhancedQuestion.id = compositeId;
          }

          master.questions.push(enhancedQuestion);
          uniqueIds.add(compositeId);
        }
      });

      // Merge location details
      project.location_details.provinces.forEach((province: any) => {
        if (!uniqueProvinces.has(province.id)) {
          master.location_details.provinces.push(province);
          uniqueProvinces.add(province.id);
        }
      });

      project.location_details.districts.forEach((district: any) => {
        if (!uniqueDistricts.has(district.id)) {
          master.location_details.districts.push(district);
          uniqueDistricts.add(district.id);
        }
      });

      project.location_details.communes.forEach((commune: any) => {
        if (!uniqueCommunes.has(commune.id)) {
          master.location_details.communes.push(commune);
          uniqueCommunes.add(commune.id);
        }
      });

      project.location_details.villages.forEach((village: any) => {
        if (!uniqueVillages.has(village.id)) {
          master.location_details.villages.push(village);
          uniqueVillages.add(village.id);
        }
      });

      project.submitted_users.forEach((user: any) => {
        if (!uniqueUsers.has(user.id)) {
          master.submitted_users.push(user);
          uniqueUsers.add(user.id);
        }
      });
    }

    // Add project selection question
    const projectOptions = Object.values(projectsDetails).map(project => ({
      id: project.id,
      name_en: project.name,
      name_km: project.name,
    }));

    const projectQuestion = AddQuestions.find(q => q.id === 'project');
    if (projectQuestion) {
      projectQuestion.options = projectOptions;
    }

    master.questions = [...master.questions, ...AddQuestions];

    setMasterProjectDetails(master);

    // Check if all projects are loaded successfully
    const allProjectsLoaded = selectedProjects.every(projectId => {
      const status = projectLoadingStatus.find(p => p.projectId === projectId);
      return status && status.status === 'success';
    });

    setIsDataReady(allProjectsLoaded);
  }, [projectsDetails, projectLoadingStatus, selectedProjects.length]);

  // Get data visualization
  const getDataVisualization = async (qSelected: Question) => {
    setIsChartLoading(true);
    try {
      const projectId = qSelected.project_id || selectedProjects[0];

      if (!projectId) {
        setIsChartLoading(false);
        return;
      }

      let body = {
        project_id: projectId,
        question: qSelected,
        filters: currentFilter.filter(f => !f.project_id || f.project_id === projectId),
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
      // Single request with filters for all projects
      const response = await axios.post('/api/config', {
        endpoint: `responses/multiple-projects?lang=${lang}&page=${1}&limit=${paginationModel.pageSize}`,
        body: {
          project_ids: selectedProjects,
          filters: filters,
        },
      });

      processBulkProjectData(response.data.data);
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

    setShowTooManyProjectsWarning(selectedValues.length > MAX_RECOMMENDED_PROJECTS);
    setSelectedProjects(selectedValues);

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
    setProjectsDetails({});
    setIsDataReady(false);
  };

  // Remove a single project
  const handleRemoveProject = (projectId: string) => {
    setSelectedProjects(prev => prev.filter(id => id !== projectId));
    setShowTooManyProjectsWarning(selectedProjects.length - 1 > MAX_RECOMMENDED_PROJECTS);
    setProjectLoadingStatus(prev => prev.filter(p => p.projectId !== projectId));

    setProjectsDetails(prev => {
      const newDetails = { ...prev };
      delete newDetails[projectId];
      return newDetails;
    });

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

  // Question on change function
  const handleQuestionChange = (event: SelectChangeEvent<Question[]>) => {
    const { value } = event.target;

    if (masterProjectDetails) {
      // @ts-ignore
      if (value.includes('all')) {
        // @ts-ignore
        if (selectedQuestions.length === masterProjectDetails.questions.length) {
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
    if (typeof event.target.value == 'string') {
      const selectedQuestion = JSON.parse(event.target.value) as Question;
      setQuestionVisualize(selectedQuestion);
      getDataVisualization(selectedQuestion);
    }
  };

  // Handle filter selection changes
  const handleFilterChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<any[]>,
    index: number,
    numValue?: number,
  ) => {
    const { value } = event.target;
    setFilters(filters => {
      const newFilters = [...filters];

      if (typeof value == 'string') {
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

  // On pagination model change - using bulk API
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

          processBulkProjectData(response.data.data);
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
    var temp: GridColDef[] = [];
    var tempQuestion: QuestionFilter[] = [];

    selectedQuestions.map(item => {
      let colLabel = item.label;

      // For questions from a specific project, add project name to the label
      if (item.project_id && selectedProjects.length > 1) {
        colLabel = `${colLabel} (${item.project_name || item.project_id})`;
      }

      // Generate filter base on selected question
      if (item.type == 'user') {
        colLabel = lang == 'en' ? item.label : item.label_km;
        if (masterProjectDetails) {
          if (masterProjectDetails.submitted_users.length > 0) {
            tempQuestion.push({
              label: lang == 'en' ? item.label : item.label_km,
              type: item.type,
              data_type: item.data_type,
              index: item.order,
              values: [],
              options: masterProjectDetails.submitted_users,
              project_id: item.project_id,
              color: item.color,
            });
          }
        }
      } else if (item.type == 'province') {
        colLabel = lang == 'en' ? item.label : item.label_km;
        tempQuestion.push({
          label: lang == 'en' ? item.label : item.label_km,
          type: item.type,
          data_type: item.data_type,
          index: item.order,
          values: [],
          options: masterProjectDetails ? masterProjectDetails.location_details.provinces : [],
          project_id: item.project_id,
          color: item.color,
        });
      } else if (item.type == 'district') {
        colLabel = lang == 'en' ? item.label : item.label_km;
        tempQuestion.push({
          label: lang == 'en' ? item.label : item.label_km,
          type: item.type,
          data_type: item.data_type,
          index: item.order,
          values: [],
          options: masterProjectDetails ? masterProjectDetails.location_details.districts : [],
          project_id: item.project_id,
          color: item.color,
        });
      } else if (item.type == 'commune') {
        colLabel = lang == 'en' ? item.label : item.label_km;
        tempQuestion.push({
          label: lang == 'en' ? item.label : item.label_km,
          type: item.type,
          data_type: item.data_type,
          index: item.order,
          values: [],
          options: masterProjectDetails ? masterProjectDetails.location_details.communes : [],
          project_id: item.project_id,
          color: item.color,
        });
      } else if (item.type == 'village') {
        colLabel = lang == 'en' ? item.label : item.label_km;
        tempQuestion.push({
          label: lang == 'en' ? item.label : item.label_km,
          type: item.type,
          data_type: item.data_type,
          index: item.order,
          values: [],
          options: masterProjectDetails ? masterProjectDetails.location_details.villages : [],
          project_id: item.project_id,
          color: item.color,
        });
      } else if (item.type == 'project') {
        colLabel = lang == 'en' ? item.label : item.label_km;
        tempQuestion.push({
          label: lang == 'en' ? item.label : item.label_km,
          type: item.type,
          data_type: item.data_type,
          index: item.order,
          values: [],
          options: item.options,
          project_id: item.project_id,
          color: item.color,
        });
      } else {
        tempQuestion.push({
          label: item.label,
          type: item.type,
          data_type: item.data_type,
          index: item.order - 1,
          values: [],
          options: item.options,
          project_id: item.project_id,
          color: item.color,
        });
      }

      // Add column to the grid with color styling if it's from a specific project
      if (item.color && selectedProjects.length > 1) {
        temp.push({
          field: item.id,
          headerName: colLabel,
          cellClassName: 'text-left',
          flex: 0.3,
          headerClassName: 'multi-project-header',
          renderHeader: params => (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderLeft: `4px solid ${item.color}`,
                paddingLeft: '8px',
              }}>
              {colLabel}
            </div>
          ),
        });
      } else {
        temp.push({
          field: item.id,
          headerName: colLabel,
          cellClassName: 'text-left',
          flex: 0.3,
        });
      }
    });

    // Add project column if we have multiple projects
    if (selectedProjects.length > 1 && !temp.find(col => col.field === 'project_name')) {
      temp.push({
        field: 'project_name',
        headerName: 'Project',
        cellClassName: 'text-left',
        flex: 0.3,
        renderCell: params => {
          const project = projectLoadingStatus.find(p => p.projectName === params.value);
          const color = project?.color || '#000000';

          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                backgroundColor: color,
                color: '#fff',
                borderRadius: '4px',
                fontWeight: 'bold',
              }}>
              {params.value}
            </div>
          );
        },
      });
    }

    setGridCols(temp);
    setFilters(tempQuestion);
  }, [selectedQuestions, lang, masterProjectDetails, selectedProjects.length, projectLoadingStatus]);

  const handleDownloadChart = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'chart.png';
      link.click();
    }
  };

  return (
    <AuthorizationCheck requiredPermissions={permissionCode.viewDataView}>
      <div>
        <Box sx={{ mb: 4 }}>
          <Typography variant='h5' fontWeight='bold' gutterBottom>
            Multi-Project Data View
          </Typography>

          {/* Project Selection */}
          <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              1. Select Projects
            </Typography>

            <FormControl sx={{ minWidth: '100%', mb: 2 }}>
              <InputLabel id='project-select'>
                {selectedProjects.length === 0 ? GetContext('select_project_msg', lang) : GetContext('select_project', lang)}{' '}
              </InputLabel>

              <Select
                variant='standard'
                id='project-select'
                multiple
                value={selectedProjects}
                label='Projects'
                onChange={handleProjectChange}>
                {projects.length === 0 && (
                  <MenuItem key='empty' value='' disabled>
                    {GetContext('no_project', lang)}
                  </MenuItem>
                )}
                {projects.map(item => (
                  <MenuItem key={item.id} value={item.id}>
                    {getProjectName(item)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Warning for too many projects */}
            {showTooManyProjectsWarning && (
              <Alert severity='warning' sx={{ mb: 2 }}>
                <Typography fontWeight='bold'>Performance Warning</Typography>
                You have selected more than {MAX_RECOMMENDED_PROJECTS} projects. Loading and displaying data for multiple projects
                may be slow.
              </Alert>
            )}

            {/* Selected Projects Chips */}
            {selectedProjects.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {projectLoadingStatus.map(project => (
                  <Chip
                    key={project.projectId}
                    label={project.projectName}
                    onDelete={() => handleRemoveProject(project.projectId)}
                    sx={{
                      backgroundColor: project.color,
                      color: '#fff',
                      fontWeight: 'bold',
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Load Projects Button */}
            {selectedProjects.length > 0 && !isLoadingProjects && (
              <Button
                variant='contained'
                color='primary'
                onClick={loadAllSelectedProjects}
                startIcon={<RefreshIcon />}
                sx={{ mr: 1 }}>
                Load Selected Projects
              </Button>
            )}
          </Paper>

          {/* Simplified Loading Status */}
          {isLoadingProjects && (
            <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
              <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                Loading {selectedProjects.length} Projects...
              </Typography>

              <LinearProgress sx={{ mb: 2, height: 10, borderRadius: 5 }} />

              <Typography variant='body2' color='text.secondary'>
                Fetching all project data in a single request...
              </Typography>
            </Paper>
          )}

          {/* Simplified Error Status */}
          {!isLoadingProjects && projectLoadingStatus.some(p => p.status === 'error') && (
            <Paper variant='outlined' sx={{ p: 2, mb: 2, borderLeft: '4px solid #d32f2f' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ErrorIcon color='error' sx={{ mr: 1 }} />
                  <Typography fontWeight='bold' color='error'>
                    Failed to load projects
                  </Typography>
                </Box>
                <Button variant='outlined' color='primary' onClick={loadAllSelectedProjects} startIcon={<RefreshIcon />}>
                  Retry All
                </Button>
              </Box>
            </Paper>
          )}

          {/* Project Legend */}
          {isDataReady && selectedProjects.length > 1 && <ProjectLegend projects={projectLoadingStatus} />}

          {/* Question Selection and Filtering - Only show when data is ready */}
          {isDataReady && masterProjectDetails && (
            <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
              <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                2. Select Questions and Filter Data
              </Typography>

              <FormControl sx={{ minWidth: '100%', marginBottom: 2 }}>
                <InputLabel id='select-question'>
                  {selectedQuestions.length === 0 ? GetContext('select_question_msg', lang) : GetContext('select_question', lang)}{' '}
                </InputLabel>

                <Select
                  variant='standard'
                  id='select-question'
                  value={selectedQuestions}
                  multiple
                  onChange={handleQuestionChange}>
                  <MenuItem key='all' value='all'>
                    {selectedQuestions.length === masterProjectDetails.questions.length
                      ? GetContext('unselect_all', lang)
                      : GetContext('select_all', lang)}
                  </MenuItem>
                  {masterProjectDetails.questions.map(item => (
                    // @ts-ignore
                    <MenuItem key={`${item.project_id || 'standard'}-${item.id}`} value={item}>
                      {item.order != -1 ? item.label : lang == 'en' ? item.label : item.label_km}
                      {item.project_id && selectedProjects.length > 1 ? (
                        <span
                          style={{
                            marginLeft: '8px',
                            color: '#fff',
                            backgroundColor: item.color,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                          }}>
                          {item.project_name}
                        </span>
                      ) : null}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedQuestions.length > 0 && (
                  <Button variant='contained' color='primary' onClick={() => setOpenDrawer(true)}>
                    {GetContext('filter', lang)}
                  </Button>
                )}

                {selectedQuestions.length > 0 && (
                  <Button variant='contained' color='secondary' onClick={() => downloadFile()}>
                    {GetContext('export', lang)}
                  </Button>
                )}

                {masterProjectDetails && (
                  <Button variant='outlined' onClick={() => (isMapOpen ? setIsMapOpen(false) : setIsMapOpen(true))}>
                    {isMapOpen ? GetContext('close_map', lang) : GetContext('open_map', lang)}
                  </Button>
                )}
              </Box>
            </Paper>
          )}

          {/* Visualization Section */}
          {isDataReady && selectedQuestions.length > 0 && gridRows.length > 0 && (
            <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
              <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                3. Visualize Data
              </Typography>

              <FormControl sx={{ minWidth: '100%', marginBottom: 2 }}>
                <InputLabel id='project-filter-label'>
                  {!questionVisualize ? GetContext('select_question_msg', lang) : GetContext('select_question', lang)}{' '}
                </InputLabel>

                <Select
                  variant='standard'
                  labelId='project-filter-label'
                  id='question-visualize'
                  value={JSON.stringify(questionVisualize)}
                  onChange={handleQuestionVisualizeChange}>
                  {selectedQuestions.map(item => (
                    <MenuItem key={item.id} value={JSON.stringify(item)}>
                      {item.label}
                      {item.project_id && selectedProjects.length > 1 ? (
                        <span
                          style={{
                            marginLeft: '8px',
                            color: '#fff',
                            backgroundColor: item.color,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                          }}>
                          {item.project_name}
                        </span>
                      ) : null}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          )}

          {/* Chart Loading */}
          {questionVisualize && isChartLoading && (
            <Box display='flex' justifyContent='center' alignItems='center' sx={{ height: '400px', width: '100%' }}>
              <CircularProgress />
            </Box>
          )}

          {/* Chart Display */}
          {!isChartLoading && questionVisualize && (
            <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
              <Box display='flex' justifyContent='flex-end' sx={{ mb: 2 }}>
                <Button onClick={handleDownloadChart} sx={{ marginRight: 1 }} variant='contained' startIcon={<RefreshIcon />}>
                  {GetContext('export', lang)}
                </Button>
                <Button
                  sx={{ backgroundColor: 'white', color: 'black' }}
                  variant='contained'
                  onClick={handleCloseChart}
                  startIcon={<CloseIcon />}>
                  {GetContext('close', lang)}
                </Button>
              </Box>
              <div ref={chartRef}>
                <BarChart
                  dataset={dataset}
                  xAxis={[{ scaleType: 'band', dataKey: 'value' }]}
                  series={[
                    {
                      dataKey: 'freq',
                      label: questionVisualize.label,
                      color: questionVisualize.color || undefined,
                    },
                  ]}
                  height={400}
                  yAxis={[{ label: GetContext('responses', lang) }]}
                />
              </div>
            </Paper>
          )}

          {/* Data Summary */}
          {isDataReady && masterProjectDetails && (
            <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
              <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                Data Summary
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Total Projects
                  </Typography>
                  <Typography variant='h6'>{selectedProjects.length}</Typography>
                </Box>

                <Box sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Total Records
                  </Typography>
                  <Typography variant='h6'>{totalData}</Typography>
                </Box>

                <Box sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Selected Questions
                  </Typography>
                  <Typography variant='h6'>{selectedQuestions.length}</Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>

        {/* Map View */}
        {isDataReady && isMapOpen && (
          <Box sx={{ width: '100%', height: '400px', marginTop: '1rem', mb: 2 }}>
            <Paper variant='outlined' sx={{ p: 2, height: '100%' }}>
              <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                Map View
              </Typography>
              <Map data={dataMaps} />
            </Paper>
          </Box>
        )}

        {/* Data Grid */}
        {isDataReady && gridCols.length > 0 && (
          <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              4. Data Table
            </Typography>

            <DataGrid
              rows={gridRows}
              columns={gridCols}
              rowCount={rowSize}
              paginationMode='server'
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
              pageSizeOptions={[10, 25, 50, 100]}
              sx={{
                width: '100%',
                height: '100%',
                marginTop: '1rem',
                '& .multi-project-header': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            />
          </Paper>
        )}

        {/* Filter Drawer */}
        <Drawer key={drawerKey} anchor='right' open={openDrawer} onClose={() => setOpenDrawer(false)} sx={{ zIndex: '1300' }}>
          <Box sx={{ width: 500, padding: '1rem' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant='h6' fontWeight='bold'>
                {GetContext('filter', lang)}
              </Typography>
              <IconButton onClick={() => setOpenDrawer(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Group filters by project if we have multiple projects */}
            {selectedProjects.length > 1
              ? // Group filters by project
                (() => {
                  const projectGroups: { [projectId: string]: QuestionFilter[] } = {};
                  const commonFilters: QuestionFilter[] = [];

                  filters.forEach((filter, index) => {
                    if (filter.project_id) {
                      if (!projectGroups[filter.project_id]) {
                        projectGroups[filter.project_id] = [];
                      }
                      projectGroups[filter.project_id].push({ ...filter, index });
                    } else {
                      commonFilters.push({ ...filter, index });
                    }
                  });

                  return (
                    <>
                      {/* Common filters */}
                      {commonFilters.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 1 }}>
                            Common Filters
                          </Typography>
                          {commonFilters.map(filter => (
                            <FilterItem
                              key={`common-${filter.index}`}
                              filter={filter}
                              index={filter.index}
                              handleFilterChange={handleFilterChange}
                              lang={lang}
                              GetContext={GetContext}
                            />
                          ))}
                        </Box>
                      )}

                      {/* Project-specific filters */}
                      {Object.entries(projectGroups).map(([projectId, projectFilters]) => {
                        const project = projectLoadingStatus.find(p => p.projectId === projectId);
                        const projectName = project?.projectName || projectId;
                        const projectColor = project?.color || '#000000';

                        return (
                          <Box key={projectId} sx={{ mb: 2 }}>
                            <Typography
                              variant='subtitle1'
                              fontWeight='bold'
                              sx={{
                                mb: 1,
                                borderLeft: `4px solid ${projectColor}`,
                                paddingLeft: '8px',
                              }}>
                              {projectName} Filters
                            </Typography>
                            {projectFilters.map(filter => (
                              <FilterItem
                                key={`${projectId}-${filter.index}`}
                                filter={filter}
                                index={filter.index}
                                handleFilterChange={handleFilterChange}
                                lang={lang}
                                GetContext={GetContext}
                              />
                            ))}
                          </Box>
                        );
                      })}
                    </>
                  );
                })()
              : // Show all filters without grouping for single project
                filters.map((filter, index) => (
                  <FilterItem
                    key={index}
                    filter={filter}
                    index={index}
                    handleFilterChange={handleFilterChange}
                    lang={lang}
                    GetContext={GetContext}
                  />
                ))}

            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button fullWidth variant='contained' onClick={handleFilter} startIcon={<RefreshIcon />}>
                {GetContext('filter', lang)}
              </Button>

              <Button fullWidth variant='outlined' onClick={handleClearFilter} startIcon={<CloseIcon />}>
                {GetContext('clear_filter', lang)}
              </Button>
            </Box>
          </Box>
        </Drawer>
      </div>
    </AuthorizationCheck>
  );
};

export default DataViewPage;
