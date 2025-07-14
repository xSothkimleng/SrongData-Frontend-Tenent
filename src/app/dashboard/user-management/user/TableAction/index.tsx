import { useEffect, useState } from 'react';
import { UserProfile } from '@/types/user';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Chip,
  DialogActions,
  Button,
} from '@mui/material';
import useLang from '@/store/lang';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import showSnackbar from '@/utils/snackbarHelper';
import { GetContext } from '@/utils/language';

interface UserManagementTableActionProps {
  row: UserProfile;
  allRoles: any;
  canEditUser: boolean;
  canDeleteUser: boolean;
}

const UserManagementTableAction: React.FC<UserManagementTableActionProps> = ({ row, allRoles, canEditUser, canDeleteUser }) => {
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const lang = useLang(state => state.lang);
  const queryClient = useQueryClient();
  const [editFirstName, setEditFirstName] = useState(row.first_name);
  const [editLastName, setEditLastName] = useState(row.last_name);
  const [editEmail, setEditEmail] = useState(row.email);
  const [selectedEditRole, setEditSelectedRole] = useState([]);
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [openDeleteUserDialog, setOpenDeleteUserDialog] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    // @ts-ignore
    const selected = allRoles.filter(role => row.roles.includes(role.id));
    setEditSelectedRole(selected);
  }, [row, allRoles]);

  const editUserMutation = useMutation({
    mutationFn: async (data: any) => {
      // console.log('Update Role API', row.id);
      const encodedIds = encodeURIComponent(`${row.id}`);
      const response = await axios.put(`/api/update-user/${encodedIds}`, data);
      return response.data;
    },
    onSuccess: data => {
      //@ts-ignore
      queryClient.invalidateQueries(['fetchAllUsersPage']);
      setOpenEditUserDialog(false);
      showSnackbar(data.message, 'success');
    },
    onError: error => {
      console.error('Error approving request:', error);
      showSnackbar(error.message, 'error');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      // console.log('Delete Role API', row.id);
      const encodedIds = encodeURIComponent(`${row.id}`);
      const response = await axios.delete(`/api/delete-user/${encodedIds}`);
      return response.data;
    },
    onSuccess: data => {
      //@ts-ignore
      queryClient.invalidateQueries(['fetchAllUsersPage']);
      showSnackbar(data.message, 'success');
    },
    onError: error => {
      console.error('Error approving request:', error);
      showSnackbar(error.message, 'error');
    },
  });

  const handleEdit = (row: UserProfile) => {
    setOpenEditUserDialog(true);
  };

  const handleDeleteUser = () => {
    deleteUserMutation.mutate();
  };

  const handleEditUser = () => {
    if (editFirstName && editLastName && editEmail && selectedEditRole.length > 0) {
      // @ts-ignore
      const selectedRole = selectedEditRole.map(role => role.id);
      editUserMutation.mutate({
        first_name: editFirstName,
        last_name: editLastName,
        email: editEmail,
        roles: selectedRole,
      });
    } else {
      showSnackbar('Please select all required fields.', 'warning');
    }
  };

  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    // @ts-ignore
    const selected = allRoles.filter(role => value.includes(role.id));
    setEditSelectedRole(selected);
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
        {canEditUser && (
          <MenuItem onClick={() => handleEdit(row)}>
            <ListItemIcon>
              <ManageAccountsIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Manage User</ListItemText>
          </MenuItem>
        )}
        {canDeleteUser && (
          <MenuItem onClick={() => setOpenDeleteUserDialog(true)}>
            <ListItemIcon>
              <DeleteIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Remove User</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <Dialog fullWidth maxWidth='sm' open={openEditUserDialog} onClose={() => setOpenEditUserDialog(!openEditUserDialog)}>
        <DialogTitle className='flex justify-between items-center'>
          <p>{GetContext('edit_user', lang)}</p>{' '}
          <IconButton onClick={() => setOpenEditUserDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                required
                label={GetContext('first_name', lang)}
                variant='filled'
                fullWidth
                value={editFirstName}
                onChange={e => setEditFirstName(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                required
                label={GetContext('last_name', lang)}
                variant='filled'
                fullWidth
                value={editLastName}
                onChange={e => setEditLastName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl sx={{ width: '100%', marginBottom: 2 }}>
                <InputLabel id='user-filter-label'>{GetContext('role', lang)}</InputLabel>
                <Select
                  required
                  labelId='user-filter-label'
                  id='users-filter'
                  multiple
                  variant='filled'
                  // @ts-ignore
                  value={selectedEditRole.map(role => role?.id)}
                  onChange={handleRoleChange}
                  renderValue={selectedIds => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedEditRole.map(role => (
                        // @ts-ignore
                        <Chip key={role.id} label={role.role_name} />
                      ))}
                    </Box>
                  )}>
                  {/* @ts-ignore */}
                  {allRoles?.map(role => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.role_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='flex justify-center'>
          <Button variant='contained' onClick={() => handleEditUser()}>
            {GetContext('edit', lang)}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog fullWidth maxWidth='xs' open={openDeleteUserDialog} onClose={() => setOpenDeleteUserDialog(!openDeleteUserDialog)}>
        <DialogTitle>
          <p>{GetContext('delete_user', lang)}</p>
        </DialogTitle>
        <DialogContent>{GetContext('delete_msg', lang)}</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteUserDialog(false)}>{GetContext('cancel', lang)}</Button>
          <Button variant='contained' onClick={() => handleDeleteUser()} color='secondary'>
            {GetContext('delete', lang)}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementTableAction;
