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
  Grid,
  Pagination,
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
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface Project {
  id: string;
  name: string;
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
  project_id?: string; // Added to track source project
  project_name?: string; // Added to track source project name
  color?: string; // Added for project color coding
}

interface QuestionFilter {
  label: string;
  type: string;
  data_type: string;
  index: number;
  values: any[];
  options: any[];
  project_id?: string; // Added to track source project
  color?: string; // Added for project color coding
}

// Project loading status interface
interface ProjectLoadingStatus {
  projectId: string;
  projectName: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  message?: string;
  color?: string; // Color coding for project
  retryCount?: number;
}

// Question visualization data
interface QuestionVisualizationData {
  question: Question;
  data: any[];
  isLoading: boolean;
  error?: string;
}

// Maximum number of projects allowed without warning
const MAX_RECOMMENDED_PROJECTS = 3;

// Charts per page for pagination
const CHARTS_PER_PAGE = 6; // 2 rows of 3 charts

// Project colors for visual distinction
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

// ChartCard component to display individual question chart
const ChartCard: React.FC<{
  chartData: QuestionVisualizationData;
  onDownload: (questionId: string) => void;
  lang: string;
  GetContext: (key: string, lang: string) => string;
}> = ({ chartData, onDownload, lang, GetContext }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { question, data, isLoading, error } = chartData;

  // Chart title with project indication if from multiple projects
  const chartTitle = question.project_id ? `${question.label} (${question.project_name || question.project_id})` : question.label;

  return (
    <Card variant='outlined' sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 2, pb: 1, flexGrow: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant='subtitle1'
            fontWeight='bold'
            sx={{
              ...(question.color && {
                borderLeft: `4px solid ${question.color}`,
                paddingLeft: '8px',
              }),
            }}>
            {chartTitle}
          </Typography>
          <IconButton size='small' onClick={() => onDownload(question.id)} title={GetContext('export', lang)}>
            <DownloadIcon />
          </IconButton>
        </Box>
      </CardContent>
      <Divider />
      <CardContent sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1 }}>
        {isLoading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color='error'>{error}</Typography>
        ) : data && data.length > 0 ? (
          <div ref={chartRef} style={{ width: '100%', height: '300px' }}>
            <BarChart
              dataset={data}
              xAxis={[{ scaleType: 'band', dataKey: 'value' }]}
              series={[
                {
                  dataKey: 'freq',
                  label: question.label,
                  color: question.color || undefined,
                },
              ]}
              height={300}
              width={undefined}
              yAxis={[{ label: GetContext('responses', lang) }]}
            />
          </div>
        ) : (
          <Typography color='text.secondary'>No data available</Typography>
        )}
      </CardContent>
    </Card>
  );
};

const DataViewPage = () => {
  const lang = useLang(state => state.lang);

  // Changed from selectedProject (string) to selectedProjects (string[])
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // Track loading status for each project
  const [projectLoadingStatus, setProjectLoadingStatus] = useState<ProjectLoadingStatus[]>([]);

  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);

  // Changed from projectDetail to projectsDetails (map of project details)
  const [projectsDetails, setProjectsDetails] = useState<{ [projectId: string]: ProjectDetail }>({});

  // Combined master project details from all projects
  const [masterProjectDetails, setMasterProjectDetails] = useState<ProjectDetail | null>(null);

  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [rowSize, setRowSize] = useState<number>(0);
  const [totalData, setTotalData] = useState<number>(0);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [filters, setFilters] = useState<QuestionFilter[]>([]);
  const [drawerKey, setDrawerKey] = useState(0);
  const [currentFilter, setCurrentFilter] = useState<QuestionFilter[]>([]);
  const [dataMaps, setDataMaps] = useState<MapData[]>([]);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // New state for chart data
  const [chartDataMap, setChartDataMap] = useState<{ [questionId: string]: QuestionVisualizationData }>({});

  // Pagination for charts
  const [chartPage, setChartPage] = useState(1);

  // Flag to indicate if projects are still loading
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Flag to indicate if project data is ready to display
  const [isDataReady, setIsDataReady] = useState(false);

  // Flag to indicate if charts are being loaded
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);

  // Show too many projects warning
  const [showTooManyProjectsWarning, setShowTooManyProjectsWarning] = useState(false);

  // Cancellation token for loading process
  const [isCancelled, setIsCancelled] = useState(false);

  // Get overall loading progress
  const getLoadingProgress = () => {
    const totalProjects = selectedProjects.length;
    const loadedProjects = projectLoadingStatus.filter(p => p.status === 'success').length;
    return {
      total: totalProjects,
      loaded: loadedProjects,
      percentage: totalProjects ? Math.round((loadedProjects / totalProjects) * 100) : 0,
    };
  };

  // Get total chart pages
  const getTotalChartPages = () => {
    return Math.ceil(selectedQuestions.length / CHARTS_PER_PAGE);
  };

  // Get current page charts
  const getCurrentPageCharts = () => {
    const startIndex = (chartPage - 1) * CHARTS_PER_PAGE;
    const endIndex = startIndex + CHARTS_PER_PAGE;
    return selectedQuestions.slice(startIndex, endIndex);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/config', { params: { endpoint: 'project/all?status=1,2' } });
        setProjects(response.data.data.projects);
      } catch (error) {
        console.error('Error fetching users with status 1:', error);
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
      // Prepare data for all selected projects
      let allData = {
        col: [] as any[],
        con: [] as any[],
      };

      // Export data for each project
      for (const projectId of selectedProjects) {
        let body = {
          filter: {
            questions: currentFilter.filter(f => !f.project_id || f.project_id === projectId),
          },
          selected_question_indexs: [] as number[],
          is_province: false,
          is_district: false,
          is_commune: false,
          is_submit_user: false,
        };

        // Get project-specific questions
        const projectQuestions = selectedQuestions.filter(q => !q.project_id || q.project_id === projectId);

        projectQuestions.forEach(question => {
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
          endpoint: `responses/export/${projectId}?lang=${lang}`,
          body,
        });

        // For the first project, use its columns
        if (allData.col.length === 0) {
          allData.col = response.data.data.col;

          // Add project column if we have multiple projects
          if (selectedProjects.length > 1) {
            allData.col.push({ label: 'Project', value: 'project_name' });
          }
        }

        // Add project name to each row
        const projectName = projectsDetails[projectId]?.name || projectId;
        const projectData = response.data.data.con.map((row: any) => {
          if (selectedProjects.length > 1) {
            return { ...row, project_name: projectName };
          }
          return row;
        });

        // Combine data
        allData.con = [...allData.con, ...projectData];
      }

      const sheetData = [
        {
          sheet: 'Sheet1',
          columns: allData.col,
          content: allData.con,
        },
      ];
      xlsx(sheetData, settings);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const getProjectDetails = async (projectId: string) => {
    try {
      // Get project color from status
      const projectStatus = projectLoadingStatus.find(p => p.projectId === projectId);
      const projectColor = projectStatus?.color || '#000000';

      // Update project loading status
      setProjectLoadingStatus(prev => {
        const status = [...prev];
        const projectIndex = status.findIndex(p => p.projectId === projectId);

        if (projectIndex >= 0) {
          status[projectIndex] = { ...status[projectIndex], status: 'loading' };
        }
        return status;
      });

      // Check if the operation was cancelled
      if (isCancelled) return;

      const projectRes = await axios.get('/api/config', {
        params: { endpoint: `project/project-details/${projectId}?data_view=1` },
      });

      // Check if the operation was cancelled
      if (isCancelled) return;

      // Add source project metadata to each question
      const projectName = projectRes.data.data.name;
      const enhancedQuestions = projectRes.data.data.questions.map((q: Question) => ({
        ...q,
        project_id: projectId,
        project_name: projectName,
        color: projectColor,
      }));

      projectRes.data.data.questions = enhancedQuestions;

      // Store project details
      setProjectsDetails(prev => ({
        ...prev,
        [projectId]: projectRes.data.data,
      }));

      // Update loading status to success
      setProjectLoadingStatus(prev => {
        const status = [...prev];
        const projectIndex = status.findIndex(p => p.projectId === projectId);

        if (projectIndex >= 0) {
          status[projectIndex] = {
            ...status[projectIndex],
            status: 'success',
            message: 'Loaded successfully',
          };
        }
        return status;
      });

      // Check if the operation was cancelled
      if (isCancelled) return;

      await getMapViewData(projectId);
    } catch (error) {
      console.error(`Error fetching project detail for ${projectId}:`, error);

      // Check if the operation was cancelled
      if (isCancelled) return;

      // Update loading status to error
      setProjectLoadingStatus(prev => {
        const status = [...prev];
        const projectIndex = status.findIndex(p => p.projectId === projectId);

        if (projectIndex >= 0) {
          const retryCount = (status[projectIndex].retryCount || 0) + 1;
          status[projectIndex] = {
            ...status[projectIndex],
            status: 'error',
            message: 'Failed to load',
            retryCount,
          };
        }
        return status;
      });
    }
  };

  // Create a merged master project detail
  useEffect(() => {
    if (Object.keys(projectsDetails).length === 0) {
      setMasterProjectDetails(null);
      return;
    }

    // Initialize with the first project's details
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

    // Set of unique IDs to avoid duplicates
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

      // Merge questions
      project.questions.forEach(question => {
        // Include project ID, name, and color with each question
        const enhancedQuestion = {
          ...question,
          project_id: project.id,
          project_name: project.name,
          color: projectColor,
        };

        // Create unique composite ID for questions when we have multiple projects
        const compositeId = selectedProjects.length > 1 ? `${project.id}_${question.id}` : question.id;

        // Only add if not already present
        if (!uniqueIds.has(compositeId)) {
          // For selectedProjects.length > 1, we use composite IDs internally
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

      // Merge submitted users
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

    // Add "Project" to the AddQuestions array at the end to identify project source
    const projectQuestion = AddQuestions.find(q => q.id === 'project');
    if (projectQuestion) {
      projectQuestion.options = projectOptions;
    }

    // Add all standard questions to master
    master.questions = [...master.questions, ...AddQuestions];

    setMasterProjectDetails(master);

    // Check if all projects are loaded successfully
    const allProjectsLoaded = selectedProjects.every(projectId => {
      const status = projectLoadingStatus.find(p => p.projectId === projectId);
      return status && status.status === 'success';
    });

    // Only set data as ready when all projects are loaded
    setIsDataReady(allProjectsLoaded);
  }, [projectsDetails, projectLoadingStatus, selectedProjects.length]);

  const getMapViewData = async (projectId: string, filter?: QuestionFilter[]) => {
    try {
      // Get project color from status
      const projectStatus = projectLoadingStatus.find(p => p.projectId === projectId);
      const projectColor = projectStatus?.color || '#000000';

      // Check if the operation was cancelled
      if (isCancelled) return;

      // Filter only the filters relevant to this project
      const projectFilters = filter ? filter.filter(f => !f.project_id || f.project_id === projectId) : undefined;

      if (projectFilters) {
        let body = {
          questions: projectFilters,
        };
        const response = await axios.post('/api/config', {
          endpoint: `responses/map/${projectId}`,
          body,
        });

        // Check if the operation was cancelled
        if (isCancelled) return;

        // Add project ID, name, and color to map data
        const projectName = projectsDetails[projectId]?.name || projectId;
        const enhancedMapData = response.data.data.map_res.map((item: MapData) => ({
          ...item,
          project_id: projectId,
          project_name: projectName,
          color: projectColor,
        }));

        // Merge with existing map data
        setDataMaps(prev => {
          // Remove existing data for this project
          const filteredData = prev.filter(item => item.project_id !== projectId);
          return [...filteredData, ...enhancedMapData];
        });
      } else {
        const response = await axios.post('/api/config', {
          endpoint: `responses/map/${projectId}`,
        });

        // Check if the operation was cancelled
        if (isCancelled) return;

        // Add project ID, name, and color to map data
        const projectName = projectsDetails[projectId]?.name || projectId;
        const enhancedMapData = response.data.data.map_res.map((item: MapData) => ({
          ...item,
          project_id: projectId,
          project_name: projectName,
          color: projectColor,
        }));

        // Merge with existing map data
        setDataMaps(prev => {
          // Remove existing data for this project
          const filteredData = prev.filter(item => item.project_id !== projectId);
          return [...filteredData, ...enhancedMapData];
        });
      }
    } catch (error) {
      console.error(`Error fetching map data for ${projectId}:`, error);
    }
  };

  // Fetch visualization data for a single question
  const getDataVisualization = async (question: Question) => {
    // Skip if already loading or loaded this question
    if (chartDataMap[question.id] && (chartDataMap[question.id].isLoading || chartDataMap[question.id].data)) {
      return;
    }

    // Update chart data map to indicate loading
    setChartDataMap(prev => ({
      ...prev,
      [question.id]: {
        question,
        data: [],
        isLoading: true,
      },
    }));

    try {
      const projectId = question.project_id || selectedProjects[0];

      if (!projectId) {
        setChartDataMap(prev => ({
          ...prev,
          [question.id]: {
            question,
            data: [],
            isLoading: false,
            error: 'No project ID available',
          },
        }));
        return;
      }

      let index = question.order;
      let type = question.type;

      if (
        !(
          type == 'user' ||
          type == 'province' ||
          type == 'district' ||
          type == 'commune' ||
          type == 'village' ||
          type == 'project'
        )
      ) {
        index -= 1;
      }

      // Filter only the filters relevant to this project
      const projectFilters = currentFilter.filter(f => !f.project_id || f.project_id === projectId);

      let body = {
        questions: projectFilters,
      };

      const response = await axios.post('/api/config', {
        endpoint: `responses/virtualize/${projectId}?index=${index}&type=${type}`,
        body,
      });

      // Update chart data with fetched data
      setChartDataMap(prev => ({
        ...prev,
        [question.id]: {
          question,
          data: response.data.data,
          isLoading: false,
        },
      }));
    } catch (error) {
      console.error(`Error fetching visualization data for question ${question.id}:`, error);
      setChartDataMap(prev => ({
        ...prev,
        [question.id]: {
          question,
          data: [],
          isLoading: false,
          error: 'Failed to load chart data',
        },
      }));
    }
  };

  // Load visualization data for all questions on the current page
  const loadCurrentPageCharts = async () => {
    const currentPageQuestions = getCurrentPageCharts();
    setIsLoadingCharts(true);

    // Reset any chart data that was filtered to ensure we get fresh data
    if (currentFilter.length > 0) {
      setChartDataMap({});
    }

    // Fetch data for all questions on current page
    for (const question of currentPageQuestions) {
      await getDataVisualization(question);
    }

    setIsLoadingCharts(false);
  };

  // When questions or page changes, load chart data
  useEffect(() => {
    if (isDataReady && selectedQuestions.length > 0) {
      loadCurrentPageCharts();
    }
  }, [selectedQuestions, chartPage, isDataReady]);

  // When filter changes, reload all chart data
  useEffect(() => {
    if (isDataReady && selectedQuestions.length > 0 && currentFilter.length > 0) {
      loadCurrentPageCharts();
    }
  }, [currentFilter]);

  //clear all value in filter
  const handleClearFilter = async () => {
    var newFilter = filters;
    newFilter.map(filter => {
      filter.values = [];
    });
    setFilters(newFilter);
    setDrawerKey(prevKey => prevKey + 1);
  };

  //filter function
  const handleFilter = async () => {
    setIsDataLoading(true);

    // Reset data maps
    setDataMaps([]);

    // Apply filters to all selected projects
    for (const projectId of selectedProjects) {
      await getMapViewData(projectId, filters);
    }

    setOpenDrawer(false);
    setCurrentFilter(filters);

    // Chart data will be reloaded by the useEffect that watches currentFilter
    setIsDataLoading(false);
  };

  // Handle project selection change
  const handleProjectChange = async (event: SelectChangeEvent<string[]>) => {
    const selectedValues = event.target.value as string[];

    // Check if user has selected more than MAX_RECOMMENDED_PROJECTS
    setShowTooManyProjectsWarning(selectedValues.length > MAX_RECOMMENDED_PROJECTS);

    // Set selected projects
    setSelectedProjects(selectedValues);

    // Setup project colors for each selected project
    const newProjectStatus: ProjectLoadingStatus[] = [];

    selectedValues.forEach((projectId, index) => {
      const projectName = projects.find(p => p.id === projectId)?.name || projectId;
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
    setChartDataMap({});
    setProjectsDetails({});
    setIsDataReady(false);
    setChartPage(1);
  };

  // Remove a single project
  const handleRemoveProject = (projectId: string) => {
    setSelectedProjects(prev => prev.filter(id => id !== projectId));

    // Update too many projects warning
    setShowTooManyProjectsWarning(selectedProjects.length - 1 > MAX_RECOMMENDED_PROJECTS);

    // Update loading status
    setProjectLoadingStatus(prev => prev.filter(p => p.projectId !== projectId));

    // Remove project details
    setProjectsDetails(prev => {
      const newDetails = { ...prev };
      delete newDetails[projectId];
      return newDetails;
    });

    // Remove data maps for this project
    setDataMaps(prev => prev.filter(item => item.project_id !== projectId));

    // Reset if no projects left
    if (selectedProjects.length <= 1) {
      setSelectedQuestions([]);
      setCurrentFilter([]);
      setIsMapOpen(false);
      setDataMaps([]);
      setChartDataMap({});
      setIsDataReady(false);
      setChartPage(1);
    }
  };

  //question on change function
  const handleQuestionChange = (event: SelectChangeEvent<Question[]>) => {
    const { value } = event.target;

    // Handle "Select All" case
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

    // Reset chart page when changing questions
    setChartPage(1);
  };

  //handle filter selection changes
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

  // Download a single chart
  const handleDownloadChart = async (questionId: string) => {
    const chartData = chartDataMap[questionId];
    if (!chartData) return;

    // Find the chart's DOM element
    const chartContainer = document.getElementById(`chart-${questionId}`);
    if (!chartContainer) return;

    try {
      const canvas = await html2canvas(chartContainer);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `chart-${chartData.question.label.replace(/\s+/g, '-')}.png`;
      link.click();
    } catch (error) {
      console.error('Error downloading chart:', error);
    }
  };

  // Export all charts as PDF or images
  const handleExportAllCharts = async () => {
    // Implementation would depend on library choices
    // Could use html2canvas + jsPDF to create a PDF with all charts
    alert('Export all charts functionality would be implemented here');
  };

  // Load data for all selected projects with confirmation
  const loadAllSelectedProjects = async () => {
    // Reset data and set loading state
    setIsLoadingProjects(true);
    setIsDataLoading(true);
    setIsDataReady(false);
    setIsCancelled(false);

    // Reset counters and data
    setRowSize(0);
    setTotalData(0);
    setDataMaps([]);
    setChartDataMap({});

    // Load each project's details sequentially
    for (const projectId of selectedProjects) {
      if (isCancelled) {
        break;
      }
      await getProjectDetails(projectId);
    }

    setIsLoadingProjects(false);
    setIsDataLoading(false);

    // Data display is controlled by isDataReady which is set in the useEffect
    // that creates the master project details
  };

  // Cancel the loading process
  const cancelLoading = () => {
    setIsCancelled(true);
    setIsLoadingProjects(false);
    setIsDataLoading(false);
  };

  // Retry loading a failed project
  const retryLoadProject = async (projectId: string) => {
    // Update status to loading
    setProjectLoadingStatus(prev => {
      const status = [...prev];
      const projectIndex = status.findIndex(p => p.projectId === projectId);

      if (projectIndex >= 0) {
        status[projectIndex] = {
          ...status[projectIndex],
          status: 'loading',
          message: 'Retrying...',
        };
      }
      return status;
    });

    // Try loading the project again
    await getProjectDetails(projectId);
  };

  //map grid col when selected questions changes
  useEffect(() => {
    var tempQuestion: QuestionFilter[] = [];

    selectedQuestions.forEach(item => {
      //generate filter base on selected question
      if (item.type == 'user') {
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
    });

    setFilters(tempQuestion);
  }, [selectedQuestions, lang, masterProjectDetails, selectedProjects.length, projectLoadingStatus]);

  return (
    <AuthorizationCheck requiredPermissions={permissionCode.viewDataView}>
      <div>
        <Box sx={{ mb: 4 }}>
          <Typography variant='h5' fontWeight='bold' gutterBottom>
            Multi-Project Data Visualization
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
                    {item.name}
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

            {/* Cancel Loading Button */}
            {isLoadingProjects && (
              <Button variant='contained' color='error' onClick={cancelLoading} startIcon={<CancelIcon />} sx={{ mr: 1 }}>
                Cancel Loading
              </Button>
            )}
          </Paper>

          {/* Project Loading Status */}
          {isLoadingProjects && (
            <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
              <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                Loading Projects ({getLoadingProgress().loaded}/{getLoadingProgress().total})
              </Typography>

              <LinearProgress
                variant='determinate'
                value={getLoadingProgress().percentage}
                sx={{ mb: 2, height: 10, borderRadius: 5 }}
              />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {projectLoadingStatus.map(project => (
                  <Card
                    key={project.projectId}
                    variant='outlined'
                    sx={{
                      borderLeft: `4px solid ${project.color}`,
                    }}>
                    <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant='body1' fontWeight='bold'>
                          {project.projectName}
                        </Typography>

                        {project.status === 'pending' && (
                          <Typography variant='body2' color='text.secondary'>
                            Pending
                          </Typography>
                        )}

                        {project.status === 'loading' && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CircularProgress size={16} sx={{ mr: 1 }} />
                            <Typography variant='body2' color='primary'>
                              Loading...
                            </Typography>
                          </Box>
                        )}

                        {project.status === 'success' && (
                          <Typography variant='body2' color='success.main'>
                            Loaded Successfully
                          </Typography>
                        )}

                        {project.status === 'error' && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant='body2' color='error.main' sx={{ mr: 1 }}>
                              Failed to Load
                            </Typography>
                            <IconButton
                              size='small'
                              color='primary'
                              onClick={() => retryLoadProject(project.projectId)}
                              title='Retry'>
                              <RefreshIcon fontSize='small' />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          )}

          {/* Project Error Status Summary */}
          {!isLoadingProjects && projectLoadingStatus.some(p => p.status === 'error') && (
            <Paper variant='outlined' sx={{ p: 2, mb: 2, borderLeft: '4px solid #d32f2f' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ErrorIcon color='error' sx={{ mr: 1 }} />
                <Typography fontWeight='bold' color='error'>
                  Some projects failed to load
                </Typography>
              </Box>

              <Box sx={{ mt: 1 }}>
                {projectLoadingStatus
                  .filter(p => p.status === 'error')
                  .map(project => (
                    <Box
                      key={project.projectId}
                      sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant='body2'>{project.projectName}</Typography>
                      <Button
                        size='small'
                        variant='outlined'
                        color='primary'
                        onClick={() => retryLoadProject(project.projectId)}
                        startIcon={<RefreshIcon />}>
                        Retry
                      </Button>
                    </Box>
                  ))}
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

                {selectedQuestions.length > 0 && (
                  <Button variant='contained' color='success' startIcon={<PictureAsPdfIcon />} onClick={handleExportAllCharts}>
                    Export All Charts
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

        {/* Chart Grid */}
        {isDataReady && selectedQuestions.length > 0 && (
          <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              3. Data Visualization
            </Typography>

            {isLoadingCharts ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : selectedQuestions.length > 0 ? (
              <>
                <Grid container spacing={3}>
                  {getCurrentPageCharts().map(question => (
                    <Grid item xs={12} md={4} key={question.id}>
                      <ChartCard
                        chartData={
                          chartDataMap[question.id] || {
                            question,
                            data: [],
                            isLoading: true,
                          }
                        }
                        onDownload={handleDownloadChart}
                        lang={lang}
                        GetContext={GetContext}
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination for charts */}
                {getTotalChartPages() > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={getTotalChartPages()}
                      page={chartPage}
                      onChange={(e, page) => setChartPage(page)}
                      color='primary'
                      size='large'
                    />
                  </Box>
                )}
              </>
            ) : (
              <Typography variant='body1' color='text.secondary' sx={{ p: 2, textAlign: 'center' }}>
                Select questions to display charts
              </Typography>
            )}
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
                  // Create project groups
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
