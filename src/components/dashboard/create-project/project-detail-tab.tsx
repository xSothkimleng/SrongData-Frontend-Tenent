'use client';
import React from 'react';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';
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
import { DataCollectionSetting, PROJECT_DATA_COLLECTION_METHOD } from '@/types/projectDetail';

interface ProjectDetailTabProps {
  projectTitle: string;
  setProjectTitle: (title: string) => void;
  projectDescription: string;
  setProjectDescription: (description: string) => void;
  isSurveyLanguageInEnglish: boolean;
  setIsSurveyLanguageInEnglish: (isEnabled: boolean) => void;
  isSurveyLanguageInKhmer: boolean;
  setIsSurveyLanguageInKhmer: (isEnabled: boolean) => void;
  dataCollectionMethod: string;
  setDataCollectionMethod: (method: string) => void;
  dataCollectionSetting: DataCollectionSetting;
  setDataCollectionSetting: (
    setting: DataCollectionSetting | ((prevSetting: DataCollectionSetting) => DataCollectionSetting),
  ) => void;
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
  dataCollectionSetting,
  setDataCollectionSetting,
}) => {
  const lang = useLang(state => state.lang);

  const handleChangeDataCollectionType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDataCollectionMethod((event.target as HTMLInputElement).value);
  };

  const handleSetEnglishLanguageSurvey = (_event: React.SyntheticEvent, checked: boolean) => {
    setIsSurveyLanguageInEnglish(checked);
  };

  const handleSetKhmerLanguageSurvey = (_event: React.SyntheticEvent, checked: boolean) => {
    setIsSurveyLanguageInKhmer(checked);
  };

  const handleCapiSetting = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (checked) {
      setDataCollectionSetting({
        isRequiredNID: checked,
        isAnonymous: false,
      });
    } else {
      setDataCollectionSetting({
        isRequiredNID: false,
        isAnonymous: false,
      });
    }
  };

  const handleWebSetting = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (checked) {
      setDataCollectionSetting({
        isRequiredNID: false,
        isAnonymous: checked,
      });
    } else {
      setDataCollectionSetting({
        isRequiredNID: false,
        isAnonymous: false,
      });
    }
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
                    value={dataCollectionMethod}
                    onChange={handleChangeDataCollectionType}>
                    <FormControlLabel
                      value={PROJECT_DATA_COLLECTION_METHOD.CAPI}
                      control={<Radio />}
                      label='Computer-Assisted Personal Interviewing (CAPI)'
                    />
                    {dataCollectionMethod === PROJECT_DATA_COLLECTION_METHOD.CAPI && (
                      <Box sx={{ marginLeft: '3rem' }}>
                        <Typography variant='body1'>Setting</Typography>
                        <FormControlLabel
                          control={<Switch checked={dataCollectionSetting.isRequiredNID} onChange={handleCapiSetting} />}
                          label='Required NID'
                        />
                      </Box>
                    )}
                    <FormControlLabel
                      value={PROJECT_DATA_COLLECTION_METHOD.WEB}
                      control={<Radio />}
                      label='Web-based Survey Questionnaire'
                    />
                    {dataCollectionMethod === PROJECT_DATA_COLLECTION_METHOD.WEB && (
                      <Box sx={{ marginLeft: '3rem' }}>
                        <Typography variant='body1'>Setting</Typography>
                        <FormControlLabel
                          control={<Switch checked={dataCollectionSetting.isAnonymous} onChange={handleWebSetting} />}
                          label='Anonymous'
                        />
                      </Box>
                    )}
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
              {isSurveyLanguageInKhmer && (
                <TextField
                  required
                  sx={{ width: isSurveyLanguageInEnglish ? '50%' : '100%' }}
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
              {isSurveyLanguageInEnglish && (
                <TextField
                  required
                  multiline
                  sx={{ width: isSurveyLanguageInKhmer ? '50%' : '100%' }}
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
              )}
              {isSurveyLanguageInKhmer && (
                <TextField
                  required
                  multiline
                  sx={{ width: isSurveyLanguageInEnglish ? '50%' : '100%' }}
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
