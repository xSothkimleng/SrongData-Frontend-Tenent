'use client';
import React, { useRef, useState, SyntheticEvent } from 'react';
import theme from '@/theme';
import axios from 'axios';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import PieChartCard from '@/components/charts/pie-chart';
import LineChartCard from '@/components/charts/line-chart';
import BarChartCard from '@/components/charts/bar-chart';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import html2canvas from 'html2canvas';
import { Indicator } from '@/types/indicatorOperation';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Button,
  Grid,
  Avatar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
} from '@mui/material';
import AuthorizationCheck from '@/components/AuthorizationCheck';
import { permissionCode } from '@/utils/permissionCode';
import useCheckFeatureAuthorization from '@/hooks/useCheckFeatureAuthorization';
import useLang from '@/store/lang';
import { GetContext } from '@/utils/language';

type ChartType = 'bar' | 'barVertical' | 'pie' | 'donut' | 'line' | 'lineArea';

interface ChartItem {
  image: string;
  value: ChartType;
}

type Project = {
  id: string;
  name: string;
  indicators: Indicator[];
};

type indicatorDetails = {
  description: string;
  label: string;
  result: { frequency: number; value: string }[];
  total: number;
  totalIndicator: number;
};

const chartList: ChartItem[] = [
  { image: '/dist/images/charts/chart-vertical.png', value: 'barVertical' },
  { image: '/dist/images/charts/pie-chart.png', value: 'pie' },
  { image: '/dist/images/charts/line-chart.png', value: 'line' },
  { image: '/dist/images/charts/horizontal-chart.png', value: 'bar' },
  { image: '/dist/images/charts/donut-chart.png', value: 'donut' },
  { image: '/dist/images/charts/area-chart.png', value: 'lineArea' },
];

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const ReportPage = () => {
  const lang = useLang(state => state.lang);
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [selectedChart, setSelectedChart] = React.useState<ChartType>('barVertical');
  const [openPickChartDialog, setOpenPickChartDialog] = React.useState(false);
  const [selectedIndicatorLabel, setSelectedIndicatorLabel] = React.useState<string | null>(null);
  const [selectedIndicatorIndex, setSelectedIndicatorIndex] = React.useState<number | null>(0);
  const [inputValue, setInputValue] = useState<string>('');
  const canExportGraph = useCheckFeatureAuthorization(permissionCode.exportGraph);
  const [selectedFilterDataset, setSelectedFilterDataset] = useState<
    { id: number; value: string | undefined; freq: number | undefined; color: string }[]
  >([]);

  const { data: allProjects = [] } = useQuery<Project[]>({
    queryKey: ['allProjects'],
    queryFn: async () => {
      const response = await axios.get('/api/get-all-project');
      const projects = response?.data?.data?.projects
        .filter((project: any) => project.status === 1 || project.status == 2)
        .map((project: any) => ({
          id: project.id,
          name: project.name,
          indicators: project.indicators,
        }));
      console.log('All Projects:', projects);
      return projects;
    },
  });

  const { data: indicatorDetails, isLoading } = useQuery<indicatorDetails>({
    queryKey: ['indicatorDetails', selectedProject?.id],
    queryFn: async () => {
      const encodedIds = encodeURIComponent(`${selectedProject?.id}/${selectedIndicatorIndex}`);
      const response = await axios.get(`/api/get-indicator-report/${encodedIds}`);
      console.log('Report Detail:', response.data.data);
      const selectedFilter = response.data.data?.result;
      if (selectedFilter) {
        const updatedSelectedFilterDataset = [
          // @ts-ignore
          ...selectedFilter.map((item, index) => ({
            id: index,
            value: item.value,
            freq: item.frequency,
            color: getRandomColor(),
          })),
        ];
        console.log('Updated Filter Dataset:', updatedSelectedFilterDataset);
        setSelectedFilterDataset(updatedSelectedFilterDataset);
      } else {
        console.warn('indicatorDetails.result is empty or not found.');
      }

      return response.data.data;
    },
    enabled: !!selectedProject?.indicators.length,
  });

  const columns: GridColDef[] = React.useMemo(
    () => [
      { field: 'value', headerName: GetContext('value', lang), cellClassName: 'text-left', flex: 1 },
      { field: 'freq', headerName: GetContext('frequency', lang), cellClassName: 'text-left', flex: 1 },
    ],
    [lang],
  );

  const handleProjectChange = (event: SelectChangeEvent<string>) => {
    const project = JSON.parse(event.target.value) as Project;
    setSelectedProject(project);

    // Reset the selected indicator to the first one from the newly selected project, if it exists
    if (project.indicators && project.indicators.length > 0) {
      setSelectedIndicatorLabel(project.indicators[0].label);
      setSelectedIndicatorIndex(0);
    } else {
      // If no indicators are available, set these to null or an appropriate default
      setSelectedIndicatorLabel(null);
      setSelectedIndicatorIndex(null);
    }
  };

  const handleIndicatorChange = (event: SyntheticEvent<Element, Event>, newValue: string | null) => {
    setSelectedIndicatorLabel(newValue);
    const selectedIndex = selectedProject?.indicators.findIndex(item => item.label === newValue);
    console.log('Selected Index:', selectedIndex);

    if (selectedIndex !== -1) {
      setSelectedIndicatorIndex(selectedIndex as number);
    } else {
      console.log('Indicator not found');
      setSelectedIndicatorIndex(null);
    }
  };

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
    <AuthorizationCheck requiredPermissions={permissionCode.viewReport}>
      {useCheckFeatureAuthorization(permissionCode.viewReport) && (
        <div>
          <Box>
            <FormControl sx={{ minWidth: '100%', marginBottom: 2 }}>
              <InputLabel id='project-filter-label'>
                {selectedProject ? GetContext('select_project', lang) : GetContext('select_project_msg', lang)}
              </InputLabel>
              <Select
                variant='standard'
                labelId='project-filter-label'
                id='last-name-filter'
                value={selectedProject ? JSON.stringify(selectedProject) : ''}
                label='Last Name'
                onChange={handleProjectChange}>
                {allProjects.length == 0 && (
                  <MenuItem key='empty' value='' disabled>
                    {GetContext('no_project', lang)}
                  </MenuItem>
                )}
                {allProjects.map(item => (
                  <MenuItem key={item.id} value={JSON.stringify(item)}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedProject && (
              <Box sx={{ minWidth: '100%', marginBottom: 2 }}>
                <Autocomplete
                  fullWidth
                  value={selectedIndicatorLabel ?? ''}
                  onChange={handleIndicatorChange}
                  inputValue={inputValue}
                  onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                  }}
                  options={selectedProject?.indicators.map(item => item.label) ?? []}
                  renderInput={params => (
                    <TextField {...params} variant='standard' label={GetContext('select_indicator_msg', lang)} />
                  )}
                />
              </Box>
            )}
          </Box>
          {selectedProject && (
            <Box className='g-dashboard-boxShadow p-[1rem]'>
              <Grid container spacing={2}>
                <Grid item xs={12} className='flex justify-center items-center'>
                  <h2>{selectedProject.name}</h2>
                </Grid>
                <Grid item xs={12}>
                  <Box className='flex items-center'>
                    <p className='mr-2 text-[1.8rem]'>{GetContext('indicator_no', lang)}</p>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 26, height: 26, padding: '1rem' }}>
                      {selectedIndicatorIndex != null ? selectedIndicatorIndex + 1 : 1}
                    </Avatar>
                    <Box component='p' sx={{ color: theme.palette.primary.main }} className='ml-2 text-[1.8rem]'>
                      {indicatorDetails?.label}
                    </Box>
                  </Box>
                  <Typography variant='body2' className='mt-2'>
                    {GetContext('description', lang)} : {indicatorDetails?.description}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Button variant='contained' className='mr-2' onClick={() => setOpenPickChartDialog(true)}>
                    {GetContext('select_chart', lang)}
                  </Button>
                  {canExportGraph && (
                    <Button onClick={handleDownloadChart} variant='contained'>
                      {GetContext('export', lang)}
                    </Button>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <div className='h-[50vh]' ref={chartRef}>
                    {selectedChart === 'bar' && <BarChartCard dataset={selectedFilterDataset} />}
                    {selectedChart === 'barVertical' && <BarChartCard dataset={selectedFilterDataset} layout='vertical' />}
                    {selectedChart === 'pie' && <PieChartCard dataset={selectedFilterDataset} />}
                    {selectedChart === 'donut' && <PieChartCard dataset={selectedFilterDataset} />}
                    {selectedChart === 'line' && <LineChartCard dataset={selectedFilterDataset} />}
                    {selectedChart == 'lineArea' && <LineChartCard dataset={selectedFilterDataset} isArea={true} />}
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <DataGrid
                    columns={columns}
                    rows={selectedFilterDataset}
                    initialState={{
                      filter: {
                        filterModel: {
                          items: [],
                          quickFilterValues: [''],
                        },
                      },
                      pagination: {
                        paginationModel: {
                          pageSize: 10,
                        },
                      },
                    }}
                    autoHeight
                    disableRowSelectionOnClick
                    pageSizeOptions={[10]}
                    sx={{ width: '100%', height: '100%' }}
                  />
                </Grid>
              </Grid>
              <Dialog fullWidth maxWidth='md' open={openPickChartDialog} onClose={() => setOpenPickChartDialog(false)}>
                <DialogTitle>Select Chart</DialogTitle>
                <DialogContent>
                  <Grid container justifyContent='center' alignItems='center'>
                    {chartList.map((item, index) => (
                      <Grid item xs={4} key={index} sx={{ padding: '1rem' }}>
                        <Box
                          onClick={() => setSelectedChart(item.value)}
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            background: 'none',
                            padding: '1rem',
                            borderRadius: '16px',
                            ...(selectedChart === item.value && {
                              background: 'rgba(0, 150, 136, 0.1)',
                            }),
                            '&:hover': {
                              background: 'rgba(0, 150, 136, 0.1)',
                            },
                          }}>
                          <Image src={item.image} alt={`${item.value} Chart`} width={150} height={150} />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenPickChartDialog(false)} variant='outlined'>
                    Close
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          )}
        </div>
      )}
    </AuthorizationCheck>
  );
};

export default ReportPage;
