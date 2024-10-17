'use client';
import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { styled } from '@mui/system';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CloseIcon from '@mui/icons-material/Close';
import { enqueueSnackbar } from 'notistack';
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
  Box,
  Grid,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  SelectChangeEvent,
  IconButton,
  Tooltip,
} from '@mui/material';
import AuthorizationCheck from '@/components/AuthorizationCheck';
import { permissionCode } from '@/utils/permissionCode';
import { UserProfile } from '@/types/user';
import useCheckFeatureAuthorization from '@/hooks/useCheckFeatureAuthorization';
import useLang from '@/store/lang';
import { GetContext } from '@/utils/language';
import CustomDataGrid from '@/components/CustomDataGrid';
import HeaderTitle from '@/components/HeaderTitle';
import CustomToolbar from '@/components/DataGridToolbar';
import Groups3Icon from '@mui/icons-material/Groups3';
import showSnackbar from '@/utils/snackbarHelper';

const fetchAllRoles = async () => {
  const res = await axios.get('/api/get-all-roles');
  // console.log('role fetch', res.data.data.roles);
  return res.data.data.roles;
};

const inviteUser = async (body: any): Promise<any> => {
  // console.log('invite user:', body);
  const response = await axios.post('/api/invite-user', body);
  // console.log('invite user response:', response.data);
  return response.data;
};

const ActionCell: React.FC<{ row: UserProfile; allRoles: any; canEditUser: boolean; canDeleteUser: boolean }> = ({
  row,
  allRoles,
  canEditUser,
  canDeleteUser,
}) => {
  const lang = useLang(state => state.lang);
  const queryClient = useQueryClient();
  const [editFirstName, setEditFirstName] = useState(row.first_name);
  const [editLastName, setEditLastName] = useState(row.last_name);
  const [editEmail, setEditEmail] = useState(row.email);
  const [selectedEditRole, setEditSelectedRole] = useState([]);
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [openDeleteUserDialog, setOpenDeleteUserDialog] = useState(false);

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
    // console.log('Edit user:', row);
    setOpenEditUserDialog(true);
  };

  const handleDeleteUser = () => {
    // console.log('Delete user:', row.id);
    deleteUserMutation.mutate();
  };

  const handleEditUser = () => {
    // console.log('Edit user:', editFirstName, editLastName, editEmail, selectedEditRole);
    if (editFirstName && editLastName && editEmail && selectedEditRole.length > 0) {
      // @ts-ignore
      const selectedRole = selectedEditRole.map(role => role.id);
      // console.log('selectedRole:', selectedRole);
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
    <div>
      {canEditUser && (
        <Tooltip title='Manage User'>
          <Button variant='contained' color='primary' sx={{ borderRadius: '28px' }} onClick={() => handleEdit(row)}>
            <ManageAccountsIcon />
          </Button>
        </Tooltip>
      )}
      {canDeleteUser && (
        <Tooltip title='Remove User'>
          <Button
            variant='contained'
            color='secondary'
            sx={{ borderRadius: '28px', margin: '0 0.5rem' }}
            onClick={() => setOpenDeleteUserDialog(true)}>
            <DeleteIcon />
          </Button>
        </Tooltip>
      )}
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
    </div>
  );
};

const UserManagementUserPage = () => {
  const lang = useLang(state => state.lang);
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [selectedRole, setSelectedRole] = useState([]);
  const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false);
  const canViewRole = useCheckFeatureAuthorization(permissionCode.viewRole);
  const canEditUser = useCheckFeatureAuthorization(permissionCode.updateUserInfo);
  const canDeleteUser = useCheckFeatureAuthorization(permissionCode.deleteUser);
  const [rowSize, setRowSize] = useState<number>(0);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: [''],
  });
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });

  const fetchAllUsers = async () => {
    let query = '';
    if (
      filterModel.quickFilterValues &&
      filterModel.quickFilterValues.length > 0 &&
      filterModel.quickFilterValues[0].length > 2
    ) {
      query = filterModel.quickFilterValues[0];
    }
    const res = await axios.get('/api/config', {
      params: {
        endpoint: `user/all?status=1,2&page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}&query=${query}`,
      },
    });
    setRowSize(res.data.data.count);
    return res.data.data.user;
  };

  const {
    data: allUser = [],
    isLoading: isTableLoading,
    isError: isUserError,
    refetch: refetchAllUser,
  } = useQuery<UserProfile[], Error>({
    queryKey: ['fetchAllUsersPage', paginationModel, filterModel],
    queryFn: fetchAllUsers,
    //@ts-ignore
    onSuccess: (data: any) => {},
  });

  const {
    data: allRole = [],
    isLoading: isRoleLoading,
    isError: isRoleError,
    refetch: refetchRole,
  } = useQuery<string[], Error>({
    queryKey: ['fetchAllRoles'],
    queryFn: fetchAllRoles,
    //@ts-ignore
    onSuccess: (data: any) => {
      // console.log('role success', data);
    },
    enabled: canViewRole,
  });

  const inviteUserMutation = useMutation<unknown, Error, any>({
    mutationFn: inviteUser,
    onSuccess: async data => {
      setOpenCreateUserDialog(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setSelectedRole([]);
      refetchAllUser();
      // @ts-ignore
      enqueueSnackbar(data.message, { variant: 'success' });
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.error?.message || 'Internal Server Error', 'error');
      console.error('Error calibrating project:', error);
    },
  });

  const handleInviteUser = () => {
    if (email && lastName && firstName && selectedRole.length > 0) {
      inviteUserMutation.mutate({
        email: email,
        first_name: firstName,
        last_name: lastName,
        // @ts-ignore
        role: selectedRole.map(role => role.id),
      });
    } else {
      showSnackbar('Please select all required fields.', 'warning');
    }
  };

  const columns: GridColDef[] = useMemo(() => {
    const getRoleName = (tableRoleId: string) => {
      // @ts-ignore
      const role = allRole?.find(role => role.id === tableRoleId);
      return role?.role_name;
    };

    return [
      {
        field: 'index_id',
        headerName: GetContext('no', lang),
        cellClassName: 'text-left',
        flex: 0.3,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'first_name',
        headerName: GetContext('first_name', lang),
        cellClassName: 'text-left',
        flex: 0.8,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'last_name',
        headerName: GetContext('last_name', lang),
        cellClassName: 'text-left',
        flex: 0.8,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'email',
        headerName: GetContext('email', lang),
        cellClassName: 'text-left',
        headerAlign: 'left',
        flex: 1.2,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'phone_number',
        headerName: GetContext('phone', lang),
        cellClassName: 'text-left',
        flex: 0.8,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'status_str',
        headerName: GetContext('status', lang),
        type: 'string',
        width: 200,
        headerClassName: 'super-app-theme--header',
        renderCell: (params: any) => {
          let backgroundColor;
          let textColor;
          let textStatus;

          switch (params.value) {
            case GetContext('active', lang):
              backgroundColor = 'rgba(0, 255, 0, 0.1)';
              textColor = 'green';
              textStatus = GetContext('active', lang);
              break;
            case GetContext('pending', lang):
              backgroundColor = 'rgba(77,171,245,0.1)';
              textColor = 'rgb(77,171,245)';
              textStatus = GetContext('pending', lang);
              break;
          }

          return (
            <Box>
              <Box component='span' sx={{ backgroundColor, color: textColor, borderRadius: '24px', padding: '0.3rem 0.8rem' }}>
                {textStatus}
              </Box>
            </Box>
          );
        },
      },
      {
        field: 'roles',
        headerName: GetContext('role', lang),
        cellClassName: 'text-left',
        flex: 0.8,
        headerClassName: 'super-app-theme--header',
        renderCell: (params: GridRenderCellParams<UserProfile>) => {
          // console.log('params:', params);
          return (
            <Box>
              {params.value.map((role: string, index: number) => {
                return (
                  <Box key={index} display='inline-block' mr={1}>
                    <span className='bg-[rgba(0,0,0,0.1)] px-[0.8rem] py-[0.5rem] rounded-[24px]'>{getRoleName(role)}</span>
                  </Box>
                );
              })}
            </Box>
          );
        },
      },
      {
        field: 'action',
        headerName: GetContext('action', lang),
        flex: 1.2,
        headerClassName: 'super-app-theme--header',
        renderCell: (params: GridRenderCellParams<UserProfile>) => {
          return <ActionCell row={params.row} allRoles={allRole} canDeleteUser={canDeleteUser} canEditUser={canEditUser} />;
        },
      },
    ];
  }, [allRole, canDeleteUser, canEditUser, lang]);

  // @ts-ignore
  const transformedData = allUser?.map((user, index) => ({
    ...user,
    status_str: user.status == 1 ? GetContext('active', lang) : GetContext('pending', lang),
    index_id: paginationModel.page * paginationModel.pageSize + index + 1,
    user_id: user.user_id,
  }));

  const handleUserChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    // @ts-ignore
    const selected = allRole.filter(role => value.includes(role.id));
    setSelectedRole(selected);
  };

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

  return (
    <AuthorizationCheck requiredPermissions={permissionCode.viewUser}>
      <Grid container className='w-full h-full'>
        {useCheckFeatureAuthorization(permissionCode.createUser) && (
          <Grid item xs={12}>
            <Box className='flex justify-between items-center mb-4'>
              <HeaderTitle icon={<Groups3Icon color='primary' sx={{ fontSize: '1.4rem' }} />} title={GetContext('user', lang)} />
              <Button
                variant='contained'
                startIcon={<PersonAddIcon />}
                onClick={() => setOpenCreateUserDialog(true)}
                sx={{ borderRadius: '14px', fontSize: '1rem' }}>
                {GetContext('invite_user', lang)}
              </Button>
            </Box>
            <Dialog
              fullWidth
              maxWidth='sm'
              open={openCreateUserDialog}
              onClose={() => setOpenCreateUserDialog(!openCreateUserDialog)}>
              <DialogTitle className='flex justify-between items-center'>
                <p>{GetContext('invite_user', lang)}</p>{' '}
                <IconButton onClick={() => setOpenCreateUserDialog(false)}>
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
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      required
                      label={GetContext('last_name', lang)}
                      variant='filled'
                      fullWidth
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      label={GetContext('email', lang)}
                      variant='filled'
                      type='email'
                      fullWidth
                      value={email}
                      onChange={e => setEmail(e.target.value)}
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
                        value={selectedRole.map(role => role.id)}
                        onChange={handleUserChange}
                        renderValue={selectedIds => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selectedRole.map(role => (
                              // @ts-ignore
                              <Chip key={role.id} label={role.role_name} />
                            ))}
                          </Box>
                        )}>
                        {/* @ts-ignore */}
                        {allRole.map(role => (
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
                <Button variant='contained' onClick={handleInviteUser} disabled={inviteUserMutation.isPending}>
                  {GetContext('invite', lang)}
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
        )}
        <Grid item xs={12} sx={{ width: '100%', height: '100%' }} className='border-1 boxShadow-1'>
          <DataGrid
            autoHeight
            rows={transformedData}
            columns={columns}
            loading={isTableLoading}
            rowCount={rowSize}
            paginationMode='server'
            paginationModel={paginationModel}
            filterModel={filterModel}
            filterMode='server'
            onPaginationModelChange={setPaginationModel}
            onFilterModelChange={handleFilterModelChange}
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            disableRowSelectionOnClick
            disableColumnSorting
            disableColumnMenu
            columnVisibilityModel={{
              roles: canViewRole,
              action: canEditUser || canDeleteUser ? true : false,
            }}
            slots={{ toolbar: CustomToolbar, loadingOverlay: LinearProgress as GridSlots['loadingOverlay'] }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
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
            pageSizeOptions={[10, 25, 50, 100]}
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
          {/* <CustomDataGrid
            rows={transformedData}
            columns={columns}
            rowCount={rowSize}
            loading={isTableLoading}
            paginationModel={paginationModel}
            filterModel={filterModel}
            onPaginationModelChange={setPaginationModel}
            onFilterModelChange={handleFilterModelChange}
            columnVisibilityModel={{
              roles: canViewRole,
              action: canEditUser || canDeleteUser ? true : false,
            }}
            pageSizeOptions={[10, 25, 50, 100]}
          /> */}
        </Grid>
      </Grid>
    </AuthorizationCheck>
  );
};

export default UserManagementUserPage;
