import React from 'react';
import { Box } from '@mui/material';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <Box sx={{ width: '100%', height: 5, bgcolor: '#eee', marginTop: 0.3 }}>
      <Box
        sx={theme => ({
          height: '100%',
          width: `${progress}%`,
          bgcolor: theme.palette.primary.main,
          transition: 'width 0.3s ease-in-out',
        })}
      />
    </Box>
  );
};

export default ProgressIndicator;
