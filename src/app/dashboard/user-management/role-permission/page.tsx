'use client';
import React, { useEffect, useState } from 'react';
import { Theme } from '@mui/material/styles';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import OutlinedInput from '@mui/material/OutlinedInput';
import RolePermissionAssign from '@/components/dashboard/role-permission-assign';
import { GroupType, RoleType } from '@/types/role-permission';
import { enqueueSnackbar } from 'notistack';
import { Grid, Box, FormControl, InputLabel, Select, Chip, MenuItem, SelectChangeEvent, Button } from '@mui/material';
import AuthorizationCheck from '@/components/AuthorizationCheck';
import { permissionCode } from '@/utils/permissionCode';
import useCheckFeatureAuthorization from '@/hooks/useCheckFeatureAuthorization';
import HeaderTitle from '@/components/HeaderTitle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const UserManagementRolePermissionPage = () => {
  const [isApply, setApply] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string[]>([]);
  const [selectedPermissionGroup, setSelectedPermissionGroup] = useState<string[]>([]);

  const parsedSelectedRole = selectedRole.map(role => JSON.parse(role) as RoleType);
  const parsedSelectedGroupPermission = selectedPermissionGroup.map(group => JSON.parse(group) as GroupType);

  const {
    data: allRolesData = [],
    refetch,
    isLoading: isRolesDataLoading,
    isError: isAllRolesDataError,
  } = useQuery<RoleType[]>({
    queryKey: ['AllRolesData'],
    queryFn: async () => {
      const res = await axios.get('/api/get-all-roles');
      // console.log('Initial Fetch All Role', res.data.data.roles);
      return res.data.data.roles;
    },
  });

  const {
    data: allGroupPermissionsData = [],
    isLoading: isAllGroupPermissionsDataLoading,
    isError: isAllGroupPermissionsDataError,
  } = useQuery<GroupType[]>({
    queryKey: ['AllPermissionsData'],
    queryFn: async () => {
      const res = await axios.get('/api/get-all-permissions');
      // console.log('Initial Fetch All Role', res.data.data.groups);
      return res.data.data.groups;
    },
  });

  const handleRoleChange = (event: SelectChangeEvent<typeof selectedRole>) => {
    const {
      target: { value },
    } = event;
    const stringifyRole = typeof value === 'string' ? value.split(',') : value;
    // @ts-ignore
    // value.length != 0 && console.log('Value Selected Role', JSON.parse(value));
    setSelectedRole(stringifyRole);
  };

  const handlePermissionGroupChange = (event: SelectChangeEvent<typeof selectedPermissionGroup>) => {
    const {
      target: { value },
    } = event;
    const stringifyPermissionGroup = typeof value === 'string' ? value.split(',') : value;
    setSelectedPermissionGroup(stringifyPermissionGroup);
  };

  const handleOnApply = () => {
    if (selectedRole.length === 0 || selectedPermissionGroup.length === 0) {
      alert('Please select Role and Permission Group');
      return;
    }
    setApply(true);
  };

  return (
    <AuthorizationCheck requiredPermissions={permissionCode.updateRolePermission}>
      {useCheckFeatureAuthorization(permissionCode.updateRolePermission) && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <HeaderTitle icon={<AdminPanelSettingsIcon color='primary' sx={{ fontSize: '1.4rem' }} />} title='Role Permission' />
          </Grid>
          <Grid item xs={12}>
            <FormControl sx={{ width: '100%', marginBottom: 2 }}>
              <InputLabel id='role-label'>Role</InputLabel>
              <Select
                id='roles'
                labelId='role-label'
                multiple
                value={selectedRole}
                label='Role'
                onChange={handleRoleChange}
                MenuProps={MenuProps}
                input={<OutlinedInput id='roles' label='Chip' />}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(value => {
                      const role = JSON.parse(value) as RoleType;
                      return <Chip key={role.id} label={role.role_name} />;
                    })}
                  </Box>
                )}>
                {allRolesData.map(role => (
                  <MenuItem key={role.id} value={JSON.stringify(role)}>
                    {role.role_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl sx={{ width: '100%', marginBottom: 2 }}>
              <InputLabel id='permission-group-label'>Permission Group</InputLabel>
              <Select
                id='permission-group'
                labelId='permission-group-label'
                multiple
                value={selectedPermissionGroup}
                onChange={handlePermissionGroupChange}
                MenuProps={MenuProps}
                input={<OutlinedInput id='permission-group' label='Permission Group' />}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(groups => {
                      const group = JSON.parse(groups) as GroupType;
                      return <Chip key={group.id} label={group.group_name} />;
                    })}
                  </Box>
                )}>
                {allGroupPermissionsData.map(group => (
                  <MenuItem key={group.id} value={JSON.stringify(group)}>
                    {group.group_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                className='btn'
                variant='contained'
                onClick={() => handleOnApply()}
                sx={{ fontSize: '1rem', textTransform: 'capitalize' }}>
                Apply
              </Button>
            </Box>
          </Grid>
          {isApply && (
            <Grid item xs={12}>
              <RolePermissionAssign
                onRefetch={refetch}
                selectedRole={parsedSelectedRole}
                selectedGroupPermission={parsedSelectedGroupPermission}
                setSelectedRoleOnParent={setSelectedRole}
              />
            </Grid>
          )}
        </Grid>
      )}
    </AuthorizationCheck>
  );
};

export default UserManagementRolePermissionPage;
