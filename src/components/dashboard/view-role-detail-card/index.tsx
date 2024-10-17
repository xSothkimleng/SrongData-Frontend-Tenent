import React, { useState } from 'react';
import { styled } from '@mui/system';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Role, RoleDetail, Permission } from '@/types/roleDetail';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridRenderCellParams,
  GridSlots,
} from '@mui/x-data-grid';
import { Grid, Typography, Box, Tabs, Tab, LinearProgress } from '@mui/material';
import useLang from '@/store/lang';
import { GetContext } from '@/utils/language';
import CustomToolbar from '@/components/DataGridToolbar';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface UserRoleData {
  count: number;
  user: User[];
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  dob: string;
  phone_number: string;
  password: string;
  profile: string;
  tenant_id: string;
  roles: string[];
  password_changed: boolean;
  status: number;
  is_master: boolean;
  created_at: string;
  updated_at: string;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 0, marginTop: '0rem' }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

type ViewRoleDetailCardProps = {
  id: string;
};

const fetchRoleDetails = async (id: string): Promise<RoleDetail> => {
  const response = await axios.get('/api/config', {
    params: { endpoint: `role/detail/${id}` },
  });

  const { role, permissions } = response.data.data;

  const transformedPermissions = permissions.map((permission: Permission, index: number) => ({
    ...permission,
    index: index + 1,
  }));

  return {
    role,
    permissions: transformedPermissions,
  };
};

const fetchRoleUserDetails = async (id: string): Promise<UserRoleData> => {
  const response = await axios.get('/api/config', {
    params: { endpoint: `role/${id}/users` },
  });

  console.log('User Role', response.data.data);

  const { count, user } = response.data.data;

  const transformedUsers = user.map((user: User, index: number) => ({
    ...user,
    index: index + 1,
  }));

  console.log('Transformed Data', {
    count,
    user: transformedUsers,
  });

  return {
    count,
    user: transformedUsers,
  };
};

const ViewRoleDetailCard: React.FC<ViewRoleDetailCardProps> = ({ id }) => {
  const lang = useLang(state => state.lang);
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const {
    data: roleDetailData,
    isLoading: isFetchingPermissionData,
    isError: isPermissionDataError,
  } = useQuery<RoleDetail>({
    queryKey: ['RoleDetailData', id],
    queryFn: () => fetchRoleDetails(id),
  });

  const {
    data: roleUserDetailData,
    isLoading: isFetchingRoleUserData,
    isError: isRoleUserError,
  } = useQuery<UserRoleData>({
    queryKey: ['RoleUserDetailData', id],
    queryFn: () => fetchRoleUserDetails(id),
  });

  const columns: GridColDef[] = React.useMemo(
    () => [
      {
        field: 'index',
        headerName: GetContext('no', lang),
        cellClassName: 'text-left',
        flex: 0.3,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'permission_name',
        headerName: GetContext('name', lang),
        cellClassName: 'text-left',
        flex: 1,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'permission_description',
        headerName: GetContext('description', lang),
        cellClassName: 'text-left',
        headerAlign: 'left',
        flex: 2,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'action',
        headerName: GetContext('action', lang),
        cellClassName: 'text-left',
        headerAlign: 'left',
        flex: 2,
        headerClassName: 'super-app-theme--header',
      },
    ],
    [lang],
  );

  const userColumns: GridColDef[] = React.useMemo(
    () => [
      {
        field: 'index',
        headerName: GetContext('no', lang),
        cellClassName: 'text-left',
        flex: 0.3,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'first_name',
        headerName: GetContext('first_name', lang),
        cellClassName: 'text-left',
        flex: 1,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'last_name',
        headerName: GetContext('last_name', lang),
        cellClassName: 'text-left',
        headerAlign: 'left',
        flex: 2,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'email',
        headerName: GetContext('email', lang),
        cellClassName: 'text-left',
        headerAlign: 'left',
        flex: 2,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'dob',
        headerName: GetContext('dob', lang),
        cellClassName: 'text-left',
        headerAlign: 'left',
        flex: 2,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'phone_number',
        headerName: GetContext('phone', lang),
        cellClassName: 'text-left',
        headerAlign: 'left',
        flex: 2,
        headerClassName: 'super-app-theme--header',
      },
    ],
    [lang],
  );

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant='h4' className='font-bold'>
          {roleDetailData?.role.role_name}
        </Typography>
        <Typography variant='h6' className='text-slate-400'>
          {roleDetailData?.role.role_description}
        </Typography>
      </Grid>
      <Grid item xs={12} className='mt-[2rem]'>
        <Box sx={{ width: '100%' }} className='boxShadow-1'>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label='basic tabs example'>
              <Tab label={GetContext('permission', lang)} {...a11yProps(0)} />
              <Tab label={GetContext('user', lang)} {...a11yProps(1)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <DataGrid
              rows={roleDetailData?.permissions ?? []}
              columns={columns}
              loading={isFetchingPermissionData}
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
              pageSizeOptions={[10]}
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
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <DataGrid
              rows={roleUserDetailData?.user ?? []}
              columns={userColumns}
              loading={isFetchingRoleUserData}
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
              pageSizeOptions={[10]}
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
          </CustomTabPanel>
        </Box>
      </Grid>
    </Grid>
  );
};

export default ViewRoleDetailCard;
