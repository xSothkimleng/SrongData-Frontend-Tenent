'use client';
import React, { useEffect, useState, ChangeEvent, useRef } from 'react';
import { styled } from '@mui/system';
import { BarChart } from '@mui/x-charts/BarChart';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import dynamic from 'next/dynamic';
import html2canvas from 'html2canvas';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
// import Map from '@/components/dashboard/map'
const Map = dynamic(() => import('@/components/dashboard/map'), { ssr: false });
const xlsx = require('json-as-xlsx');
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
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
} from '@mui/material';
import { Margin } from '@mui/icons-material';
import AuthorizationCheck from '@/components/AuthorizationCheck';
import { permissionCode } from '@/utils/permissionCode';
import useLang from '@/store/lang';
import { GetContext } from '@/utils/language';

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
}

interface QuestionFilter {
  label: string;
  type: string;
  data_type: string;
  index: number;
  values: any[];
  options: any[];
}

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
  // width: '100%',
  padding: '1rem 0',
  '& .MuiSvgIcon-root': {
    fontSize: '2rem !important',
    color: theme.palette.primary.main,
  },
  '& .MuiInputBase-input': {
    fontSize: '1.5rem !important',
  },
}));

const DataViewPage = () => {
  const lang = useLang(state => state.lang);
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDetail, setProjectDetails] = useState<ProjectDetail>();
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [gridCols, setGridCols] = useState<GridColDef[]>([]);
  const [gridRows, setGridRows] = useState<{ [key: string]: any }[]>([]);
  const [rowSize, setRowSize] = useState<number>(0);
  const [totalData, setTotalData] = useState<number>(0);
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [filters, setFilters] = useState<QuestionFilter[]>([]);
  const [drawerKey, setDrawerKey] = useState(0);
  const [questionVisualize, setQuestionVisualize] = useState<Question>();
  const [dataset, setDataset] = useState<any[]>([]);
  const [currentFilter, setCurrentFilter] = useState<QuestionFilter[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [dataMaps, setDataMaps] = useState<MapData[]>([]);
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/config', { params: { endpoint: 'project/all?status=1,2' } });
        setProjects(response.data.data.projects); // assuming the data is in the response's data property
        // console.log(response.data.data.projects);
      } catch (error) {
        console.error('Error fetching users with status 1:', error);
      }
    };

    fetchProjects();
  }, []);

  const downloadFile = async () => {
    const settings = {
      fileName: 'new_file',
      extraLength: 3,
      writeOptions: {}, // Style options from https://github.com/SheetJS/sheetjs#writing-options
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
      const response = await axios.post('/api/config', { endpoint: `responses/export/${selectedProject}?lang=${lang}`, body });
      const sheetData = [
        {
          sheet: 'Sheet1',
          columns: response.data.data.col,
          content: response.data.data.con,
        },
      ];
      xlsx(sheetData, settings);
    } catch (error) {
      console.error('Error fetching users with status 1:', error);
    }
  };

  const getProjectDetails = async (id: string) => {
    try {
      var projectRes = await axios.get('/api/config', { params: { endpoint: `project/project-details/${id}?data_view=1` } });
      projectRes.data.data.questions = projectRes.data.data.questions.concat(AddQuestions);
      setProjectDetails(projectRes.data.data);
      getResponse(id);
      getMapViewData(id);
      // console.log(projectRes.data.data);
    } catch (error) {
      console.error('Error fetching project detail with status 1:', error);
    }
  };

  const getMapViewData = async (id: string, filter?: QuestionFilter[]) => {
    try {
      // @ts-ignore
      if (filter) {
        let body = {
          questions: filter,
        };
        const response = await axios.post('/api/config', { endpoint: `responses/map/${id}`, body });
        setDataMaps(response.data.data.map_res);
      } else {
        const response = await axios.post('/api/config', { endpoint: `responses/map/${id}` });
        setDataMaps(response.data.data.map_res);
        // console.log(response.data.data.map_res);
      }
    } catch (error) {
      console.error('Error fetching response with status 1:', error);
    }
  };

  const getResponse = async (id: string, filter?: QuestionFilter[]) => {
    try {
      let page = paginationModel.page + 1;
      let limit = paginationModel.pageSize;
      let body = {
        questions: [] as QuestionFilter[],
      };
      // @ts-ignore
      if (filter) {
        body.questions = filter;
      }
      const response = await axios.post('/api/config', { endpoint: `responses/all/${id}?page=${page}&limit=${limit}&lang=${lang}`, body });
      setGridRows(response.data.data.responses);
      setRowSize(response.data.data.count);
      setTotalData(response.data.data.total);
    } catch (error) {
      console.error('Error fetching response with status 1:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  //on pagination model change
  useEffect(() => {
    setIsDataLoading(true);
    if (selectedProject) {
      getResponse(selectedProject, filters);
    }
  }, [paginationModel, lang]);

  //get data visualize
  const getDataVisualization = async (qSelected: Question, filter?: QuestionFilter[]) => {
    setIsChartLoading(true);
    try {
      let index = qSelected.order;
      let type = qSelected.type;

      if (!(type == 'user' || type == 'province' || type == 'district' || type == 'commune' || type == 'village')) {
        index -= 1;
      }
      let body = {
        questions: filter ? filter : currentFilter,
      };
      // @ts-ignore
      const response = await axios.post('/api/config', {
        endpoint: `responses/virtualize/${selectedProject}?index=${index}&type=${type}`,
        body,
      });
      setDataset(response.data.data);
      setIsChartLoading(false);
    } catch (error) {
      setIsChartLoading(false);
      setDataset([]);
      // console.log('Error fetching response with status 1:', error);
    }
  };
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
    setPaginationModel({
      page: 0,
      pageSize: paginationModel.pageSize,
    });
    if (projectDetail) {
      getResponse(projectDetail.id, filters);
      getMapViewData(projectDetail.id, filters);
    }
    setOpenDrawer(false);
    setCurrentFilter(filters);
    if (questionVisualize) {
      getDataVisualization(questionVisualize, filters);
    }
  };

  //project on change function
  const handleProjectChange = async (event: SelectChangeEvent<string>) => {
    setSelectedQuestions([]);
    setCurrentFilter([]);
    setIsMapOpen(false);
    setDataMaps([]);
    setQuestionVisualize(undefined);
    // console.log(event.target.value);
    setSelectedProject(event.target.value);
    getProjectDetails(event.target.value);
  };

  //question on change function
  const handleQuestionChange = (event: SelectChangeEvent<Question[]>) => {
    const { value } = event.target;
    // @ts-ignore
    if (value.includes('all')) {
      // @ts-ignore
      if (selectedQuestions.length === projectDetail.questions.length) {
        setSelectedQuestions([]);
      } else {
        // @ts-ignore
        setSelectedQuestions(projectDetail.questions);
      }
    } else {
      // @ts-ignore
      setSelectedQuestions(value);
    }
  };

  // question visualize change
  const handleQuestionVisualizeChange = (event: SelectChangeEvent<string>) => {
    if (typeof event.target.value == 'string') {
      setQuestionVisualize(JSON.parse(event.target.value));
      getDataVisualization(JSON.parse(event.target.value));
    }
  };

  //handle filter selection changes
  const handleFilterChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<any[]> , index: number, numValue?: number) => {
    const { value } = event.target;
    setFilters(filters => {
      const newFilters = [...filters];
      // console.log(newFilters);
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

  //map grid col when selected questions changes
  useEffect(() => {
    var temp: GridColDef[] = [];
    var tempQuestion: QuestionFilter[] = [];
    selectedQuestions.map(item => {
      let colLabel = item.label;
      //generate filter base on selected question
      if (item.type == 'user') {
        colLabel = lang == 'en' ? item.label : item.label_km;
        if (projectDetail) {
          if (projectDetail.submitted_users.length > 0) {
            tempQuestion.push({
              label: lang == 'en' ? item.label : item.label_km,
              type: item.type,
              data_type: item.data_type,
              index: item.order,
              values: [],
              options: projectDetail.submitted_users,
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
          options: projectDetail ? projectDetail.location_details.provinces : [],
        });
      } else if (item.type == 'district') {
        colLabel = lang == 'en' ? item.label : item.label_km;
        tempQuestion.push({
          label: lang == 'en' ? item.label : item.label_km,
          type: item.type,
          data_type: item.data_type,
          index: item.order,
          values: [],
          options: projectDetail ? projectDetail.location_details.districts : [],
        });
      } else if (item.type == 'commune') {
        colLabel = lang == 'en' ? item.label : item.label_km;
        tempQuestion.push({
          label: lang == 'en' ? item.label : item.label_km,
          type: item.type,
          data_type: item.data_type,
          index: item.order,
          values: [],
          options: projectDetail ? projectDetail.location_details.communes : [],
        });
      } else if (item.type == 'village') {
        colLabel = lang == 'en' ? item.label : item.label_km;
        tempQuestion.push({
          label: lang == 'en' ? item.label : item.label_km,
          type: item.type,
          data_type: item.data_type,
          index: item.order,
          values: [],
          options: projectDetail ? projectDetail.location_details.villages : [],
        });
      } else {
        tempQuestion.push({
          label: item.label,
          type: item.type,
          data_type: item.data_type,
          index: item.order - 1,
          values: [],
          options: item.options,
        });
      }
      temp.push({ field: item.id, headerName: colLabel, cellClassName: 'text-left', flex: 0.3 });
    });
    setGridCols(temp);
    setFilters(tempQuestion);
  }, [selectedQuestions, lang]);

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
        <Box>
          {selectedQuestions.length > 0 && gridRows.length > 0 && (
            <FormControl sx={{ minWidth: ' 100%', marginBottom: 2 }}>
              <InputLabel id='project-filter-label' sx={{ width: '100%' }}>
                {!questionVisualize ? GetContext('select_question_msg', lang) : GetContext('select_question', lang)}{' '}
              </InputLabel>

              <Select
                variant='standard'
                labelId='project-filter-label'
                id='question-visualize'
                value={JSON.stringify(questionVisualize)}
                label='Last Name'
                onChange={handleQuestionVisualizeChange}>
                {selectedQuestions.map(item => (
                  <MenuItem key={item.id} value={JSON.stringify(item)}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {questionVisualize && isChartLoading && (
            <Box display='flex' justifyContent='center' alignItems='center' height='100vh'>
              <CircularProgress />
            </Box>
          )}
          {!isChartLoading && questionVisualize && (
            <div>
              <Box display='flex' justifyContent='flex-end'>
                <Button onClick={handleDownloadChart} sx={{ marginRight: 1 }} variant='contained'>
                  {GetContext('export', lang)}
                </Button>
                <Button sx={{ backgroundColor: 'white', color: 'black' }} variant='contained' onClick={handleCloseChart}>
                  {GetContext('close', lang)}
                </Button>
              </Box>
              <div ref={chartRef}>
                <BarChart
                  dataset={dataset}
                  xAxis={[{ scaleType: 'band', dataKey: 'value' }]}
                  series={[{ dataKey: 'freq', label: questionVisualize.label }]}
                  height={400}
                  yAxis={[{ label: GetContext('responses', lang) }]}
                />
              </div>
            </div>
          )}
          <FormControl sx={{ minWidth: ' 100%', marginBottom: 2 }}>
            <InputLabel id='project-select' sx={{ width: '100%' }}>
              {!selectedProject ? GetContext('select_project_msg', lang) : GetContext('select_project', lang)}{' '}
            </InputLabel>

            <Select
              variant='standard'
              id='project-select'
              value={selectedProject}
              label='Last Name'
              onChange={handleProjectChange}>
              {projects.length == 0 && (
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
          {projectDetail && (
            <FormControl sx={{ minWidth: ' 100%', marginBottom: 2 }}>
              <InputLabel id='select-question' sx={{ width: '100%' }}>
                {selectedQuestions ? GetContext('select_question_msg', lang) : GetContext('select_question', lang)}{' '}
              </InputLabel>

              <Select variant='standard' id='select-question' value={selectedQuestions} multiple onChange={handleQuestionChange}>
                <MenuItem key='all' value='all'>
                  {selectedQuestions.length === projectDetail.questions.length ? GetContext('unselect_all', lang) : GetContext('select_all', lang)}
                </MenuItem>
                {projectDetail.questions.map(item => (
                  // @ts-ignore
                  <MenuItem key={item.id} value={item}>
                    {(item.order != -1) ? item.label : (lang == 'en') ? item.label : item.label_km}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {selectedQuestions.length > 0 && (
            <Button sx={{ marginRight: 1 }} variant='contained' onClick={() => setOpenDrawer(true)}>
              {GetContext('filter', lang)}
            </Button>
          )}
          {selectedQuestions.length > 0 && (
            <Button sx={{ marginRight: 1 }} variant='contained' onClick={() => downloadFile()}>
              {GetContext('export', lang)}
            </Button>
          )}
          {projectDetail && (
            <Button variant='contained' onClick={() => (isMapOpen ? setIsMapOpen(false) : setIsMapOpen(true))}>
              {isMapOpen ? GetContext('close_map', lang) : GetContext('open_map', lang)}
            </Button>
          )}
          {projectDetail && <Button>{GetContext('total', lang)}: {totalData}</Button>}
        </Box>
        {isMapOpen && (
          <Box sx={{ width: '100%', height: '100%', marginTop: '1rem' }}>
            <Map data={dataMaps} />
          </Box>
        )}
        {gridCols.length > 0 && (
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
            sx={{ width: '100%', height: '100%', marginTop: '1rem' }}
          />
        )}
        <Drawer
          key={drawerKey}
          anchor='right'
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          sx={{ zIndex: '1300', padding: '1rem' }}>
          <Box sx={{ width: 500, padding: '1rem' }}>
            <h1>{GetContext('filter', lang)}</h1>
            {filters.map((filter, index) => (
              <div key={index}>
                {!(filter.data_type == 'date' || filter.data_type == 'time') && (
                  <InputLabel sx={{ marginBottom: '5px' }}>
                    <b>{filter.label}</b>
                  </InputLabel>
                )}
                {filter.data_type == 'string' && (
                  <TextField
                    onChange={event => {
                      handleFilterChange(event, index);
                    }}
                    value={filter.values[0]}
                    fullWidth
                    sx={{ marginBottom: '10px' }}
                    label={GetContext('enter_text', lang)}
                    variant='outlined'
                  />
                )}

                {filter.data_type == 'number' && (
                  <div>
                    <TextField
                      onChange={event => {
                        handleFilterChange(event, index, 1);
                      }}
                      value={filter.values[0]}
                      sx={{ marginBottom: '10px' }}
                      type='number'
                      label={GetContext('enter_first_num', lang)}
                      variant='outlined'
                    />
                    <TextField
                      onChange={event => {
                        handleFilterChange(event, index, 2);
                      }}
                      value={filter.values[1]}
                      sx={{ marginBottom: '10px' }}
                      type='number'
                      label={GetContext('enter_second_num', lang)}
                      variant='outlined'
                    />
                  </div>
                )}

                {filter.data_type == 'array' && filter.index != -1 && (
                  <FormControl fullWidth sx={{ marginBottom: '10px' }}>
                    <InputLabel id='multi-select-label'>{GetContext('select_option', lang)}</InputLabel>
                    <Select
                      labelId='multi-select-label'
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

                {filter.data_type == 'array' && filter.index == -1 && filter.type != 'user' && (
                  <FormControl fullWidth sx={{ marginBottom: '10px' }}>
                    <InputLabel id='multi-select-label'>{GetContext('select_option', lang)}</InputLabel>
                    <Select
                      labelId='multi-select-label'
                      multiple
                      value={filter.values}
                      onChange={event => {
                        handleFilterChange(event, index);
                      }}
                      renderValue={selected => {
                        return selected
                          .map(value => {
                            const option = filter.options.find(option => value == option.id);
                            return option ? lang == 'en' ? option.name_en : option.name_km : '';
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
                {filter.data_type == 'array' && filter.index == -1 && filter.type == 'user' && (
                  <div>
                    <FormControl fullWidth sx={{ marginBottom: '10px' }}>
                      <InputLabel id='multi-select-label'>{GetContext('select_option', lang)}</InputLabel>
                      <Select
                        labelId='multi-select-label'
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
                  </div>
                )}
              </div>
            ))}
            <Button fullWidth variant='contained' onClick={handleFilter}>
              {GetContext('filter', lang)}
            </Button>
            <Button
              sx={{
                marginTop: '10px',
                backgroundColor: 'white',
                color: 'black',
                '&:hover': {
                  backgroundColor: 'white',
                  color: 'black',
                },
              }}
              fullWidth
              variant='contained'
              onClick={handleClearFilter}>
              {GetContext('clear_filter', lang)}
            </Button>
          </Box>
        </Drawer>
      </div>
    </AuthorizationCheck>
  );
};

export default DataViewPage;
