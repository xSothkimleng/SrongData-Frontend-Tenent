'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { styled } from '@mui/system';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridRenderCellParams,
  GridFilterModel,
  GridSlots,
} from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogActions,
  TextField,
  IconButton,
  DialogContent,
  AppBar,
  Toolbar,
  Typography,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import ViewRoleDetailCard from '@/components/dashboard/view-role-detail-card';
import AuthorizationCheck from '@/components/AuthorizationCheck';
import { permissionCode } from '@/utils/permissionCode';
import useCheckFeatureAuthorization from '@/hooks/useCheckFeatureAuthorization';
import showSnackbar from '@/utils/snackbarHelper';
import useLang from '@/store/lang';
import { GetContext } from '@/utils/language';
import HeaderTitle from '@/components/HeaderTitle';
import Groups3Icon from '@mui/icons-material/Groups3';
import CustomToolbar from '@/components/DataGridToolbar';
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

interface TransformedRole extends RoleType {
  index_id: number;
  role_id: string;
}

const ActionCell: React.FC<{ row: RoleType; canUpdateRole: boolean; canDeleteRole: boolean; canViewRole: boolean }> = ({
  row,
  canUpdateRole,
  canDeleteRole,
  canViewRole,
}) => {
  const lang = useLang(state => state.lang);
  const queryClient = useQueryClient();
  const [roleNameEdit, setRoleNameEdit] = useState(row.role_description);
  const [roleDescriptionEdit, setRoleDescriptionEdit] = useState(row.role_description);
  const [openEditRoleDialog, setOpenEditRoleDialog] = useState(false);
  const [openViewRoleDialog, setOpenViewRoleDialog] = useState(false);
  const [openDeleteRoleDialog, setOpenDeleteRoleDialog] = useState(false);

  const editRoleMutation = useMutation({
    mutationFn: async (data: any) => {
      // console.log('Update Role API', row.id);
      const encodedIds = encodeURIComponent(`${row.id}`);
      const response = await axios.put(`/api/update-role/${encodedIds}`, data);
      return response.data;
    },
    onSuccess: data => {
      setRoleNameEdit('');
      setRoleDescriptionEdit('');
      //@ts-ignore
      queryClient.invalidateQueries(['allRoles']);
      showSnackbar(data.message, 'success');
      setOpenEditRoleDialog(false);
    },
    onError: error => {
      console.error('Error approving request:', error);
      showSnackbar(error.message, 'error');
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async () => {
      // console.log('Delete Role API', row.id);
      const encodedIds = encodeURIComponent(`${row.id}`);
      const response = await axios.delete(`/api/delete-role/${encodedIds}`);
      return response.data;
    },
    onSuccess: data => {
      //@ts-ignore
      queryClient.invalidateQueries(['allRoles']);
      showSnackbar(data.message, 'success');
    },
    onError: error => {
      console.error('Error approving request:', error);
      showSnackbar(error.message, 'error');
    },
  });

  const handleEditRole = () => {
    if (!roleNameEdit || !roleDescriptionEdit) return;
    editRoleMutation.mutate({ role_name: roleNameEdit, role_description: roleDescriptionEdit });
  };

  const handleDeleteRole = () => {
    if (!row.id) return;
    deleteRoleMutation.mutate();
  };

  return (
    <div>
      {canUpdateRole && (
        <Tooltip title='Edit Role Detail'>
          <Button variant='contained' color='primary' sx={{ borderRadius: '28px' }} onClick={() => setOpenEditRoleDialog(true)}>
            <EditIcon />
          </Button>
        </Tooltip>
      )}
      {canDeleteRole && (
        <Tooltip title='Delete Role'>
          <Button
            variant='contained'
            color='secondary'
            sx={{ borderRadius: '28px', margin: '0 0.5rem' }}
            // onClick={() => handleDeleteRole()}
            onClick={() => setOpenDeleteRoleDialog(true)}>
            <DeleteIcon />
          </Button>
        </Tooltip>
      )}
      {canViewRole && (
        <Tooltip title='View Role Detail'>
          <Button variant='contained' color='info' sx={{ borderRadius: '28px' }} onClick={() => setOpenViewRoleDialog(true)}>
            <RemoveRedEyeIcon />
          </Button>
        </Tooltip>
      )}
      <Dialog fullWidth maxWidth='sm' open={openEditRoleDialog} onClose={() => setOpenEditRoleDialog(!openEditRoleDialog)}>
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

      <ConfirmationDialog
        title='Delete Role Confirmation'
        message='Are you sure you sur, you want to delete this role ?'
        open={openDeleteRoleDialog}
        onClose={() => setOpenDeleteRoleDialog(false)}
        onConfirm={handleDeleteRole}
      />
    </div>
  );
};

const CustomQuickFilter = styled(GridToolbarQuickFilter)(({ theme }) => ({
  width: '100%',
  padding: '1rem 0',
  '& .MuiSvgIcon-root': {
    fontSize: '2rem !important',
    color: theme.palette.primary.main,
  },
  '& .MuiInputBase-input': {
    fontSize: '1.5rem !important',
  },
}));

const UserManagementRolePage = () => {
  const lang = useLang(state => state.lang);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [openCreateRoleDialog, setOpenCreateRoleDialog] = useState(false);
  const queryClient = useQueryClient();
  const canEditRole = useCheckFeatureAuthorization(permissionCode.updateRolePermission);
  const canDeleteRole = useCheckFeatureAuthorization(permissionCode.deleteRole);
  const canViewRole = useCheckFeatureAuthorization(permissionCode.viewUsersInRole);
  const [rowSize, setRowSize] = useState<number>(0);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: [''],
  });
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });

  const fetchAllRoles = async () => {
    let query = '';
    if (filterModel.quickFilterValues && filterModel.quickFilterValues.length > 0) {
      query = filterModel.quickFilterValues[0];
    }
    const res = await axios.get('/api/config', {
      params: {
        endpoint: `role/all?page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}&query=${query}`,
      },
    });
    setRowSize(res.data.data.count);
    return res.data.data.roles;
  };

  const columns: GridColDef[] = React.useMemo(
    () => [
      {
        field: 'index_id',
        headerName: GetContext('no', lang),
        cellClassName: 'text-left',
        flex: 0.3,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'role_name',
        headerName: GetContext('role_name', lang),
        cellClassName: 'text-left',
        flex: 1,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'role_description',
        headerName: GetContext('role_description', lang),
        cellClassName: 'text-left',
        headerAlign: 'left',
        flex: 2,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'action',
        headerName: GetContext('action', lang),
        flex: 1,
        headerClassName: 'super-app-theme--header',
        renderCell: (params: GridRenderCellParams<RoleType>) => (
          <ActionCell row={params.row} canUpdateRole={canEditRole} canDeleteRole={canDeleteRole} canViewRole={canViewRole} />
        ),
      },
    ],
    [canDeleteRole, canEditRole, canViewRole, lang],
  );

  const {
    data: roleData = [],
    isLoading: isFetchingRoleData,
    isError,
    refetch: refetchRoleData,
  } = useQuery<RoleType[]>({
    queryKey: ['allRoles', filterModel, paginationModel],
    queryFn: fetchAllRoles,
  });

  const createRoleMutation = useMutation<unknown, Error, any>({
    mutationFn: async (data: any) => {
      const res = await axios.post('/api/create-role', data);
      return res.data;
    },
    onSuccess: async data => {
      // @ts-ignore
      showSnackbar(data.message, 'success');
      refetchRoleData();
      setOpenCreateRoleDialog(false);
      setRoleName('');
      setRoleDescription('');
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.error?.message ?? 'Error creating role', 'error');
      console.error('Error creating row:', error);
    },
  });

  const handleCreateRole = () => {
    if (!roleName || !roleDescription) {
      return;
    } else {
      console.log('Role Name:', roleName);
      console.log('Role Description:', roleDescription);
      createRoleMutation.mutate({ role_name: roleName, role_description: roleDescription });
    }
  };

  // ts-ignore
  const transformedRoleData: TransformedRole[] = roleData.map((role: RoleType, index: number) => ({
    ...role,
    index_id: paginationModel.page * paginationModel.pageSize + index + 1,
    role_id: role.id,
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

  return (
    <AuthorizationCheck requiredPermissions={permissionCode.viewRole}>
      <Grid container className='w-full h-full'>
        <Grid item xs={12}>
          <Box className='flex justify-between items-center mb-4'>
            <HeaderTitle icon={<Groups3Icon color='primary' sx={{ fontSize: '1.4rem' }} />} title={GetContext('role', lang)} />
            {useCheckFeatureAuthorization(permissionCode.createRole) && (
              <div>
                <Button
                  variant='contained'
                  startIcon={<AddCircleOutlineOutlinedIcon />}
                  sx={{ borderRadius: '14px', fontSize: '1rem' }}
                  onClick={() => setOpenCreateRoleDialog(true)}>
                  {GetContext('create_role', lang)}
                </Button>
              </div>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} sx={{ width: '100%', height: '100%' }} className='boxShadow-1 border-1'>
          <DataGrid
            rows={transformedRoleData}
            columns={columns}
            rowCount={rowSize}
            paginationMode='server'
            paginationModel={paginationModel}
            filterModel={filterModel}
            filterMode='server'
            loading={isFetchingRoleData}
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
            columnVisibilityModel={{
              action: canEditRole || canDeleteRole || canViewRole ? true : false,
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
        </Grid>
        <Dialog
          fullWidth
          maxWidth='sm'
          open={openCreateRoleDialog}
          onClose={() => setOpenCreateRoleDialog(!openCreateRoleDialog)}>
          <DialogTitle className='flex justify-between items-center'>
            <p>{GetContext('create_role', lang)}</p>{' '}
            <IconButton onClick={() => setOpenCreateRoleDialog(false)}>
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
                  value={roleName}
                  onChange={e => setRoleName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  label={GetContext('role_description', lang)}
                  variant='filled'
                  fullWidth
                  value={roleDescription}
                  onChange={e => setRoleDescription(e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions className='flex justify-center'>
            <Button variant='contained' onClick={handleCreateRole} disabled={createRoleMutation.isPending}>
              {GetContext('create', lang)}
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </AuthorizationCheck>
  );
};

export default UserManagementRolePage;
