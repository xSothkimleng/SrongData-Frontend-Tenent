'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CircularProgress from '@mui/material/CircularProgress';
import { enqueueSnackbar } from 'notistack';
import {
  useTheme,
  Box,
  Avatar,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
  Typography,
  LinearProgress,
} from '@mui/material';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';
import showSnackbar from '@/utils/snackbarHelper';

type Project = {
  id: string;
  name: string;
};

interface Response {
  question: string;
  answer: string | number;
}

interface RequestLogsData {
  id: string;
  submitted_by: string;
  active_response: Response[];
  pending_response: Response[];
  requested_date: string;
  status: number;
}

type RequestNotificationProps = {
  id: string;
  user: string;
  request: number;
  time: string;
  project?: Project;
  active_response?: Response[];
  pending_response?: Response[];
};

const PutApproveRequest = async (projectId: string | undefined, requestId: string, status: number) => {
  // console.log('Approve Request API', projectId, requestId, status);
  const encodedIds = encodeURIComponent(`${projectId}/${requestId}/${status}`);
  const response = await axios.put(`/api/approve-request/${encodedIds}`);
  return response.data;
};

const RequestNotification: React.FC<RequestNotificationProps> = ({
  id,
  user,
  request,
  time,
  project,
  active_response,
  pending_response,
}) => {
  const lang = useLang(state => state.lang);
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  const approveMutation = useMutation({
    mutationFn: () => PutApproveRequest(project?.id, id, isRejected ? (request == 0 ? 3 : 1) : request),
    onSuccess: data => {
      // @ts-ignore
      queryClient.invalidateQueries(['requestLogs']);
      showSnackbar(data.message, 'success');
      setOpenDialog(false);
    },
    onError: error => {
      console.error('Error approving request:', error);
      showSnackbar(error.message, 'error');
    },
  });

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return GetContext('delete', lang);
      case 2:
        return GetContext('edit', lang);
      default:
        return GetContext('unknown', lang);
    }
  };

  const handleApprove = (isRejected: boolean) => {
    if (isRejected) {
      setIsRejected(true);
    }
    approveMutation.mutate();
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0' }}>
      <Box className='mr-4'>
        <Avatar>{user[0]}</Avatar>
      </Box>
      <Box>
        <Box>
          <span className='font-bold'>{user}</span> {GetContext('request_to', lang)}{' '}
          <span className='font-bold'>{getStatusText(request)}</span>
          &nbsp;{lang == 'en' ? 'a ' : ''}
          <span className='font-bold underline text-cyan-600 cursor-pointer' onClick={() => setOpenDialog(true)}>
            {GetContext('record', lang)}
          </span>{' '}
          {lang == 'en' ? 'of' : ''} <span className='font-bold'>{project?.name}</span>
        </Box>
        <Box className='mb-3'>{time}</Box>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            {/* @ts-ignore */}
            <Button fullWidth variant='contained' onClick={() => handleApprove(false)} disabled={approveMutation.isLoading}>
              {/* @ts-ignore */}
              {approveMutation.isLoading ? <CircularProgress size={24} /> : GetContext('approve', lang)}
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth variant='contained' color='warning' onClick={() => handleApprove(true)}>
              {/* @ts-ignore */}
              {approveMutation.isLoading ? <CircularProgress size={24} /> : GetContext('reject', lang)}
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Dialog fullWidth maxWidth='lg' open={openDialog} onClose={() => setOpenDialog(!openDialog)}>
        <DialogTitle sx={{ textAlign: 'center' }}>{project?.name}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Box>
                <p>{GetContext('active_response', lang)}</p>
                {active_response?.map((response, index) => (
                  <Box key={index}>
                    <Box sx={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem' }}>{response.question}</Box>
                    <Box sx={{ padding: '0.5rem' }}>{response.answer}</Box>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                <p>{GetContext('pending_response', lang)}</p>
                {pending_response?.map((response, index) => (
                  <Box key={index}>
                    <Box sx={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem' }}>{response.question}</Box>
                    <Box sx={{ padding: '0.5rem' }}>{response.answer}</Box>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Button variant='contained' color='success' onClick={() => handleApprove(false)} className='mr-2'>
              {/* @ts-ignore */}
              {approveMutation.isLoading ? <CircularProgress size={24} /> : GetContext('approve', lang)}
            </Button>
            <Button variant='contained' color='warning' onClick={() => handleApprove(true)}>
              {GetContext('reject', lang)}
            </Button>
          </Box>
          <Box>
            <Button variant='contained' onClick={() => setOpenDialog(!openDialog)}>
              {GetContext('close', lang)}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const fetchProjectData = async () => {
  const response = await axios.get('/api/get-all-project');
  const projects = response?.data?.data?.projects
    .filter((project: any) => project.status === 1)
    .map((project: any) => ({
      id: project.id,
      name: project.name,
    }));
  return projects;
};

const fetchRequestLogs = async (id: string) => {
  const response = await axios.get(`/api/get-pending-request/${id}`);
  return response.data.data;
};

const RequestLogs = () => {
  const lang = useLang(state => state.lang);
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    const project = JSON.parse(event.target.value);
    // console.log('project', project);
    setSelectedProject(project);
  };

  const { data: allProjects = [], refetch: refetchAllProject } = useQuery<Project[]>({
    queryKey: ['allProjects'],
    queryFn: fetchProjectData,
  });

  const {
    data: requestLogs = [],
    isLoading: isRequestingLogs,
    error: isRequestingLogsError,
    refetch: refetchRequestLogs,
  } = useQuery<RequestLogsData[]>({
    queryKey: ['requestLogs', selectedProject?.id],
    queryFn: () => fetchRequestLogs(selectedProject?.id || ''),
    enabled: !!selectedProject,
  });

  return (
    <Box className='border-1 boxShadow-1 h-full'>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ backgroundColor: theme.palette.primary.main }} className='mr-4'>
            {requestLogs.length}
          </Avatar>
          <p className='text-xl'>{GetContext('request_logs', lang)}</p>
        </Box>
        <Box className='flex items-center'>
          <IconButton onClick={() => setOpenDialog(true)}>
            <FilterAltIcon color='primary' fontSize='large' />
          </IconButton>
        </Box>
      </Box>
      <Divider />
      <Box className='px-[1rem] h-[90vh] overflow-y-scroll'>
        {isRequestingLogsError && <div>{GetContext('fail_loaddata', lang)}</div>}
        {isRequestingLogs ? (
          <>
            <LinearProgress />
            <Typography className='text-center'>{GetContext('loading', lang)}...</Typography>
          </>
        ) : (
          <>
            {requestLogs.length == 0 && <Typography className='text-center'>No Request</Typography>}
            {requestLogs.map((item, index) => (
              <React.Fragment key={index}>
                <RequestNotification
                  id={item.id}
                  user={item.submitted_by}
                  request={item.status}
                  project={selectedProject ? selectedProject : undefined}
                  time={item.requested_date}
                  active_response={item.active_response}
                  pending_response={item.pending_response}
                />
                <Divider />
              </React.Fragment>
            ))}
          </>
        )}
      </Box>
      <Dialog fullWidth open={openDialog} onClose={() => setOpenDialog(!openDialog)}>
        <DialogTitle>{GetContext('select_project', lang)}</DialogTitle>
        <DialogContent dividers>
          <FormControl sx={{ minWidth: '100%', marginBottom: 2 }}>
            <InputLabel id='project-filter-label'>{GetContext('project', lang)}</InputLabel>
            <Select
              labelId='project-filter-label'
              id='project-filter'
              value={selectedProject?.id ? JSON.stringify(allProjects.find(project => project.id === selectedProject.id)) : ''}
              label={GetContext('project', lang)}
              onChange={handleFilterChange}>
              {allProjects.length == 0 && (
                <MenuItem key='emptu' disabled value=''>
                  {GetContext('no_project', lang)}
                </MenuItem>
              )}
              {allProjects.map(project => (
                <MenuItem key={project.id} value={JSON.stringify(project)}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default RequestLogs;
