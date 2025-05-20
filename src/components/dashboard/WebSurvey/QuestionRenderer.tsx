import { Box, TextField, Typography, Radio, RadioGroup, FormControlLabel, Checkbox, FormGroup } from '@mui/material';

const QuestionRenderer = ({ question }) => {
  const { type, label, required, options } = question;

  // Helper to render the required asterisk
  const requiredMarker = required ? (
    <Typography component='span' color='error' sx={{ ml: 0.5 }}>
      *
    </Typography>
  ) : null;

  const renderQuestionContent = () => {
    switch (type) {
      case 'text':
        return <TextField fullWidth placeholder='Your answer' variant='outlined' size='small' sx={{ mt: 1 }} />;

      case 'text_area':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder='Best answer in own pls, ty newbies...'
            variant='outlined'
            size='small'
            sx={{ mt: 1 }}
          />
        );

      case 'single':
        return (
          <RadioGroup sx={{ mt: 1 }}>
            {options?.map((option, index) => (
              <FormControlLabel
                key={index}
                value={option}
                control={<Radio size='small' />}
                label={option}
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.9rem',
                  },
                }}
              />
            ))}
          </RadioGroup>
        );

      case 'multiple':
        return (
          <FormGroup sx={{ mt: 1 }}>
            {options?.map((option, index) => (
              <FormControlLabel
                key={index}
                control={<Checkbox size='small' />}
                label={option}
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.9rem',
                  },
                }}
              />
            ))}
          </FormGroup>
        );

      default:
        return <Typography color='error'>Unknown question type: {type}</Typography>;
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant='body1' fontWeight='medium'>
        {label}
        {requiredMarker}
      </Typography>
      {renderQuestionContent()}
    </Box>
  );
};

export default QuestionRenderer;
