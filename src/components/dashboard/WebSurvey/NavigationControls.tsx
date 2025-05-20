import { Box, Button } from '@mui/material';

const NavigationControls = ({ onNext, onPrevious, onSubmit, showPrevious, showNext, showSubmit }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        mb: 2,
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
          sx={{
            flex: 1,
            borderRadius: 4,
            py: 1,
            bgcolor: '#6b5de3',
            '&:hover': {
              bgcolor: '#5a4ec2',
            },
          }}>
          Next
        </Button>
      )}

      {showSubmit && (
        <Button
          variant='contained'
          onClick={onSubmit}
          sx={{
            flex: 1,
            borderRadius: 4,
            py: 1,
            bgcolor: '#6b5de3',
            '&:hover': {
              bgcolor: '#5a4ec2',
            },
          }}>
          Submit
        </Button>
      )}
    </Box>
  );
};

export default NavigationControls;
