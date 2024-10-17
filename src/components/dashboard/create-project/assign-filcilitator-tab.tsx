import React, { useEffect, useState } from 'react';
import { Grid, FormControl, Select, InputLabel, MenuItem, Box, Chip, SelectChangeEvent } from '@mui/material';
import usePersistentState from '@/hooks/usePersistentState';
import { UserProfile } from '@/types/user';
import { usePathname } from 'next/navigation';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';

interface AssignFacilitatorTabProps {
  facilitators: UserProfile[];
  setFacilitators: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  assignedUserId?: string[];
}

const AssignFacilitatorTab: React.FC<AssignFacilitatorTabProps> = ({ facilitators, setFacilitators, assignedUserId }) => {
  const lang = useLang(state => state.lang);
  const pathname = usePathname();
  const [selectedUsersPersisted, setSelectedUsersPersisted] = usePersistentState<UserProfile[]>('selectedUsers', []);
  const [selectedUsersNotPersisted, setSelectedUsersNotPersisted] = useState<UserProfile[]>([]);
  const [isPathnameCreateProject, setIsPathnameCreateProject] = useState<boolean>(false);
  const [currentFacilitators, setCurrentFacilitators] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (pathname === '/dashboard/create-project') {
      setIsPathnameCreateProject(true);
    } else {
      setIsPathnameCreateProject(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (assignedUserId && assignedUserId.length > 0) {
      const selected = facilitators.filter(user => assignedUserId.includes(user.id));
      setSelectedUsersNotPersisted(selected);
      setFacilitators(selected);
    }
  }, [assignedUserId, facilitators, setFacilitators]);

  useEffect(() => {
    if (isPathnameCreateProject) {
      setCurrentFacilitators(selectedUsersPersisted);
    } else {
      setCurrentFacilitators(selectedUsersNotPersisted);
    }
  }, [isPathnameCreateProject, selectedUsersPersisted, selectedUsersNotPersisted]);

  const handleUserChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    const selected = facilitators.filter(user => value.includes(user.id));

    if (isPathnameCreateProject) {
      setSelectedUsersPersisted(selected);
    } else {
      setSelectedUsersNotPersisted(selected);
    }

    setFacilitators(selected);
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <FormControl sx={{ width: '100%', marginBottom: 2 }}>
          <InputLabel id='user-filter-label'>{GetContext('user', lang)}</InputLabel>
          <Select
            multiple
            labelId='user-filter-label'
            id='users-filter'
            variant='standard'
            value={currentFacilitators.map(user => user.id)}
            onChange={handleUserChange}
            renderValue={selected => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map(userId => {
                  const user = facilitators.find(fac => fac.id === userId);
                  if (user) {
                    return <Chip key={user.id} label={`${user.last_name} ${user.first_name}`} />;
                  }
                  return null;
                })}
              </Box>
            )}>
            {facilitators.map(user => (
              <MenuItem key={user.id} value={user.id}>
                {`${user.last_name} ${user.first_name}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default AssignFacilitatorTab;
