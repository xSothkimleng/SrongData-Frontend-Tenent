'use client';
import React from 'react';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';
import CoolTextInput from '@/components/customButton';
import { Box, Grid, Typography, TextField } from '@mui/material';

interface ProjectDetailTabProps {
  projectTitle: string;
  setProjectTitle: (title: string) => void;
  projectDescription: string;
  setProjectDescription: (description: string) => void;
}

const ProjectDetailTab: React.FC<ProjectDetailTabProps> = ({
  projectTitle,
  setProjectTitle,
  projectDescription,
  setProjectDescription,
}) => {
  const lang = useLang(state => state.lang);
  return (
    <Box component='form'>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            className='w-full'
            id='outlined-required'
            label={GetContext('project_name', lang)}
            value={projectTitle}
            onChange={e => setProjectTitle(e.target.value)}
            inputProps={{ minLength: 3, maxLength: 200 }}
            helperText={
              <div className='flex justify-between'>
                <Typography className='text-[14px]'>{GetContext('project_name_msg', lang)}</Typography>
                <Typography color='textSecondary' className='text-[14px]'>
                  {projectTitle.length}/200
                </Typography>
              </div>
            }
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            multiline
            className='w-full'
            id='outlined-multiline-static'
            rows={10}
            label={GetContext('project_description', lang)}
            value={projectDescription}
            onChange={e => setProjectDescription(e.target.value)}
            inputProps={{ minLength: 3, maxLength: 500 }}
            helperText={
              <div className='flex justify-between'>
                <Typography className='text-[14px]'>{GetContext('project_name_msg', lang)}</Typography>
                <Typography className='text-[14px]' color='textSecondary'>
                  {projectDescription.length}/500
                </Typography>
              </div>
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectDetailTab;
