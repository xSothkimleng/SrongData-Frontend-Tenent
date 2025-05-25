'use client';
import React from 'react';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';
import {
  DataCollectionMethodType,
  PROJECT_DATA_COLLECTION_METHOD,
  ProjectDescription,
  ProjectDetail,
} from '@/types/projectDetail';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Switch,
  Divider,
  Checkbox,
  FormControlLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
} from '@mui/material';

interface ProjectDetailTabProps {
  projectTitle: ProjectDetail;
  setProjectTitle: (name: ProjectDetail) => void;
  projectDescription: ProjectDescription;
  setProjectDescription: (description: ProjectDescription) => void;
  isSurveyLanguageInEnglish: boolean;
  setIsSurveyLanguageInEnglish: (isEnabled: boolean) => void;
  isSurveyLanguageInKhmer: boolean;
  setIsSurveyLanguageInKhmer: (isEnabled: boolean) => void;
  dataCollectionMethod: DataCollectionMethodType;
  setDataCollectionMethod: (method: DataCollectionMethodType) => void;
}

const ProjectDetailTab: React.FC<ProjectDetailTabProps> = ({
  projectTitle,
  setProjectTitle,
  projectDescription,
  setProjectDescription,
  isSurveyLanguageInEnglish,
  setIsSurveyLanguageInEnglish,
  isSurveyLanguageInKhmer,
  setIsSurveyLanguageInKhmer,
  dataCollectionMethod,
  setDataCollectionMethod,
}) => {
  const lang = useLang(state => state.lang);

  const handleChangeDataCollectionType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDataCollectionMethod({
      method: (event.target as HTMLInputElement).value,
      isRequiredNID: dataCollectionMethod.isRequiredNID || false,
    });
  };

  const handleSetEnglishLanguageSurvey = (_event: React.SyntheticEvent, checked: boolean) => {
    setIsSurveyLanguageInEnglish(checked);
  };

  const handleSetKhmerLanguageSurvey = (_event: React.SyntheticEvent, checked: boolean) => {
    setIsSurveyLanguageInKhmer(checked);
  };

  const handleSetCapiRequiredNid = (_event: React.SyntheticEvent, checked: boolean) => {
    setDataCollectionMethod({
      ...dataCollectionMethod,
      isRequiredNID: checked,
    });
  };

  return (
    <Box component='form'>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant='body1' sx={{ display: 'inline-block' }}>
            Survey Language
          </Typography>
          <Box>
            <FormControlLabel
              control={<Checkbox />}
              checked={isSurveyLanguageInEnglish}
              onChange={handleSetEnglishLanguageSurvey}
              label='English'
            />
          </Box>
          <Box>
            <FormControlLabel
              control={<Checkbox />}
              checked={isSurveyLanguageInKhmer}
              onChange={handleSetKhmerLanguageSurvey}
              label='Khmer'
            />
          </Box>
        </Grid>

        {isSurveyLanguageInEnglish || isSurveyLanguageInKhmer ? (
          <>
            <Grid item xs={12}>
              <Typography variant='body1' sx={{ display: 'inline-block' }}>
                Survey Method
              </Typography>
              <Box>
                <FormControl>
                  <RadioGroup
                    aria-labelledby='demo-controlled-radio-buttons-group'
                    name='controlled-radio-buttons-group'
                    value={dataCollectionMethod.method}
                    onChange={handleChangeDataCollectionType}>
                    <FormControlLabel
                      value={PROJECT_DATA_COLLECTION_METHOD.CAPI}
                      control={<Radio />}
                      label='Computer-Assisted Personal Interviewing (CAPI)'
                    />
                    {dataCollectionMethod.method === PROJECT_DATA_COLLECTION_METHOD.CAPI && (
                      <Box sx={{ marginLeft: '3rem' }}>
                        <Typography variant='body1'>Setting</Typography>
                        <FormControlLabel
                          control={<Switch checked={dataCollectionMethod.isRequiredNID} onChange={handleSetCapiRequiredNid} />}
                          label='Required ID'
                        />
                      </Box>
                    )}
                    <FormControlLabel
                      value={PROJECT_DATA_COLLECTION_METHOD.WEB}
                      control={<Radio />}
                      label='Web-based Survey Questionnaire'
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isSurveyLanguageInEnglish && (
                <TextField
                  required
                  sx={{ width: isSurveyLanguageInKhmer ? '50%' : '100%' }}
                  id='outlined-required'
                  label={GetContext('project_name', lang)}
                  value={projectTitle.en}
                  onChange={e => setProjectTitle({ en: e.target.value, km: projectTitle.km })}
                  inputProps={{ minLength: 3, maxLength: 200 }}
                  helperText={
                    <div className='flex justify-between'>
                      <Typography className='text-[14px]'>{GetContext('project_name_msg', lang)}</Typography>
                      <Typography color='textSecondary' className='text-[14px]'>
                        {projectTitle.en?.length}/200
                      </Typography>
                    </div>
                  }
                />
              )}
              {isSurveyLanguageInKhmer && (
                <TextField
                  required
                  sx={{ width: isSurveyLanguageInEnglish ? '50%' : '100%' }}
                  id='outlined-required'
                  label='ឈ្មោះគម្រោង'
                  value={projectTitle.km}
                  onChange={e => setProjectTitle({ en: projectTitle.en, km: e.target.value })}
                  inputProps={{ minLength: 3, maxLength: 200 }}
                  helperText={
                    <div className='flex justify-between'>
                      <Typography className='text-[14px]'>{GetContext('project_name_msg', lang)}</Typography>
                      <Typography color='textSecondary' className='text-[14px]'>
                        {projectTitle.km?.length}/200
                      </Typography>
                    </div>
                  }
                />
              )}
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isSurveyLanguageInEnglish && (
                <TextField
                  required
                  multiline
                  sx={{ width: isSurveyLanguageInKhmer ? '50%' : '100%' }}
                  id='outlined-multiline-static'
                  rows={10}
                  label={GetContext('project_description', lang)}
                  value={projectDescription.en}
                  onChange={e => setProjectDescription({ en: e.target.value, km: projectDescription.km })}
                  inputProps={{ minLength: 3, maxLength: 500 }}
                  helperText={
                    <div className='flex justify-between'>
                      <Typography className='text-[14px]'>{GetContext('project_name_msg', lang)}</Typography>
                      <Typography className='text-[14px]' color='textSecondary'>
                        {projectDescription.en?.length}/500
                      </Typography>
                    </div>
                  }
                />
              )}
              {isSurveyLanguageInKhmer && (
                <TextField
                  required
                  multiline
                  sx={{ width: isSurveyLanguageInEnglish ? '50%' : '100%' }}
                  id='outlined-multiline-static'
                  rows={10}
                  label='ព័ត៌មានលំអិតនៃគម្រោង'
                  value={projectDescription.km}
                  onChange={e => setProjectDescription({ en: projectDescription.en, km: e.target.value })}
                  inputProps={{ minLength: 3, maxLength: 500 }}
                  helperText={
                    <div className='flex justify-between'>
                      <Typography className='text-[14px]'>{GetContext('project_name_msg', lang)}</Typography>
                      <Typography className='text-[14px]' color='textSecondary'>
                        {projectDescription.km?.length}/500
                      </Typography>
                    </div>
                  }
                />
              )}
            </Grid>
          </>
        ) : (
          <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            Please Select a Language To Continue
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ProjectDetailTab;
