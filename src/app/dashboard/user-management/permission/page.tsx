'use client';
import * as React from 'react';
import { Button, Box, Grid } from '@mui/material';
import { styled } from '@mui/system';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter, GridRenderCellParams } from '@mui/x-data-grid';
import AuthorizationCheck from '@/components/AuthorizationCheck';
import { permissionCode } from '@/utils/permissionCode';

interface RowData {
  id: number;
  permissionDescription: string;
}

const rows: RowData[] = [
  { id: 1, permissionDescription: 'Update Any Permissions' },
  { id: 2, permissionDescription: 'Create User' },
  { id: 3, permissionDescription: 'Delete User' },
  { id: 4, permissionDescription: 'View User Details' },
  { id: 5, permissionDescription: 'Update User Profile' },
  { id: 6, permissionDescription: 'Create Role' },
  { id: 7, permissionDescription: 'Delete Role' },
  { id: 8, permissionDescription: 'View Role Details' },
  { id: 9, permissionDescription: 'Update Role Permissions' },
  { id: 10, permissionDescription: 'Create Permission' },
  { id: 11, permissionDescription: 'Delete Permission' },
  { id: 12, permissionDescription: 'View Permission Details' },
  { id: 13, permissionDescription: 'Update Permission' },
  { id: 14, permissionDescription: 'Manage User Roles' },
  { id: 15, permissionDescription: 'Manage Client Roles' },
];

const handleEdit = (row: RowData) => {
  console.log('Edit user:', row);
};

const handleDelete = (row: RowData) => {
  console.log('Delete user:', row);
};

const ActionCell: React.FC<{ row: RowData }> = ({ row }) => (
  <div>
    <Button variant='contained' color='warning' sx={{ borderRadius: '28px' }} onClick={() => handleEdit(row)}>
      <EditIcon />
    </Button>
  </div>
);

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

const CustomToolbar: React.FC = () => (
  <GridToolbarContainer sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <CustomQuickFilter />
  </GridToolbarContainer>
);

const UserManagementPermissionPage = () => {
  const columns: GridColDef[] = React.useMemo(
    () => [
      { field: 'id', headerName: 'ID', cellClassName: 'text-left', flex: 0.5 },
      { field: 'permissionDescription', headerName: 'Permission Description', cellClassName: 'text-left', flex: 5 },
      {
        field: 'action',
        headerName: 'Action',
        flex: 1,
        renderCell: (params: GridRenderCellParams<RowData>) => <ActionCell row={params.row} />,
      },
    ],
    [],
  );

  return (
    <AuthorizationCheck requiredPermissions={permissionCode.denialAllAccess}>
      <Grid container className='w-full h-full'>
        <Grid item xs={12}>
          <Box className='flex justify-between items-center'>
            <h2>Permission</h2>
          </Box>
        </Grid>
        <Grid item xs={12} sx={{ width: '100%', height: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
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
            slots={{ toolbar: CustomToolbar }}
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
            pageSizeOptions={[10]}
            sx={{ width: '100%', height: '100%' }}
          />
        </Grid>
      </Grid>
    </AuthorizationCheck>
  );
};

export default UserManagementPermissionPage;
