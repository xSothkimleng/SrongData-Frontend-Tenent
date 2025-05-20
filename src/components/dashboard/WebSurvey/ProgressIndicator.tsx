import { Box } from '@mui/material';

const ProgressIndicator = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <Box sx={{ width: '100%', height: 4, bgcolor: '#eee', borderRadius: 2 }}>
      <Box
        sx={{
          height: '100%',
          width: `${progress}%`,
          bgcolor: '#6b5de3',
          borderRadius: 2,
          transition: 'width 0.3s ease-in-out',
        }}
      />
    </Box>
  );
};

export default ProgressIndicator;
