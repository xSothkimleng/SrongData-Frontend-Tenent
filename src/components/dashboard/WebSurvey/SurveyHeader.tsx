import React from 'react';
import { Box, Typography } from '@mui/material';

interface SurveyHeaderProps {
  title: string;
  page?: string;
}

const SurveyHeader: React.FC<SurveyHeaderProps> = ({ title, page }) => {
  return (
    <Box
      sx={theme => ({
        p: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: theme.palette.primary.main,
        color: 'white',
      })}>
      <Typography variant='h6'>{title}</Typography>
      <Typography variant='subtitle1' sx={{ background: '#38a093', px: 2, borderRadius: 2 }}>
        {page}
      </Typography>
    </Box>
  );
};

export default SurveyHeader;
