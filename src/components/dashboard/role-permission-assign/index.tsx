import React, { use, useEffect } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { RoleType, GroupType } from '@/types/role-permission';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
  List,
  ListItemButton,
  FormControlLabel,
  Checkbox,
  Collapse,
  Card,
  CardHeader,
  CardContent,
  Button,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

interface RolePermissionAssignProps {
  selectedRole: RoleType[];
  selectedGroupPermission: GroupType[];
  setSelectedRoleOnParent: any;
  onRefetch: any;
}

const TooltipHelpBox: React.FC<{ description: string }> = ({ description }) => {
  return (
    <Card>
      <CardHeader>
        <Typography color='primary'>Description</Typography>
      </CardHeader>
      <CardContent>
        <Typography>{description}</Typography>
      </CardContent>
    </Card>
  );
};

const RolePermissionAssign: React.FC<RolePermissionAssignProps> = ({ selectedRole, selectedGroupPermission, setSelectedRoleOnParent, onRefetch }) => {
  const [open, setOpen] = React.useState<{ [key: string]: boolean }>({});
  const [checked, setChecked] = React.useState<{ [roleId: string]: { [groupId: string]: { [permissionId: string]: boolean } } }>(
    {},
  );

  useEffect(() => {
    const initializeCheckedState = () => {
      const initialCheckedState: { [roleId: string]: { [groupId: string]: { [permissionId: string]: boolean } } } = {};

      selectedRole.forEach(role => {
        initialCheckedState[role.id] = {};
        selectedGroupPermission.forEach(group => {
          initialCheckedState[role.id][group.id] = {};
          group.permissions.forEach(permission => {
            initialCheckedState[role.id][group.id][permission.id] = role.permissions.includes(permission.id);
          });
        });
      });

      setChecked(initialCheckedState);
    };

    initializeCheckedState();
    console.log('Selected Role', selectedRole);
  }, [selectedRole, selectedGroupPermission]);

  const updateRoleMutation = useMutation<unknown, Error, any>({
    mutationFn: async (data: any) => {
      const encodedIds = encodeURIComponent(`${data.roleId}`);
      const res = await axios.put(`/api/update-role/${encodedIds}`, data);
      return res.data;
    },
    onSuccess: async data => {
      // console.log('invite successful:', data);
      // @ts-ignore
      enqueueSnackbar(data.message, { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.error?.message || 'Error Updating Role', {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
      console.error('Error Updating Role:', error);
    },
  });

  const handleSubmit = () => {
    // console.log('Checked State', checked);
    const collectedCheckedPermission = Object.entries(checked).map(([roleId, group]) => {
      const permissions = Object.entries(group)
        .map(([groupId, permission]) => {
          return Object.entries(permission)
            .map(([permissionId, isChecked]) => {
              return isChecked ? permissionId : null;
            })
            .filter(permissionId => permissionId !== null);
        })
        .filter(group => group.length > 0);

      return { roleId, permissions: permissions.flat() };
    });

    // console.log('Collected Checked Permission', collectedCheckedPermission);

    const updateRoles = async () => {
      try {
        // Create an array of promises
        const promises = collectedCheckedPermission.map(rolePermission => updateRoleMutation.mutateAsync(rolePermission));

        // Wait for all promises to resolve
        await Promise.all(promises);
        enqueueSnackbar('All roles updated successfully', { variant: 'success' });
        onRefetch();
        setSelectedRoleOnParent([]);
      } catch (error) {
        enqueueSnackbar('Error updating one or more roles', {
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
        });
        console.error('Error Updating Role:', error);
      }
    };

    updateRoles();
  };

  const handleParentChange =
    (roleId: string, groupId: string, permissionIds: string[]) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.target.checked;
      const newCheckedState = permissionIds.reduce((acc, id) => {
        acc[id] = isChecked;
        return acc;
      }, {} as { [key: string]: boolean });

      setChecked(prev => ({
        ...prev,
        [roleId]: {
          ...prev[roleId],
          [groupId]: newCheckedState,
        },
      }));
    };

  const handleChildChange =
    (roleId: string, groupId: string, permissionId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.target.checked;

      setChecked(prev => ({
        ...prev,
        [roleId]: {
          ...prev[roleId],
          [groupId]: {
            ...prev[roleId]?.[groupId],
            [permissionId]: isChecked,
          },
        },
      }));
    };

  const handleAccordionToggle = (roleId: string, groupId: string) => {
    setOpen(prev => ({ ...prev, [`${roleId}-${groupId}`]: !prev[`${roleId}-${groupId}`] }));
  };

  return (
    selectedRole.length !== 0 &&
    selectedGroupPermission.length !== 0 && (
      <div>
        {selectedRole.map(role => (
          <Accordion key={role.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box>
                <Typography className='text-[1.3rem] font-medium'>{role.role_name}</Typography>
                <Typography className='font-normal'>{role.role_description}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {selectedGroupPermission.map(group => {
                const groupCheckedState = checked[role.id]?.[group.id] || {};
                const allPermissionsChecked = group.permissions.every(permission => groupCheckedState[permission.id]);
                const somePermissionsChecked = group.permissions.some(permission => groupCheckedState[permission.id]);

                return (
                  <List
                    key={group.id}
                    sx={{ width: '100%', bgcolor: 'background.paper' }}
                    component='div'
                    aria-labelledby='nested-list-subheader'>
                    <ListItemButton onClick={() => handleAccordionToggle(role.id, group.id)}>
                      <FormControlLabel
                        label={group.group_name}
                        control={
                          <Checkbox
                            checked={allPermissionsChecked}
                            indeterminate={!allPermissionsChecked && somePermissionsChecked}
                            onChange={handleParentChange(
                              role.id,
                              group.id,
                              group.permissions.map(p => p.id),
                            )}
                          />
                        }
                      />
                      {open[`${role.id}-${group.id}`] ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={open[`${role.id}-${group.id}`]} timeout='auto' unmountOnExit>
                      <List component='div' disablePadding>
                        {group.permissions.map(permission => (
                          <ListItemButton sx={{ pl: 4 }} key={permission.id}>
                            <FormControlLabel
                              label={permission.permission_name}
                              control={
                                <Checkbox
                                  checked={groupCheckedState[permission.id] || false}
                                  onChange={handleChildChange(role.id, group.id, permission.id)}
                                />
                              }
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  </List>
                );
              })}
            </AccordionDetails>
          </Accordion>
        ))}
        <div className='flex justify-end mt-4'>
          <Button variant='contained' onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
    )
  );
};

export default RolePermissionAssign;
