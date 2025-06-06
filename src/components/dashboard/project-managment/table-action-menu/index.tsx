'use client';
import useLang from '@/store/lang';
import { UserProfile } from '@/types/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GetContext } from '@/utils/language';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { enqueueSnackbar } from 'notistack';
import CloseIcon from '@mui/icons-material/Close';
import EditProjectPage from '@/components/dashboard/edit-project';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ConfirmationDialog from '@/components/dashboard/confirmation-dialog';
import LinkIcon from '@mui/icons-material/Link';
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
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import useUserStore from '@/store/useUserStore';

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
  code: string | null;
}

const TableActionMenu: React.FC<{
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
  const [openDeleteProjectDialog, setOpenDeleteProjectDialog] = useState(false);
  const [openCloneProjectDialog, setOpenCloneProjectDialog] = useState(false);
  const [openEditProjectDialog, setOpenEditProjectDialog] = useState(false);
  const [openShareLinkDialog, setOpenShareLinkDialog] = useState(false);
  const tenant = useUserStore(state => state.userData);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUpdateProjectStatus = (row: Project) => {
    handleClose();
    // @ts-ignore
    updateProjectStatusMutation.mutate({ projectId: row.projectId });
  };

  const handleAssignUser = () => {
    handleClose();
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
    handleClose();
    router.push(`/dashboard/project-history/project-detail/${projectId}`);
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-left', height: '100%' }}>
      <IconButton
        aria-label='more'
        id='long-button'
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup='true'
        onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        id='long-menu'
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}>
        {/* View Project Details - Always shown */}
        <MenuItem onClick={() => handleMenuItemClick(() => handleViewProject(row.projectId))}>
          <ListItemIcon>
            <VisibilityOutlinedIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>View Project Details</ListItemText>
        </MenuItem>

        {/* Update Project Status */}
        {canUpdateProjectStatus && row.status !== 'Completed' && (
          <MenuItem onClick={() => handleMenuItemClick(() => setOpenProjectStatusDialog(true))}>
            <ListItemIcon>
              <SystemUpdateAltIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>{GetContext('update_project_status', lang)}</ListItemText>
          </MenuItem>
        )}

        {/* Edit Project */}
        {canEditProject && (
          <MenuItem onClick={() => handleMenuItemClick(() => setOpenEditProjectDialog(true))}>
            <ListItemIcon>
              <EditIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>{GetContext('edit_project', lang)}</ListItemText>
          </MenuItem>
        )}

        {/* Assign User */}
        {canAssignUser && row.status !== 'Completed' && (
          <MenuItem onClick={() => handleMenuItemClick(handleAssignUser)}>
            <ListItemIcon>
              <StopCircleIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>{GetContext('assign_user', lang)}</ListItemText>
          </MenuItem>
        )}

        {/* Clone Project */}
        {canCloneProject && (
          <MenuItem onClick={() => handleMenuItemClick(() => setOpenCloneProjectDialog(true))}>
            <ListItemIcon>
              <FileCopyIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>{GetContext('clone_project', lang)}</ListItemText>
          </MenuItem>
        )}

        {/* Share Link */}
        {row.code != null && (
          <MenuItem onClick={() => handleMenuItemClick(() => setOpenShareLinkDialog(true))}>
            <ListItemIcon>
              <LinkIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Share Link</ListItemText>
          </MenuItem>
        )}

        {/* Delete Project */}
        {canDeleteProject && (
          <MenuItem onClick={() => handleMenuItemClick(() => setOpenDeleteProjectDialog(true))}>
            <ListItemIcon>
              <DeleteIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>{GetContext('delete_project', lang)}</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* All the existing dialogs remain the same */}
      {/* Assign User Dialog */}
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
      {/* update Project Status Dialog */}
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
      {/* delete Project Dialog */}
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
      {/* Clone Project Dialog */}
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
      {/* Edit Project Dialog */}
      <Dialog fullScreen open={openEditProjectDialog} onClose={() => setOpenEditProjectDialog(false)}>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton edge='start' color='inherit' onClick={() => setOpenEditProjectDialog(false)} aria-label='close'>
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
              {/* {GetContext('edit_project_title', lang)} {row.name} */}
              Edit Project
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ padding: '2%' }}>
          <div>Edit Project</div>
          <EditProjectPage projectId={row.projectId} setOpenEditProjectDialog={setOpenEditProjectDialog} />
        </Box>
      </Dialog>
      {/* share link dialog */}
      <Dialog fullWidth maxWidth='md' open={openShareLinkDialog} onClose={() => setOpenShareLinkDialog(!openShareLinkDialog)}>
        <DialogTitle>
          <p>Share Link</p>
        </DialogTitle>
        <DialogContent>
          {' '}
          {process.env.NEXT_PUBLIC_FRONTEND_URL}/survey?s={row.code}&t={tenant?.tenant?.id}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenShareLinkDialog(false)}>{GetContext('cancel', lang)}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TableActionMenu;
