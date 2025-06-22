import React from 'react';
import { Box, Button } from '@mui/material';

interface NavigationControlsProps {
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  showPrevious: boolean;
  showNext: boolean;
  showSubmit: boolean;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onNext,
  onPrevious,
  onSubmit,
  showPrevious,
  showNext,
  showSubmit,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        mb: 1,
      }}>
      {showPrevious ? (
        <Button
          variant='outlined'
          onClick={onPrevious}
          sx={{
            flex: 1,
            borderRadius: 4,
            py: 1,
          }}>
          Previous
        </Button>
      ) : (
        <Box sx={{ flex: 1 }} />
      )}

      {showNext && (
        <Button
          variant='contained'
          onClick={onNext}
          sx={theme => ({
            flex: 1,
            borderRadius: 2,
            py: 1,
            bgcolor: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
          })}>
          Next
        </Button>
      )}

      {showSubmit && (
        <Button
          variant='contained'
          onClick={onSubmit}
          sx={theme => ({
            flex: 1,
            borderRadius: 4,
            py: 1,
            bgcolor: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
          })}>
          Submit
        </Button>
      )}
    </Box>
  );
};

export default NavigationControls;
