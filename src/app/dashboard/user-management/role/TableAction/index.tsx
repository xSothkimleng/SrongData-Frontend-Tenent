import { useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  TextField,
  DialogActions,
  Button,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import showSnackbar from '@/utils/snackbarHelper';
import useLang from '@/store/lang';
import { GetContext } from '@/utils/language';
import ViewRoleDetailCard from '@/components/dashboard/view-role-detail-card';
import ConfirmationDialog from '@/components/dashboard/confirmation-dialog';

interface RoleType {
  id: string;
  role_name: string;
  role_description: string;
  permissions: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface RoleTableActionProps {
  row: RoleType;
  canUpdateRole: boolean;
  canDeleteRole: boolean;
  canViewRole: boolean;
}

const RoleTableAction: React.FC<RoleTableActionProps> = ({ row, canUpdateRole, canDeleteRole, canViewRole }) => {
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const lang = useLang(state => state.lang);
  const queryClient = useQueryClient();
  const [roleNameEdit, setRoleNameEdit] = useState(row.role_name);
  const [roleDescriptionEdit, setRoleDescriptionEdit] = useState(row.role_description);
  const [openEditRoleDialog, setOpenEditRoleDialog] = useState(false);
  const [openViewRoleDialog, setOpenViewRoleDialog] = useState(false);
  const [openDeleteRoleDialog, setOpenDeleteRoleDialog] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const editRoleMutation = useMutation({
    mutationFn: async (data: any) => {
      const encodedIds = encodeURIComponent(`${row.id}`);
      const response = await axios.put(`/api/update-role/${encodedIds}`, data);
      return response.data;
    },
    onSuccess: data => {
      //@ts-ignore
      queryClient.invalidateQueries(['allRoles']);
      showSnackbar(data.message, 'success');
      setOpenEditRoleDialog(false);
    },
    onError: error => {
      console.error('Error updating role:', error);
      showSnackbar(error.message, 'error');
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async () => {
      const encodedIds = encodeURIComponent(`${row.id}`);
      const response = await axios.delete(`/api/delete-role/${encodedIds}`);
      return response.data;
    },
    onSuccess: data => {
      //@ts-ignore
      queryClient.invalidateQueries(['allRoles']);
      showSnackbar(data.message, 'success');
      setOpenDeleteRoleDialog(false);
    },
    onError: error => {
      console.error('Error deleting role:', error);
      showSnackbar(error.message, 'error');
    },
  });

  const handleEdit = () => {
    handleClose();
    setOpenEditRoleDialog(true);
  };

  const handleView = () => {
    handleClose();
    setOpenViewRoleDialog(true);
  };

  const handleDelete = () => {
    handleClose();
    setOpenDeleteRoleDialog(true);
  };

  const handleEditRole = () => {
    if (!roleNameEdit || !roleDescriptionEdit) {
      showSnackbar('Please fill all required fields.', 'warning');
      return;
    }
    editRoleMutation.mutate({ role_name: roleNameEdit, role_description: roleDescriptionEdit });
  };

  const handleDeleteRole = () => {
    deleteRoleMutation.mutate();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-left',
        height: '100%',
      }}>
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
        {canViewRole && (
          <MenuItem onClick={handleView}>
            <ListItemIcon>
              <RemoveRedEyeIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>View Role Detail</ListItemText>
          </MenuItem>
        )}
        {canUpdateRole && (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Edit Role</ListItemText>
          </MenuItem>
        )}
        {canDeleteRole && (
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Delete Role</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Edit Role Dialog */}
      <Dialog fullWidth maxWidth='sm' open={openEditRoleDialog} onClose={() => setOpenEditRoleDialog(false)}>
        <DialogTitle className='flex justify-between items-center'>
          <p>{GetContext('edit_role', lang)}</p>
          <IconButton onClick={() => setOpenEditRoleDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                label={GetContext('role_name', lang)}
                variant='filled'
                fullWidth
                value={roleNameEdit}
                onChange={e => setRoleNameEdit(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                label={GetContext('role_description', lang)}
                variant='filled'
                fullWidth
                value={roleDescriptionEdit}
                onChange={e => setRoleDescriptionEdit(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='flex justify-center'>
          <Button variant='contained' onClick={handleEditRole} disabled={editRoleMutation.isPending}>
            {GetContext('edit', lang)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Role Dialog */}
      <Dialog fullScreen open={openViewRoleDialog} onClose={() => setOpenViewRoleDialog(false)}>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton edge='start' color='inherit' onClick={() => setOpenViewRoleDialog(false)} aria-label='close'>
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
              {GetContext('view_role_detail', lang)}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ padding: '2%' }}>
          <ViewRoleDetailCard id={row.id} />
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        title='Delete Role Confirmation'
        message='Are you sure you want to delete this role?'
        open={openDeleteRoleDialog}
        onClose={() => setOpenDeleteRoleDialog(false)}
        onConfirm={handleDeleteRole}
      />
    </Box>
  );
};

export default RoleTableAction;
