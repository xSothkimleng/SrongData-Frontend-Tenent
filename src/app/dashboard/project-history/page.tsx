'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { styled } from '@mui/system';
import Link from 'next/link';
import { UserProfile } from '@/types/user';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { enqueueSnackbar } from 'notistack';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import CloseIcon from '@mui/icons-material/Close';
import EditProjectPage from '@/components/dashboard/edit-project';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridRenderCellParams,
  GridSlots,
  GridFilterModel,
} from '@mui/x-data-grid';
import {
  Button,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
} from '@mui/material';
import AuthorizationCheck from '@/components/AuthorizationCheck';
import { permissionCode } from '@/utils/permissionCode';
import useCheckFeatureAuthorization from '@/hooks/useCheckFeatureAuthorization';
import useLang from '@/store/lang';
import { GetContext } from '@/utils/language';
import ConfirmationDialog from '@/components/dashboard/confirmation-dialog';
import CustomToolbar from '@/components/DataGridToolbar';
import HeaderTitle from '@/components/HeaderTitle';
import TopicIcon from '@mui/icons-material/Topic';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useRouter } from 'next/navigation';

export interface Filter {
  index: number;
  function: string;
  values: any[];
}

export interface Indicator {
  label: string;
  description: string;
  filters: Filter[];
}

export interface Project {
  id: string;
  projectId: string;
  name: string;
  description: string;
  project_location: string;
  questions: string[];
  users: string[];
  indicators: Indicator[];
  created_by: string;
  status: string;
  data_collected: number;
  created_at: string;
  updated_at: string;
}

const ActionCell: React.FC<{
  row: Project;
  users: UserProfile[];
  canEditProject: boolean;
  canCloneProject: boolean;
  canAssignUser: boolean;
  canDeleteProject: boolean;
  canUpdateProjectStatus: boolean;
}> = ({ row, users, canAssignUser, canCloneProject, canDeleteProject, canEditProject, canUpdateProjectStatus }) => {
  const router = useRouter();
  const lang = useLang(state => state.lang);
  const queryClient = useQueryClient();
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
  const [password, setPassword] = useState('');
  const [openAssignUserDialog, setOpenAssignUserDialog] = useState(false);
  const [openProjectStatusDialog, setOpenProjectStatusDialog] = useState(false);
  const [openViewProjectDetailsDialog, setOpenViewProjectDetailsDialog] = useState(false);
  const [openDeleteProjectDialog, setOpenDeleteProjectDialog] = useState(false);
  const [openCloneProjectDialog, setOpenCloneProjectDialog] = useState(false);
  const [openEditProjectDialog, setOpenEditProjectDialog] = useState(false);

  const updateProjectStatusMutation = useMutation<unknown, Error, any>({
    mutationFn: async (data: any) => {
      const encodedIds = encodeURIComponent(`${data.projectId}`);
      const res = await axios.put(`/api/update-project-status/${encodedIds}`);
      // console.log('Update project status:', res.data);
      return res.data;
    },
    // @ts-ignore
    onSuccess: async data => {
      // console.log('invite successful:', data);
      // @ts-ignore
      queryClient.invalidateQueries('AllProjects');
      // @ts-ignore
      enqueueSnackbar(data.message, { variant: 'success' });
      setOpenEditProjectDialog(false);
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.message || 'Error Updating project.', {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
      console.error('Error Updating User:', error);
    },
  });

  const updateProjectUsersMutation = useMutation<unknown, Error, any>({
    mutationFn: async (data: any) => {
      const userIds = selectedUsers.map(user => user.id);
      // console.log('Updating project users...:', data);
      // console.log('Selected users:', userIds);
      const encodedIds = encodeURIComponent(`${data.projectId}`);
      const res = await axios.put(`/api/update-project-user/${encodedIds}`, { users: userIds });
      // console.log('Update project users:', res.data);
      return res.data;
    },
    // @ts-ignore
    onSuccess: async data => {
      // @ts-ignore
      queryClient.invalidateQueries('AllProjects');
      // @ts-ignore
      enqueueSnackbar(data.message, {
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.message || 'Error Updating project.', {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
      console.error('Error Updating project:', error);
    },
  });

  const deleteProjectMutation = useMutation<Error>({
    mutationFn: async () => {
      // console.log('row', row);
      // @ts-ignore
      const encodedIds = encodeURIComponent(`${row.projectId}`);
      const res = await axios.put(`/api/delete-project/${encodedIds}`, { password: password });
      // console.log('Update project users:', res.data);
      return res.data;
    },
    // @ts-ignore
    onSuccess: async data => {
      // @ts-ignore
      queryClient.invalidateQueries('AllProjects');
      // @ts-ignore
      enqueueSnackbar(data.message, {
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
      setPassword('');
      setOpenDeleteProjectDialog(false);
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.message || 'Error Updating project.', {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
      console.error('Error Updating project:', error);
    },
  });

  const cloneProjectMutation = useMutation<Error>({
    mutationFn: async () => {
      // @ts-ignore
      const encodedIds = encodeURIComponent(`${row.projectId}`);
      const res = await axios.post(`/api/clone-project/${encodedIds}`);

      return res.data;
    },
    // @ts-ignore
    onSuccess: async data => {
      // @ts-ignore
      queryClient.invalidateQueries('AllProjects');
      // @ts-ignore
      enqueueSnackbar(data.message, {
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
      setOpenCloneProjectDialog(false);
    },
    onError: (error: any) => {
      enqueueSnackbar('Project has reach limit', {
        variant: 'warning',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
      console.error('Error Updating project:', error);
    },
  });

  const handleUpdateProjectStatus = (row: Project) => {
    // @ts-ignore
    updateProjectStatusMutation.mutate({ projectId: row.projectId });
  };

  const handleAssignUser = () => {
    try {
      const allUser = users;

      const preselectedUsers = row.users
        .map(user => {
          // @ts-ignore
          return allUser.find(u => u.id === user.id);
        })
        .filter(Boolean) as UserProfile[];

      setSelectedUsers(preselectedUsers);
    } catch (e) {
      console.log('Error:', e);
    } finally {
      setOpenAssignUserDialog(true);
    }
  };

  const handleDeleteProject = () => {
    deleteProjectMutation.mutate();
  };

  const handleCloneProject = () => {
    cloneProjectMutation.mutate();
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/dashboard/project-history/project-detail/${projectId}`);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Tooltip title='View Project Details'>
        <Button variant='contained' color='info' sx={{ borderRadius: '28px' }} onClick={() => handleViewProject(row.projectId)}>
          <VisibilityOutlinedIcon />
        </Button>
      </Tooltip>
      {canUpdateProjectStatus && (
        <Tooltip title={GetContext('update_project_status', lang)}>
          <Button
            disabled={row.status != 'Completed' ? false : true}
            variant='contained'
            color='primary'
            sx={{ borderRadius: '28px' }}
            onClick={() => setOpenProjectStatusDialog(true)}>
            <SystemUpdateAltIcon />
          </Button>
        </Tooltip>
      )}
      {canEditProject && (
        <Tooltip title={GetContext('edit_project', lang)}>
          <Button
            variant='contained'
            onClick={() => setOpenEditProjectDialog(true)}
            color='warning'
            sx={{ borderRadius: '28px' }}>
            <EditIcon />
          </Button>
        </Tooltip>
      )}
      {canAssignUser && (
        <Tooltip title={GetContext('assign_user', lang)}>
          <Button
            disabled={row.status == 'Completed' ? true : false}
            variant='contained'
            color='success'
            sx={{ borderRadius: '28px' }}
            onClick={() => handleAssignUser()}>
            <StopCircleIcon />
          </Button>
        </Tooltip>
      )}
      {canDeleteProject && (
        <Tooltip title={GetContext('delete_project', lang)}>
          <Button
            variant='contained'
            color='secondary'
            sx={{ borderRadius: '28px' }}
            onClick={() => setOpenDeleteProjectDialog(true)}>
            <DeleteIcon />
          </Button>
        </Tooltip>
      )}
      {canCloneProject && (
        <Tooltip title={GetContext('clone_project', lang)}>
          <Button variant='contained' color='info' sx={{ borderRadius: '28px' }} onClick={() => setOpenCloneProjectDialog(true)}>
            <FileCopyIcon />
          </Button>
        </Tooltip>
      )}
      <Dialog fullWidth maxWidth='md' open={openAssignUserDialog} onClose={() => setOpenAssignUserDialog(false)}>
        <DialogTitle>{GetContext('assign_user', lang)}</DialogTitle>
        <DialogContent dividers>
          <Autocomplete
            multiple
            id='checkboxes-tags-demo'
            fullWidth
            options={users}
            disableCloseOnSelect
            getOptionLabel={option => option.first_name + ' ' + option.last_name}
            value={selectedUsers}
            onChange={(event, newValue) => {
              setSelectedUsers(newValue);
            }}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.first_name + ' ' + option.last_name}
              </li>
            )}
            renderInput={params => <TextField {...params} label={GetContext('user', lang)} placeholder='Select users' />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignUserDialog(false)}>{GetContext('close', lang)}</Button>
          <Button variant='contained' onClick={() => updateProjectUsersMutation.mutate(row)}>
            {GetContext('edit', lang)}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth
        maxWidth='xs'
        open={openProjectStatusDialog}
        onClose={() => setOpenProjectStatusDialog(!openProjectStatusDialog)}>
        <DialogTitle>
          <p>{GetContext('update_project_status', lang)}</p>
        </DialogTitle>
        <DialogContent>{GetContext('update_project_status_msg', lang)}</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProjectStatusDialog(false)}>{GetContext('cancel', lang)}</Button>
          <Button variant='contained' color='info' onClick={() => handleUpdateProjectStatus(row)}>
            {GetContext('edit', lang)}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        title={GetContext('delete_project', lang)}
        message={GetContext('confirm_password_msg', lang)}
        open={openDeleteProjectDialog}
        onClose={() => setOpenDeleteProjectDialog(!openDeleteProjectDialog)}
        onConfirm={handleDeleteProject}
        confirmPassword={password}
        setConfirmPassword={setPassword}
        withPassword
      />
      <Dialog
        fullWidth
        maxWidth='xs'
        open={openCloneProjectDialog}
        onClose={() => setOpenCloneProjectDialog(!openCloneProjectDialog)}>
        <DialogTitle>
          <p>{GetContext('clone_project', lang)}</p>
        </DialogTitle>
        <DialogContent>{GetContext('clone_msg', lang)}</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCloneProjectDialog(false)}>{GetContext('cancel', lang)}</Button>
          <Button variant='contained' color='info' onClick={() => handleCloneProject()}>
            {GetContext('clone_project', lang)}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog fullScreen open={openEditProjectDialog} onClose={() => setOpenEditProjectDialog(false)}>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton edge='start' color='inherit' onClick={() => setOpenEditProjectDialog(false)} aria-label='close'>
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
              {GetContext('edit_project_title', lang)} {row.name}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ padding: '2%' }}>
          <EditProjectPage projectId={row.projectId} setOpenEditProjectDialog={setOpenEditProjectDialog} />
        </Box>
      </Dialog>
    </Box>
  );
};

const fetchUsersWithStatus = async (): Promise<UserProfile[]> => {
  try {
    const response = await axios.get('/api/get-all-user');
    return response.data.data.user;
  } catch (error) {
    console.error('Error fetching users with status 1:', error);
    throw error;
  }
};

const ProjectHistoryPage = () => {
  const lang = useLang(state => state.lang);
  const canUpdateProjectStatus = useCheckFeatureAuthorization(permissionCode.updateProjectStatus);
  const canDeleteProject = useCheckFeatureAuthorization(permissionCode.deleteProject);
  const canCloneProject = useCheckFeatureAuthorization(permissionCode.cloneProject);
  const canEditProject = useCheckFeatureAuthorization(permissionCode.updateProjectDetails);
  const canAssignUser = useCheckFeatureAuthorization(permissionCode.updateProjectDetails);
  const canCreateProject = useCheckFeatureAuthorization(permissionCode.createProject);
  const [rowSize, setRowSize] = useState<number>(0);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: [''],
  });
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });

  const fetchAllProject = async (): Promise<Project[]> => {
    let query = '';
    if (filterModel.quickFilterValues && filterModel.quickFilterValues.length > 0) {
      query = filterModel.quickFilterValues[0];
    }
    const response = await axios.get('/api/config', {
      params: {
        endpoint: `project/all?data_collected=1&limit=${paginationModel.pageSize}&page=${
          paginationModel.page + 1
        }&query=${query}`,
      },
    });
    setRowSize(response.data.data.count);
    // console.log('Fetched projects:', response.data.data.projects);
    return response.data.data.projects;
  };

  const {
    data: projects = [],
    isLoading: isTableLoading,
    isError,
  } = useQuery<Project[]>({
    queryKey: ['AllProjects', paginationModel, filterModel],
    queryFn: fetchAllProject,
  });

  const { data: fetchedUserData = [] } = useQuery<UserProfile[]>({
    queryKey: ['allUsers'],
    queryFn: fetchUsersWithStatus,
  });

  const columns: GridColDef[] = React.useMemo(
    () => [
      {
        field: 'id',
        headerName: GetContext('no', lang),
        cellClassName: 'text-left',
        flex: 0.4,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'name',
        headerName: GetContext('name', lang),
        cellClassName: 'text-left',
        flex: 1.6,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'status',
        headerName: GetContext('status', lang),
        cellClassName: 'text-left',
        flex: 1,
        headerClassName: 'super-app-theme--header',
        renderCell: (params: any) => {
          let backgroundColor;
          let textColor;

          switch (params.value) {
            case 'Active':
              backgroundColor = 'rgba(0, 255, 0, 0.1)';
              textColor = 'green';
              break;
            case 'Inactive':
              backgroundColor = 'rgba(255, 0, 0, 0.1)';
              textColor = 'red';
              break;
            case 'Completed':
              backgroundColor = 'rgba(77,171,245,0.1)';
              textColor = 'rgb(77,171,245)';
              break;
            default:
              backgroundColor = 'rgba(0, 0, 0, 0.1)';
              textColor = 'rgb(77,171,245)';
              break;
          }

          return (
            <Box>
              <Box component='span' sx={{ backgroundColor, color: textColor, borderRadius: '24px', padding: '0.3rem 0.8rem' }}>
                {params.value}
              </Box>
            </Box>
          );
        },
      },
      {
        field: 'isStarted',
        headerName: GetContext('data_collected', lang),
        cellClassName: 'text-left',
        flex: 1,
        headerClassName: 'super-app-theme--header',
        renderCell: (params: any) => {
          if (params.value === undefined) return;

          let backgroundColor;
          let textColor;

          switch (params.value) {
            case 'Yes':
              backgroundColor = 'rgba(0, 255, 0, 0.1)';
              textColor = 'green';
              break;
            case 'No':
              backgroundColor = 'rgba(255, 0, 0, 0.1)';
              textColor = 'red';
              break;

            default:
              backgroundColor = 'rgba(0, 0, 0, 0.1)';
              textColor = 'rgb(77,171,245)';
              break;
          }

          return (
            <Box>
              <Box component='span' sx={{ backgroundColor, color: textColor, borderRadius: '24px', padding: '0.3rem 0.8rem' }}>
                {params.value}
              </Box>
            </Box>
          );
        },
      },
      {
        field: 'created_at',
        headerName: GetContext('created_at', lang),
        cellClassName: 'text-left',
        flex: 1,
        headerClassName: 'super-app-theme--header',
        valueGetter: (params: any) => params.substring(0, 10),
      },
      {
        field: 'action',
        headerName: GetContext('action', lang),
        flex: 2,
        headerClassName: 'super-app-theme--header',
        renderCell: (params: GridRenderCellParams<Project>) => (
          <ActionCell
            row={params.row}
            users={fetchedUserData}
            canAssignUser={canAssignUser}
            canEditProject={canEditProject}
            canCloneProject={canCloneProject}
            canDeleteProject={canDeleteProject}
            canUpdateProjectStatus={canUpdateProjectStatus}
          />
        ),
      },
    ],
    [fetchedUserData, canAssignUser, canEditProject, canCloneProject, canDeleteProject, canUpdateProjectStatus, lang],
  );

  const rows = projects.map((project: Project, index) => ({
    ...project,
    id: paginationModel.page * paginationModel.pageSize + index + 1,
    projectId: project.id,
    status: project.status == '1' ? 'Active' : project.status == '2' ? 'Completed' : 'Inactive',
    isStarted: project.data_collected > 0 ? 'Yes' : 'No',
    users: fetchedUserData.filter(user => project.users.includes(user.id)),
  }));

  const handleFilterModelChange = (event: GridFilterModel) => {
    if (event.quickFilterValues) {
      if (event.quickFilterValues.length == 0) {
        setFilterModel({ ...event, quickFilterValues: [''] });
      } else {
        setFilterModel(event);
      }
      setPaginationModel({ ...paginationModel, page: 0 });
    }
  };

  if (isError) return <div>Error loading projects</div>;

  return (
    <AuthorizationCheck requiredPermissions={permissionCode.viewProjectHistory}>
      <Grid container className='w-full h-full'>
        <Grid item xs={12}>
          <Box className='flex justify-between items-center mb-4'>
            <HeaderTitle
              icon={<TopicIcon color='primary' sx={{ fontSize: '1.4rem' }} />}
              title={GetContext('project_management', lang)}
            />
            {canCreateProject && (
              <div>
                <Link href='/dashboard/create-project'>
                  <Button
                    variant='contained'
                    startIcon={<AddCircleOutlineOutlinedIcon />}
                    sx={{ borderRadius: '14px', fontSize: '1rem' }}>
                    {GetContext('create_project', lang)}
                  </Button>
                </Link>
              </div>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} sx={{ width: '100%', height: '100%' }} className='border-1 boxShadow-1'>
          <DataGrid
            rows={rows}
            columns={columns}
            rowCount={rowSize}
            paginationMode='server'
            paginationModel={paginationModel}
            filterModel={filterModel}
            filterMode='server'
            onPaginationModelChange={setPaginationModel}
            onFilterModelChange={handleFilterModelChange}
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
            slots={{ toolbar: CustomToolbar, loadingOverlay: LinearProgress as GridSlots['loadingOverlay'] }}
            loading={isTableLoading}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
            autoHeight
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            disableRowSelectionOnClick
            disableColumnSorting
            disableColumnMenu
            pageSizeOptions={[10, 25, 50, 100]}
            columnVisibilityModel={{
              action: canUpdateProjectStatus || canDeleteProject || canCloneProject || canEditProject ? true : false,
            }}
            sx={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '0px',
              '& .super-app-theme--header': {
                backgroundColor: 'rgba(230,242,242,0.5)',
              },
              '& .MuiDataGrid-columnHeaders': {
                fontSize: '1rem',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'semibold',
              },
              '& .MuiDataGrid-main > *:first-of-type': {
                borderTopRightRadius: '0px',
                borderTopLeftRadius: '0px',
              },
            }}
          />
        </Grid>
      </Grid>
    </AuthorizationCheck>
  );
};

export default ProjectHistoryPage;
