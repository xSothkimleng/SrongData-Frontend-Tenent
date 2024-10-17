'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Box } from '@mui/material';
import AuthorizationCheck from '@/components/AuthorizationCheck';
import { permissionCode } from '@/utils/permissionCode';
const Map = dynamic(() => import('@/components/dashboard/map'), { ssr: false });

const projectList = ['Project 1', 'Project 2', 'Project 3', 'Project 4', 'Project 5'];

const MapPage = () => {
  const [selectedProject, setSelectedProject] = React.useState('');

  const handleProjectChange = (event: SelectChangeEvent<string>) => {
    setSelectedProject(event.target.value);
  };

  return (
    <AuthorizationCheck requiredPermissions={permissionCode.denialAllAccess}>
      <main>
        <Box>
          <FormControl sx={{ minWidth: ' 100%', marginBottom: 2 }}>
            <InputLabel id='project-filter-label'>
              {selectedProject == '' ? 'Please Select Project to see map activity' : 'Selected Project'}{' '}
            </InputLabel>
            <Select
              variant='standard'
              labelId='project-filter-label'
              id='last-name-filter'
              value={selectedProject}
              label='Last Name'
              onChange={handleProjectChange}>
              <MenuItem value=''>
                <em>All</em>
              </MenuItem>
              {projectList.map(item => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box>{selectedProject && <Map />}</Box>
      </main>
    </AuthorizationCheck>
  );
};

export default MapPage;
