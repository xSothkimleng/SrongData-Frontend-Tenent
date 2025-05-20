import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import axios from 'axios';
import PieChartCard from '../charts/pie-chart';
import BarChartCard from '../charts/bar-chart';
import ProjectSummaryTable from '@/components/dashboard/data-table-filter';
import RequestLogs from '@/components/dashboard/request-logs';
import useCheckFeatureAuthorization from '@/hooks/useCheckFeatureAuthorization';
import { permissionCode } from '@/utils/permissionCode';
import { useQuery } from '@tanstack/react-query';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import Legend from '../ChartLegend';
import ActivityLogs from './activity-logs';

interface ChartsSectionProps {
  barChartData: any[];
  isBarChartLoading: boolean;
  isBarChartError: boolean;
  isOpenRequestLog: boolean;
}

type Project = {
  id: string;
  name: string;
};

const fetchProjectData = async (): Promise<Project[]> => {
  try {
    const response = await axios.get('/api/get-all-project');
    return response.data.data.projects
      .filter((project: any) => project.status === 1)
      .map((project: any) => ({
        id: project.id,
        name: project.name,
      }));
  } catch (error) {
    console.error('Error fetching project data:', error);
    throw error;
  }
};

const DashboardInfoSection: React.FC<ChartsSectionProps> = ({
  barChartData,
  isBarChartLoading,
  isBarChartError,
  isOpenRequestLog,
}) => {
  const lang = useLang(state => state.lang);
  const [selectedProject, setSelectedProject] = useState<Project>({ id: '', name: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [requestLogsTabValue, setRequestLogsTabValue] = React.useState(0);

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setRequestLogsTabValue(newValue);
  };

  const [openFullPieChartDialog, setOpenFullPieChartDialog] = useState(false);

  const {
    data: barChartResponseData = [],
    isLoading: isBarChartResponseLoading,
    isError: isBarChartResponseError,
  } = useQuery({
    queryKey: [selectedProject, lang],
    queryFn: async () => {
      const response = await axios.get('/api/config', {
        params: { endpoint: `dashboard/project-virtualization/${selectedProject.id}?lang=${lang}` },
      });
      console.log(response);
      return response.data.data;
    },
    enabled: selectedProject?.id !== '',
  });

  useEffect(() => {
    const fetchProjects = async () => {
      const projects = await fetchProjectData();
      setAllProjects(projects);
      setSelectedProject(projects[0]);
    };
    fetchProjects();
  }, []);

  const handleSelectProject = async (e: SelectChangeEvent<string>) => {
    if (typeof e.target.value == 'string') {
      setSelectedProject(JSON.parse(e.target.value));
    }
    setOpenDialog(!openDialog);
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={isOpenRequestLog ? 8.5 : 12}>
        <Grid container spacing={3}>
          {useCheckFeatureAuthorization(permissionCode.viewProjectSummary) && (
            <Grid item xs={12}>
              <ProjectSummaryTable />
            </Grid>
          )}
          {useCheckFeatureAuthorization(permissionCode.viewProjectVirtualization) && (
            <>
              <Grid item xs={isOpenRequestLog ? 7 : 8}>
                {allProjects.length > 0 ? (
                  <div className='boxShadow-1 border-1 h-full flex flex-col p-[1rem]'>
                    <Box className='flex justify-between items-center'>
                      <Typography className='text-[1.4rem] w-fit font-medium px-[20px] bg-[#72d6d6] text-[white] rounded-[14px] rounded-tl-none rounded-bl-none'>
                        {GetContext('virtualize_project', lang)} {selectedProject?.name}
                      </Typography>
                      <Box className='flex'>
                        <IconButton onClick={() => setOpenDialog(!openDialog)} sx={{ padding: '0' }}>
                          <FilterAltIcon color='primary' fontSize='large' />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box className='flex justify-center items-center h-full'>
                      <Box className='h-full w-full flex items-center justify-center'>
                        <BarChartCard
                          dataset={barChartResponseData}
                          isLoading={isBarChartResponseLoading}
                          isError={isBarChartResponseError}
                        />
                      </Box>
                    </Box>
                  </div>
                ) : (
                  <Typography component='h2' sx={{ fontSize: '1.4rem', textAlign: 'center', padding: '1rem 1rem 0 1rem' }}>
                    {GetContext('project_notavailable', lang)}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={isOpenRequestLog ? 5 : 4}>
                <Box className='boxShadow-1 h-full p-[1rem] border-1 overflow-hidden'>
                  <Box className='flex justify-between items-center'>
                    <Typography className='text-[1.4rem] w-fit font-medium px-[20px] bg-[#72d6d6] text-[white] rounded-[14px] rounded-tl-none rounded-bl-none'>
                      {GetContext('project_in_locations', lang)}
                    </Typography>
                    <IconButton sx={{ padding: '0' }} onClick={() => setOpenFullPieChartDialog(true)}>
                      <FullscreenIcon color='primary' fontSize='large' />
                    </IconButton>
                  </Box>
                  <Box className='h-[35vh] w-full'>
                    <PieChartCard
                      dataset={barChartData.slice()}
                      isLoading={isBarChartLoading}
                      isError={isBarChartError}
                      showLegend={false}
                    />
                  </Box>
                  <Legend data={barChartData} limit={6} />
                </Box>
                <Dialog maxWidth='lg' fullWidth open={openFullPieChartDialog} onClose={() => setOpenFullPieChartDialog(false)}>
                  <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {GetContext('project_in_locations', lang)}{' '}
                    <IconButton onClick={() => setOpenFullPieChartDialog(false)}>
                      <CloseIcon />
                    </IconButton>
                  </DialogTitle>
                  <DialogContent sx={{ display: 'flex' }}>
                    <Box className='h-[70vh] w-[75%]'>
                      <PieChartCard
                        dataset={barChartData}
                        isLoading={isBarChartLoading}
                        isError={isBarChartError}
                        showLegend={false}
                      />
                    </Box>
                    <Box className='h-full w-fit'>
                      <Legend data={barChartData} orientation='vertical' />
                    </Box>
                  </DialogContent>
                </Dialog>
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
      {isOpenRequestLog && (
        <Grid item xs={3.5}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={requestLogsTabValue} onChange={handleChangeTab} aria-label='basic tabs example'>
                <Tab label='Request' {...a11yProps(0)} />
                <Tab label='Activity' {...a11yProps(1)} />
              </Tabs>
            </Box>

            <Box>
              {requestLogsTabValue === 0 && <RequestLogs />}
              {requestLogsTabValue === 1 && <ActivityLogs />}
            </Box>
          </Box>
        </Grid>
      )}
      <Dialog fullWidth open={openDialog} onClose={() => setOpenDialog(!openDialog)}>
        <DialogTitle>{GetContext('select_project', lang)}</DialogTitle>
        <DialogContent dividers>
          <FormControl sx={{ minWidth: '100%', marginBottom: 2 }}>
            <InputLabel id='project-filter-label'>{GetContext('project', lang)}</InputLabel>
            <Select
              labelId='project-filter-label'
              id='project-filter'
              value={JSON.stringify(selectedProject)}
              label='Project'
              onChange={handleSelectProject}>
              {allProjects.map(project => (
                <MenuItem key={project.id} value={JSON.stringify(project)}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

export default DashboardInfoSection;
