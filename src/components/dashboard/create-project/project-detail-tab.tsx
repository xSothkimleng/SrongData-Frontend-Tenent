'use client';
import React from 'react';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';
import CoolTextInput from '@/components/customButton';
import { Box, Grid, Typography, TextField, Switch } from '@mui/material';

interface ProjectDetailTabProps {
  projectTitle: string;
  setProjectTitle: (title: string) => void;
  projectDescription: string;
  setProjectDescription: (description: string) => void;
  isLocalizationEnabled: boolean;
  setIsLocalizationEnabled: (isEnabled: boolean) => void;
}

const ProjectDetailTab: React.FC<ProjectDetailTabProps> = ({
  projectTitle,
  setProjectTitle,
  projectDescription,
  setProjectDescription,
  isLocalizationEnabled,
  setIsLocalizationEnabled,
}) => {
  const lang = useLang(state => state.lang);

  const handleLocalization = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLocalizationEnabled(event.target.checked);
  };

  return (
    <Box component='form'>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Switch checked={isLocalizationEnabled} onChange={handleLocalization} inputProps={{ 'aria-label': 'controlled' }} />
            <Typography variant='body1' sx={{ display: 'inline-block' }}>
              Enable Localization
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            required
            sx={{ width: isLocalizationEnabled ? '50%' : '100%' }}
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
          {isLocalizationEnabled && (
            <TextField
              required
              sx={{ width: '50%' }}
              id='outlined-required'
              label='ឈ្មោះគម្រោង'
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
          )}
        </Grid>
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            required
            multiline
            sx={{ width: isLocalizationEnabled ? '50%' : '100%' }}
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
          {isLocalizationEnabled && (
            <TextField
              required
              multiline
              sx={{ width: '50%' }}
              id='outlined-multiline-static'
              rows={10}
              label='ព័ត៌មានលំអិតនៃគម្រោង'
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
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectDetailTab;
